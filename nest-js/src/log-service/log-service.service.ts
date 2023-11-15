import { Injectable } from '@nestjs/common';
import { createPool } from 'mysql2/promise';

@Injectable()
export class LogServiceService {
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

  async logEvent(username: string, event: string, notes: string = '') {
    const connection = await this.pool.getConnection();
    try {
      await connection.execute(
        'INSERT INTO `UserEvent` \
        (`UserID`, `Event`, `Notes`) VALUES(?, ?, ?)',
        [username, event, notes],
      );
    } catch (err) {
      console.log(err);
    } finally {
      connection.release();
    }
  }

  async viewLog() {
    const connection = await this.pool.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT * FROM `EventLog` ORDER BY `Date` DESC',
      );
      return rows;
    } catch (err) {
      console.log(err);
    } finally {
      connection.release();
    }
  }
}
