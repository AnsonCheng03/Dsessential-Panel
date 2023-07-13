import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { LessonReplayModule } from './lesson-replay/lesson-replay.module';
import { VideoController } from './video/video.controller';
import { VideoService } from './video/video.service';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    ConfigModule.forRoot(),
    LessonReplayModule,
  ],
  controllers: [AppController, VideoController],
  providers: [AppService, VideoService],
})
export class AppModule {}
