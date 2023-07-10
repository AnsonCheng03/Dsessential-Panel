import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';

@Controller('lesson-replay')
export class LessonReplayController {
  //   constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('video')
  //   http://localhost:3500/lesson-replay/video
  signIn(@Body() signInDto: Record<string, any>) {
    console.log('video');
    return 'aaa';
  }
}

// @Controller('auth')
// export class AuthController {
//   constructor(private authService: AuthService) {}

//   @HttpCode(HttpStatus.OK)
//   @Post('login')
//   signIn(@Body() signInDto: Record<string, any>) {
//     return this.authService.signIn(
//       signInDto.role,
//       signInDto.username,
//       signInDto.password,
//     );
//   }

//   @UseGuards(AuthGuard)
//   @Get('profile')
//   getProfile(@Request() req) {
//     return req.user;
//   }
// }
