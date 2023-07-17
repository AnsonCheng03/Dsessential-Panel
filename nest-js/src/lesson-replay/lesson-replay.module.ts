import { Module } from '@nestjs/common';
import { LessonReplayController } from './lesson-replay.controller';
import { LessonReplayService } from './lesson-replay.service';

@Module({
  providers: [LessonReplayService],
  controllers: [LessonReplayController],
})
export class LessonReplayModule {}
