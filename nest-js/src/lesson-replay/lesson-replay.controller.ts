import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('lesson-replay')
export class LessonReplayController {
  //   constructor(private authService: AuthService) {}

  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('videoList')
  //   http://localhost:3500/lesson-replay/videoList
  getVideo(@Request() req) {
    console.log(req.user);
    return 'aaa';
  }
}
