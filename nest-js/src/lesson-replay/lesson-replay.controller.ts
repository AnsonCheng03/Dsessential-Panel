import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { GoogleSheetConnectorService } from 'nest-google-sheet-connector';
import { LessonReplayService } from './lesson-replay.service';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('lesson-replay')
export class LessonReplayController {
  constructor(
    private googleSheetConnectorService: GoogleSheetConnectorService,
    private readonly service: LessonReplayService,
  ) {}

  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('videoList')
  //   http://localhost:3500/lesson-replay/videoList
  async getVideo(@Request() req) {
    let returnMonth;
    if (process.env.NODE_ENV === 'development') {
      returnMonth = ['1', 'A'];
    } else {
      // A1: Jan, B1: Feb, ..., L1: Dec, M1: ALL, N1: Ban
      const sheetValue = await this.googleSheetConnectorService.readRange(
        '1dBCGDIgnBKqVR6WCyIrESQqQzcqhIse0KFOLhCJrHDM',
        'Access!A1:N1',
      );
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
