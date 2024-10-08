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
import { LogServiceService } from 'src/log-service/log-service.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly logService: LogServiceService,
    private authService: AuthService,
  ) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() signInDto: Record<string, any>) {
    if (!signInDto.username || !signInDto.password) {
      this.logService.logEvent(
        signInDto.username,
        '登入',
        `[${signInDto.role}] ${!signInDto.username ? '帳號' : '密碼'}錯誤`,
      );
      throw new UnauthorizedException();
    }
    this.logService.logEvent(signInDto.username, '登入', signInDto.role);
    return this.authService.signIn(
      signInDto.role,
      signInDto.username,
      signInDto.password,
    );
  }

  @HttpCode(HttpStatus.OK)
  @Post('change-password')
  changePassword(@Body() signInDto: Record<string, any>) {
    this.logService.logEvent(
      signInDto.username,
      'ChangePassword',
      'changePassword',
    );
    return this.authService.changePassword(
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
    this.logService.logEvent(signInDto.username, '登入', 'googleSignIn');
    return this.authService.googleSignIn(signInDto.username);
  }

  @UseGuards(AuthGuard)
  @Post('protected-login')
  protectedLogin(@Request() req) {
    if (req.user.role !== 'admin') throw new UnauthorizedException();

    // add a cookie to the browser to identify its a changeRole request (samesite=strict)
    req.res.cookie('changeRoleServer', 'true', {
      httpOnly: true,
      sameSite: 'strict',
      path: '/',
      secure: true,
    });

    if (req.body.role === 'changeRole') {
      this.logService.logEvent(
        req.user.username,
        '變更身分',
        `${req.body.username} => ${req.body.role}`,
      );
      return this.authService.changeRole(req.body);
    }
    return this.authService.refreshToken(req.user);
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
