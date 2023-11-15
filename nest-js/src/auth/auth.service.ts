import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { createPool } from 'mysql2/promise';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  private readonly pool = createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_LOGIN,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

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

  async googleSignIn(username) {
    const payload = {
      uuid: this.generateUUID(),
      sub: username,
      username: username,
      role: 'admin',
    };
    const token = await this.jwtService.signAsync(payload);
    return {
      token: token,
      role: 'admin',
      id: username,
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

  isLocalIPv4(ip: string): boolean {
    const parts = ip.split('.').map((part) => parseInt(part, 10));

    if (parts.length !== 4) return false;

    if (ip === '127.0.0.1') return true;

    // if (parts[0] === 10) return true;

    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;

    if (parts[0] === 192 && parts[1] === 168) return true;

    return false;
  }

  isLocalIPv6(ip: string): boolean {
    if (ip === '::1') return true;

    if (ip.startsWith('fc00:') || ip.startsWith('fd00:')) return true;

    return false;
  }

  isMappedIPv4(ip: string): string | null {
    if (ip.startsWith('::ffff:')) {
      return ip.replace('::ffff:', '');
    }
    return null;
  }

  isIntranetIp(ip: string): boolean {
    if (ip.includes(':')) {
      if (this.isLocalIPv6(ip)) return true;

      const mappedIp = this.isMappedIPv4(ip);
      if (mappedIp) return this.isLocalIPv4(mappedIp);

      return false;
    }

    return this.isLocalIPv4(ip);
  }
}
