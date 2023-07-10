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
    // A1: Jan, B1: Feb, ..., L1: Dec, M1: ALL, N1: Ban
    const sheetValue = await this.googleSheetConnectorService.readRange(
      '1dBCGDIgnBKqVR6WCyIrESQqQzcqhIse0KFOLhCJrHDM',
      'Access!A1:N1',
    );
    const returnVideo = await this.service.getVideo(req.user, sheetValue);
    return returnVideo;
  }
}
