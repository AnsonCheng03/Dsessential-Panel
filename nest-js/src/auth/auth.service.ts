import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signIn(role, username, pass) {
    const user =
      role === 'admin'
        ? await this.usersService.adminLogin(username, pass)
        : await this.usersService.userLogin(username, pass);

    if (!user) throw new UnauthorizedException();

    const payload = {
      sub: user.userId,
      username: user.userId,
      role: role,
    };
    const token = await this.jwtService.signAsync(payload);
    return {
      token: token,
      role: role,
      id: user.userId,
    };
  }

  async changeRole(user) {
    const payload = {
      sub: user.username,
      username: user.username,
      role: 'student',
    };
    const token = await this.jwtService.signAsync(payload);
    console.log('return: ', {
      token: token,
      role: 'student',
      id: user.username,
    });
    return {
      token: token,
      role: 'student',
      id: user.username,
    };
  }

  async refreshToken(user) {
    const payload = {
      sub: user.sub,
      username: user.username,
      role: user.role,
    };
    const newToken = await this.jwtService.signAsync(payload);
    return newToken;
  }
}
