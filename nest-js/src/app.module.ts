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
import { GoogleSheetModule } from 'nest-google-sheet-connector';
import * as googleCredentials from './google-credentials.json';

@Module({
  imports: [
    GoogleSheetModule.register(googleCredentials),
    AuthModule,
    UsersModule,
    ConfigModule.forRoot(),
    LessonReplayModule,
    AttendanceModule,
  ],
  controllers: [AppController, VideoController, AttendanceController],
  providers: [AppService, VideoService, AttendanceService],
})
export class AppModule {}
