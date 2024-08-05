import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { LessonReplayService } from './lesson-replay.service';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import * as fs from 'fs';
import * as path from 'path';

@Controller('lesson-replay')
export class LessonReplayController {
  constructor(private readonly service: LessonReplayService) {}

  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('videoList')
  //   http://localhost:3500/lesson-replay/videoList
  async getVideo(@Request() req) {
    let returnMonth;
    if (req.user.role === 'admin') {
      returnMonth = ['All', 'A'];
    } else {
      // A1: Jan, B1: Feb, ..., L1: Dec, M1: ALL, N1: Ban
      let googleCredentials: { [key: string]: any } = {};
      try {
        const filePath = path.join(
          __dirname,
          `${
            process.env.GOOGLE_CREDENTIALS_PATH || '..'
          }/google-credentials.json`,
        );
        if (fs.existsSync(filePath)) {
          const fileContents = fs.readFileSync(filePath, 'utf-8');
          googleCredentials = JSON.parse(fileContents);
        }
      } catch (error) {
        console.log('error', error);
        googleCredentials = {
          client_email: 'no-email',
          private_key: 'no-key',
        };
      }

      const serviceAccountAuth = new JWT({
        email: googleCredentials.client_email,
        key: googleCredentials.private_key,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });

      const doc = new GoogleSpreadsheet(
        '1dBCGDIgnBKqVR6WCyIrESQqQzcqhIse0KFOLhCJrHDM',
        serviceAccountAuth,
      );
      await doc.loadInfo();
      const sheet = doc.sheetsByTitle['Access'];
      const sheetValue = (await sheet.getCellsInRange('A1:N1'))[0];

      returnMonth = await this.service.getMonth(req.user, sheetValue);
    }
    if (
      returnMonth[0] === 'New' ||
      returnMonth[0] === 'Expired' ||
      returnMonth[0] === 'Not Found'
    )
      return returnMonth;

    const videos = await this.service.getDefaultVideo();
    if (returnMonth[0] === 'Normal') return videos;

    // get video month
    const returnVideo = await this.service.getVideo(
      await this.service.getMonthArray(returnMonth[0]),
      returnMonth[1],
    );

    return { ...videos, ...returnVideo };
  }
}
