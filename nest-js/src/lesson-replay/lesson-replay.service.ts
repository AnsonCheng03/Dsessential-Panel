import { Injectable } from '@nestjs/common';

@Injectable()
export class LessonReplayService {
  async getVideo(user, sheetValue) {
    const userID = user.sub;
    // const userID = '2260';

    if (sheetValue[0][13].split('|')[0].includes(userID)) return ['New'];
    if (sheetValue[0][13].split('|')[1].includes(userID)) return ['Expired'];
    if (sheetValue[0][12].split('|')[0].includes(userID))
      return ['All', 'Normal'];
    if (sheetValue[0][12].split('|')[1].split('`')[0].includes(userID))
      return ['All', 'A'];
    if (sheetValue[0][12].split('|')[1].split('`')[1].includes(userID))
      return ['All', 'B'];
    try {
      sheetValue[0].slice(0, 12).forEach((element, index) => {
        const month = index + 1;
        if (element.split('|')[0].includes(userID)) throw [month, 'Normal'];
        if (element.split('|')[1].split('`')[0].includes(userID))
          throw [month, 'A'];
        if (element.split('|')[1].split('`')[1].includes(userID))
          throw [month, 'B'];
      });
    } catch (value) {
      return value;
    }

    return ['Not Found'];
  }
}
