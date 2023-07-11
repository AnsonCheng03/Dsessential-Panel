import { Injectable } from '@nestjs/common';
const fs = require('fs');
const path = require('path');

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

  async getDefaultVideo() {
    const fs = require('fs');
    const path = require('path');

    const directoryPath = `${process.env.RESOURCE_PATH}/範文`;

    function getFilesFromDirectory(directory) {
      const files = fs.readdirSync(directory);
      const result = {};

      files.forEach((file) => {
        const filePath = path.join(directory, file);
        const stats = fs.statSync(filePath);
        const fileName = path.parse(file).name;

        if (stats.isFile()) {
          const extension = path.parse(file).ext;
          if (isVideoFile(extension)) {
            if (!result[fileName]) {
              result[fileName] = {
                video: [],
                notes: [],
              };
            }
            result[fileName].video.push(filePath);
          } else if (extension === '.pdf') {
            if (!result[fileName]) {
              result[fileName] = {
                video: [],
                notes: [],
              };
            }
            result[fileName].notes.push(filePath);
          }
        } else if (stats.isDirectory()) {
          result[fileName] = getFilesFromDirectory(filePath);
        }
      });

      return result;
    }

    function isVideoFile(extension) {
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
    }

    // Usage example
    const result = {
      範文: getFilesFromDirectory(directoryPath),
    };

    return result;
  }

  async getVideo(returnMonth) {
    function visit_dir(dir) {
      require('fs').readdir(dir, function (err, files) {
        if (!err) {
          files.forEach(function (file) {
            if (file !== '.DS_Store') {
              const file_full_path = require('path').join(dir, file);
              (function (file_full_path) {
                require('fs').lstat(file_full_path, function (err, stats) {
                  if (!err) {
                    if (stats.isFile()) {
                      console.log(file_full_path);
                    } else if (stats.isDirectory() && !stats.isSymbolicLink()) {
                      const baseName = require('path').basename(file_full_path);
                      if (
                        !baseName.startsWith('ts-') &&
                        !baseName.startsWith('@')
                      ) {
                        visit_dir(file_full_path);
                      }
                    }
                  }
                });
              })(file_full_path);
            }
          });
        }
      });
    }

    return visit_dir(`${process.env.RESOURCE_PATH}/Videos/`);
  }
}
