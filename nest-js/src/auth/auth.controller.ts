import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UnauthorizedException,
  UseGuards,
  Ip,
} from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() signInDto: Record<string, any>) {
    if (!signInDto.username || !signInDto.password)
      throw new UnauthorizedException();
    return this.authService.signIn(
      signInDto.role,
      signInDto.username,
      signInDto.password,
    );
  }

  @HttpCode(HttpStatus.OK)
  @Post('google-login')
  googleLogin(@Body() signInDto: Record<string, any>, @Ip() ip: string) {
    if (!this.authService.isIntranetIp(ip)) {
      throw new UnauthorizedException(`Invalid IP: ${ip}`);
    }
    if (signInDto.passkey !== process.env.CROSS_SECRET)
      throw new UnauthorizedException();
    return this.authService.googleSignIn(signInDto.username);
  }

  @UseGuards(AuthGuard)
  @Post('protected-login')
  protectedLogin(@Request() req) {
    if (req.user.role !== 'admin') throw new UnauthorizedException();
    if (req.body.role === 'changeRole')
      return this.authService.changeRole(req.body);
    return this.authService.refreshToken(req.user);
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
