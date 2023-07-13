import { Module } from '@nestjs/common';
import { GoogleSheetModule } from 'nest-google-sheet-connector';
import * as googleCredentials from '../google-credentials.json';
import { LessonReplayService } from './lesson-replay.service';
import { LessonReplayController } from './lesson-replay.controller';

@Module({
  imports: [GoogleSheetModule.register(googleCredentials)],
  providers: [LessonReplayService],
  controllers: [LessonReplayController],
})
export class LessonReplayModule {}
