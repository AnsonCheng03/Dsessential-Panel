import { Module } from '@nestjs/common';
import { LessonReplayController } from './lesson-replay.controller';
import { LessonReplayService } from './lesson-replay.service';
import { GoogleSheetModule } from 'nest-google-sheet-connector';
import * as googleCredentials from '../google-credentials.json';

@Module({
  imports: [GoogleSheetModule.register(googleCredentials)],
  providers: [LessonReplayService],
  controllers: [LessonReplayController],
})
export class LessonReplayModule {}
