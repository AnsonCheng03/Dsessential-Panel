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
    return {
      token: await this.jwtService.signAsync(payload),
      role: role,
      id: user.userId,
    };
  }
}
