import { Injectable } from '@nestjs/common';
import * as ldap from 'ldapjs';
import { createPool } from 'mysql2/promise';

// This should be a real class/interface representing a user entity
export type User = {
  role: string;
  userId: number;
  password: string;
};

@Injectable()
export class UsersService {
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

  async userLogin(username: string): Promise<User | undefined> {
    const connection = await this.pool.getConnection();
    try {
      const [TotalAcc] = await connection.execute(
        'SELECT `SID` as Username FROM `Student` \
        WHERE ? IN(`SID`, `卡內號碼`, `卡號`, `補發卡卡號`, `姓名`, `學生電話`, `家長電話`) LIMIT 1',
        [username],
      );

      const [rows] = await connection.execute(
        'SELECT `Password` FROM `Login` WHERE `SID` = ? LIMIT 1',
        [TotalAcc[0].Username],
      );

      const user = {
        role: 'user',
        userId: TotalAcc[0].Username,
        password: rows[0].Password.replace(/^\$2y(.+)$/i, '$2a$1'),
      };
      return user;
    } catch (err) {
      return undefined;
    } finally {
      connection.release();
    }
  }

  async adminLogin(
    username: string,
    password: string,
  ): Promise<User | undefined> {
    const LDAPclient = ldap.createClient({
      url: process.env.LDAP_URL || 'ldaps://localhost',
      tlsOptions: {
        rejectUnauthorized: false,
      },
    });

    try {
      await new Promise<void>((resolve, reject) => {
        const loginName = `NAS\\${username}`;
        LDAPclient.bind(loginName, password, (error) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });
      });
      const user = {
        role: 'admin',
        userId: parseInt(username),
        password: password,
      };
      return user;
    } catch (error) {
      console.error(error);
      return undefined;
    } finally {
      LDAPclient.unbind();
    }
  }
}
