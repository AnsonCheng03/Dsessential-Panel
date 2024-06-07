import { Injectable } from '@nestjs/common';
import fs = require('fs');
import path = require('path');

const isVideoFile = (extension) => {
  const videoExtensions = [
    '.mp4',
    '.avi',
    '.mkv',
    '.mov',
    '.wmv',
    '.flv',
    '.webm',
  ];
  return videoExtensions.includes(extension);
};

@Injectable()
export class LessonReplayService {
  async getMonth(user, sheetValue) {
    const userID = user.sub;

    if (sheetValue[13].split('|')[0].includes(userID)) return ['New'];
    if (sheetValue[13].split('|')[1].includes(userID)) return ['Expired'];
    if (sheetValue[12].split('|')[0].includes(userID)) return ['Normal'];
    if (sheetValue[12].split('|')[1].split('`')[0].includes(userID))
      return ['All', 'A'];
    if (sheetValue[12].split('|')[1].split('`')[1].includes(userID))
      return ['All', 'B'];
    try {
      sheetValue.slice(0, 12).forEach((element, index) => {
        const month = index + 1;
        if (element.split('|')[0].includes(userID)) throw ['Normal'];
        if (element.split('|')[1].split('`')[0].includes(userID))
          throw [month.toString(), 'A'];
        if (element.split('|')[1].split('`')[1].includes(userID))
          throw [month.toString(), 'B'];
      });
    } catch (value) {
      return value;
    }

    return ['Not Found'];
  }

  async getMonthArray(month) {
    const result = [];
    const currentMonth = new Date().getMonth() + 1;
    for (let i = 4 + 12; i >= 4 + 1; i--) {
      const parsedMonth = ((i - 2) % 12) + 1;
      if (month !== 'All' && (parsedMonth + 8) % 12 > (currentMonth + 8) % 12)
        continue;
      result.push(parsedMonth);
      if (month == parsedMonth) break;
    }
    return result.reverse();
  }

  async getDefaultVideo() {
    const basePath = `${process.env.RESOURCE_PATH}/範文`;

    const result = {
      範文: {},
    };

    function getFilesFromDirectory(directory) {
      try {
        const files = fs.readdirSync(directory);

        files.forEach((file) => {
          if (
            file === '.DS_Store' ||
            file.startsWith('ts-') ||
            file.startsWith('@')
          )
            return;

          const filePath = path.join(directory, file);
          const stats = fs.statSync(filePath);

          if (stats.isFile()) {
            // parent directory name
            const parentDirName = path.basename(directory);
            if (!result['範文'][parentDirName]) {
              result['範文'][parentDirName] = {
                影片: { video: [], notes: [] },
              };
            }

            const extension = path.parse(file).ext;
            if (isVideoFile(extension)) {
              result['範文'][parentDirName]['影片']['video'].push(filePath);
            } else if (extension === '.pdf') {
              result['範文'][parentDirName]['影片']['notes'].push(filePath);
            }
          } else {
            getFilesFromDirectory(filePath);
          }
        });
      } catch (_) {}
      if (Object.keys(result['範文']).length === 0) {
        result['範文']['暫時沒有影片'] = {};
      }

      return result;
    }

    return getFilesFromDirectory(basePath);
  }

  async getVideo(returnMonth, zone) {
    const basePath = `${process.env.RESOURCE_PATH}/Videos/${zone}`;
    const result = {
      課堂: {},
    };

    function getFilesFromDirectory(directory, month) {
      try {
        const files = fs.readdirSync(directory);

        files.forEach((file) => {
          if (
            file === '.DS_Store' ||
            file.startsWith('ts-') ||
            file.startsWith('@')
          )
            return;

          const filePath = path.join(directory, file);
          const stats = fs.statSync(filePath);

          if (stats.isFile()) {
            // parent directory name
            const parentDirName = `第${path.basename(directory)}期`;

            if (!result['課堂'][month]) result['課堂'][month] = {};
            if (!result['課堂'][month][parentDirName]) {
              result['課堂'][month][parentDirName] = {
                video: [],
                notes: [],
              };
            }

            const extension = path.parse(file).ext;
            if (isVideoFile(extension)) {
              result['課堂'][month][parentDirName]['video'].push(filePath);
            } else if (extension === '.pdf') {
              result['課堂'][month][parentDirName]['notes'].push(filePath);
            }
          } else {
            getFilesFromDirectory(filePath, month);
          }
        });
      } catch (_) {}
      if (Object.keys(result['課堂']).length === 0) {
        result['課堂']['暫時沒有影片'] = {};
      }
      return result;
    }

    returnMonth.forEach((month) => {
      getFilesFromDirectory(`${basePath}/${month}`, `${month}月`);
    });

    return result;
  }
}
