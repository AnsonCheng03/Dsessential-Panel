import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import * as fs from 'fs';
import * as path from 'path';
import { createPool } from 'mysql2/promise';

@Injectable()
export class CronjobsService {
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

  @Cron(CronExpression.EVERY_3_HOURS)
  async getStudentInfos() {
    const connection = await this.pool.getConnection();
    try {
      let googleCredentials: { [key: string]: any } = {};
      try {
        const filePath = path.join(
          __dirname,
          `${
            process.env.GOOGLE_CREDENTIALS_PATH || '..'
          }/google-credentials.json`,
        );
        if (fs.existsSync(filePath)) {
          const fileContents = fs.readFileSync(filePath, 'utf-8');
          googleCredentials = JSON.parse(fileContents);
        }
      } catch (error) {
        console.log('error', error);
        googleCredentials = {
          client_email: 'no-email',
          private_key: 'no-key',
        };
      }

      const serviceAccountAuth = new JWT({
        email: googleCredentials.client_email,
        key: googleCredentials.private_key,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });

      const doc = new GoogleSpreadsheet(
        '1dBCGDIgnBKqVR6WCyIrESQqQzcqhIse0KFOLhCJrHDM',
        serviceAccountAuth,
      );
      await doc.loadInfo();
      const sheet = doc.sheetsByTitle['Simp_Version'];
      const rows = await sheet.getRows({});
      rows.forEach(async (row) => {
        const rowValues = row.toObject();
        if (
          rowValues.姓名 === undefined ||
          rowValues.SID === undefined ||
          rowValues.姓名 === '' ||
          rowValues.SID === ''
        )
          return;
        const rowArray = Object.values(row.toObject());
        // turn all undefined to null
        for (let i = 0; i < rowArray.length; i++) {
          if (rowArray[i] === undefined) rowArray[i] = null;
        }
        try {
          await connection.execute(
            'REPLACE INTO `Student` \
            (`SID`, `卡內號碼`, `卡號`, `補發卡卡號`, `姓名`, `性別`, `DSE年份`, `稱呼`, `同行者`, `學生電話`, `家長電話`, `Email`, `學校`) \
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ',
            [
              rowArray[0],
              rowArray[1],
              rowArray[2],
              rowArray[3],
              rowArray[4],
              rowArray[5],
              rowArray[6],
              rowArray[7],
              rowArray[8],
              rowArray[9],
              rowArray[10],
              rowArray[11],
              rowArray[12],
            ],
          );
        } catch (err) {
          console.log(err);
        }
      });
      console.log('done importing student info');
    } catch (err) {
      console.log(err);
    } finally {
      connection.release();
    }
  }
}
