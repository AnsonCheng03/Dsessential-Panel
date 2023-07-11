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
    if (process.env.NODE_ENV === 'development') return ['1', 'A'];
    // A1: Jan, B1: Feb, ..., L1: Dec, M1: ALL, N1: Ban
    const sheetValue = await this.googleSheetConnectorService.readRange(
      '1dBCGDIgnBKqVR6WCyIrESQqQzcqhIse0KFOLhCJrHDM',
      'Access!A1:N1',
    );
    const returnMonth = await this.service.getMonth(req.user, sheetValue);
    if (
      returnMonth[0] === 'New' ||
      returnMonth[0] === 'Expired' ||
      returnMonth[0] === 'Not Found'
    )
      return null;

    const videos = this.service.getDefaultVideo();

    if (returnMonth[0] === 'Normal') return videos;
    const returnVideo = await this.service.getVideo(returnMonth);

    return returnVideo;
  }
}
