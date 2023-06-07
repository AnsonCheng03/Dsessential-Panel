import { compare } from 'bcrypt';
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
        : await this.usersService.userLogin(username);

    if (!user) throw new UnauthorizedException();
    if (role !== 'admin' && !(await compare(pass, user.password)))
      throw new UnauthorizedException();

    const payload = { sub: user.userId, username: user.userId };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
