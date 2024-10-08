import { Injectable } from '@nestjs/common';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AttendanceService {
  async initSheet() {
    let googleCredentials: { [key: string]: any } = {};
    try {
      const filePath = `${process.env.GOOGLE_CREDENTIALS_PATH || '..'}/google-credentials.json`;
      if (!fs.existsSync(filePath)) throw new Error('No file found');
      const fileContents = fs.readFileSync(filePath, 'utf-8');
      googleCredentials = JSON.parse(fileContents);
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
      process.env.GOOGLE_SHEET_ATT_FORM_ID ||
        '1V5SY55VS3JIfFkhHHKBWWQbO_aqU9Jc6FDWUq7b6xOg',
      serviceAccountAuth,
    );
    await doc.loadInfo();
    return doc;
  }

  async createData(data: any) {
    const doc = await this.initSheet();
    const sheet = doc.sheetsByTitle['學生報到機2021.8'];

    const result = await sheet.addRow(data, {
      insert: true,
    });

    const rowNumber = result.rowNumber;
    await sheet.loadCells(`N${rowNumber}:P${rowNumber}`);
    let studentData: string | false = false;

    if (!sheet.getCellByA1(`Q${rowNumber}`).errorValue)
      studentData = sheet.getCellByA1(`Q${rowNumber}`).value as string;

    return { rowNumber: rowNumber, studentData };
  }

  async modifyData(rowNumber: string, data: any) {
    const doc = await this.initSheet();
    const sheet = doc.sheetsByTitle['學生報到機2021.8'];
    const rows = await sheet.getRows({
      offset: parseInt(rowNumber) - 2,
      limit: 1,
    });
    rows[0].assign(data);
    await rows[0].save();

    await sheet.loadCells(`N${rowNumber}:P${rowNumber}`);
    let studentData: string | false = false;

    if (!sheet.getCellByA1(`N${rowNumber}`).errorValue)
      studentData = sheet.getCellByA1(`N${rowNumber}`).value as string;
    else if (!sheet.getCellByA1(`O${rowNumber}`).errorValue)
      studentData = sheet.getCellByA1(`O${rowNumber}`).value as string;
    else if (!sheet.getCellByA1(`P${rowNumber}`).errorValue)
      studentData = sheet.getCellByA1(`P${rowNumber}`).value as string;

    return { rowNumber, studentData };
  }

  // Warning: there are bugs to empty rows
  async deleteData(ipAddress: string, username: string, rowNumber: string) {
    const doc = await this.initSheet();
    const sheet = doc.sheetsByTitle['學生報到機2021.8'];
    const rows = await sheet.getRows({
      offset: parseInt(rowNumber) - 2,
      limit: 1,
    });
    if (rows[0].get('IP') !== `${ipAddress}(${username})`)
      throw new Error('IP address not match');
    rows[0].assign({
      日期: '',
      IP: '',
      '卡/電話/名': '',
      出席堂數: '',
      狀態: '',
      功課份數: '',
      款項: '',
      在中心支付: '',
      無限Video: '',
      折扣: '',
      其他項目: '',
      其他項目總價: '',
    });
    rows[0].save();
    return { status: 'success' };
  }
}
