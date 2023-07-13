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
    // const userID = '2260';

    if (sheetValue[0][13].split('|')[0].includes(userID)) return ['New'];
    if (sheetValue[0][13].split('|')[1].includes(userID)) return ['Expired'];
    if (sheetValue[0][12].split('|')[0].includes(userID)) return ['Normal'];
    if (sheetValue[0][12].split('|')[1].split('`')[0].includes(userID))
      return ['All', 'A'];
    if (sheetValue[0][12].split('|')[1].split('`')[1].includes(userID))
      return ['All', 'B'];
    try {
      sheetValue[0].slice(0, 12).forEach((element, index) => {
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
    for (let i = 4 + 1; i <= 4 + 12; i++) {
      const currentMonth = ((i - 2) % 12) + 1;
      if (month === currentMonth.toString()) break;
      result.push(currentMonth);
    }
    return result;
  }

  async getDefaultVideo() {
    const basePath = `${process.env.RESOURCE_PATH}/範文`;

    const result = {
      範文: {},
    };

    function getFilesFromDirectory(directory) {
      const files = fs.readdirSync(directory);

      files.forEach((file) => {
        const filePath = path.join(directory, file);
        const stats = fs.statSync(filePath);

        if (stats.isFile()) {
          // parent directory name
          const parentDirName = path.basename(directory);
          if (!result['範文'][parentDirName]) {
            result['範文'][parentDirName] = {
              video: [],
              notes: [],
            };
          }

          const extension = path.parse(file).ext;
          if (isVideoFile(extension)) {
            result['範文'][parentDirName]['video'].push(filePath);
          } else if (extension === '.pdf') {
            result['範文'][parentDirName]['notes'].push(filePath);
          }
        } else {
          getFilesFromDirectory(filePath);
        }
      });

      return result;
    }

    return getFilesFromDirectory(basePath);
  }

  async getVideo(returnMonth, zone) {
    const basePath = `${process.env.RESOURCE_PATH}/Videos/${zone}`;
    const result = {
      課堂: {},
    };

    function getFilesFromDirectory(directory) {
      const files = fs.readdirSync(directory);

      files.forEach((file) => {
        const filePath = path.join(directory, file);
        const stats = fs.statSync(filePath);

        if (stats.isFile()) {
          // parent directory name
          const parentDirName = path.basename(directory);
          const grandParentDirName = path.basename(parentDirName);

          if (!result['課堂'][grandParentDirName])
            result['課堂'][grandParentDirName] = {};
          if (!result['課堂'][grandParentDirName][parentDirName]) {
            result['課堂'][grandParentDirName][parentDirName] = {
              video: [],
              notes: [],
            };
          }

          const extension = path.parse(file).ext;
          if (isVideoFile(extension)) {
            result['課堂'][grandParentDirName][parentDirName]['video'].push(
              filePath,
            );
          } else if (extension === '.pdf') {
            result['課堂'][grandParentDirName][parentDirName]['notes'].push(
              filePath,
            );
          }
        } else {
          getFilesFromDirectory(filePath);
        }
      });

      return result;
    }

    return getFilesFromDirectory(basePath);
  }
}
