import { Module } from '@nestjs/common';
import { LessonReplayService } from './lesson-replay.service';
import { LessonReplayController } from './lesson-replay.controller';

@Module({
  providers: [LessonReplayService],
  controllers: [LessonReplayController],
})
export class LessonReplayModule {}
