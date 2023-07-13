import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  generateUUID() {
    // Public Domain/MIT
    let d = new Date().getTime(); //Timestamp
    let d2 =
      (typeof performance !== 'undefined' &&
        performance.now &&
        performance.now() * 1000) ||
      0; //Time in microseconds since page-load or 0 if unsupported
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
      /[xy]/g,
      function (c) {
        let r = Math.random() * 16; //random number between 0 and 16
        if (d > 0) {
          //Use timestamp until depleted
          r = (d + r) % 16 | 0;
          d = Math.floor(d / 16);
        } else {
          //Use microseconds since page-load if supported
          r = (d2 + r) % 16 | 0;
          d2 = Math.floor(d2 / 16);
        }
        return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
      },
    );
  }

  async signIn(role, username, pass) {
    const user =
      role === 'admin'
        ? await this.usersService.adminLogin(username, pass)
        : await this.usersService.userLogin(username, pass);

    if (!user) throw new UnauthorizedException();

    const payload = {
      uuid: this.generateUUID(),
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
      uuid: this.generateUUID(),
      sub: user.username,
      username: user.username,
      role: 'student',
    };
    const token = await this.jwtService.signAsync(payload);
    return {
      token: token,
      role: 'student',
      id: user.username,
    };
  }

  async refreshToken(user) {
    const payload = {
      uuid: this.generateUUID(),
      sub: user.sub,
      username: user.username,
      role: user.role,
    };
    const newToken = await this.jwtService.signAsync(payload);
    return {
      token: newToken,
      role: user.role,
      id: user.sub,
    };
  }
}
