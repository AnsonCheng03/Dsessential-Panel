import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() signInDto: Record<string, any>) {
    return this.authService.signIn(
      signInDto.role,
      signInDto.username,
      signInDto.password,
    );
  }

  @UseGuards(AuthGuard)
  @Post('protected-login')
  protectedLogin(@Request() req) {
    if (req.user.role !== 'admin') throw new Error('Unauthorized');
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
