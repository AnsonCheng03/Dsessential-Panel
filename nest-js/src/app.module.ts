import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { LessonReplayModule } from './lesson-replay/lesson-replay.module';
import { VideoController } from './video/video.controller';
import { VideoService } from './video/video.service';
import { AttendanceController } from './attendance/attendance.controller';
import { AttendanceService } from './attendance/attendance.service';
import { AttendanceModule } from './attendance/attendance.module';
import { ScheduleModule } from '@nestjs/schedule';
import { CronjobsModule } from './cronjobs/cronjobs.module';
import { GptGeneratorController } from './gpt-generator/gpt-generator.controller';
import { GptGeneratorService } from './gpt-generator/gpt-generator.service';
import { LogServiceController } from './log-service/log-service.controller';
import { LogServiceService } from './log-service/log-service.service';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    ConfigModule.forRoot(),
    ScheduleModule.forRoot(),
    LessonReplayModule,
    AttendanceModule,
    CronjobsModule,
  ],
  controllers: [
    AppController,
    VideoController,
    AttendanceController,
    GptGeneratorController,
    LogServiceController,
  ],
  providers: [
    AppService,
    VideoService,
    AttendanceService,
    GptGeneratorService,
    LogServiceService,
  ],
})
export class AppModule {}
