import { compare } from 'bcrypt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  async signIn(username, pass) {
    const user = await this.usersService.findOne(username);

    if (
      !user ||
      !await compare(pass, user.password)
    ) {
      throw new UnauthorizedException();
    }

    const payload = { sub: user.userId, username: user.userId };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}