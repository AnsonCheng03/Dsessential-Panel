import { Injectable } from '@nestjs/common';
import {
  Controller,
  Post,
  Body,
  Res,
  HttpStatus,
  Header,
  Req,
  UseGuards,
  Get,
  StreamableFile,
  Param,
} from '@nestjs/common';
import { Headers } from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthGuard } from 'src/auth/auth.guard';
import * as fs from 'fs';
import * as ffmpeg from 'fluent-ffmpeg';
import * as ffmpegPath from '@ffmpeg-installer/ffmpeg';
import { createReadStream } from 'fs';
import * as CryptoJS from 'crypto-js';
import * as crypto from 'crypto';

@Injectable()
export class VideoService {
  // Encrypt data
  encrypt(data, uuid) {
    return CryptoJS.AES.encrypt(data, uuid).toString();
  }

  // Decrypt data
  decrypt(encryptedData, uuid) {
    const bytes = CryptoJS.AES.decrypt(encryptedData, uuid);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  createRandomID() {
    return crypto.randomBytes(16).toString('hex');
  }

  createM3U8Key() {
    return crypto.randomBytes(16);
  }

  async createM3U8(
    videoPathDir: any,
    fileName: any,
    videoPath: any,
    res: Response<any, Record<string, any>>,
  ) {
    const ffmpegAppPath = ffmpegPath.path;
    const ffmpegApp = new ffmpeg();

    await fs.mkdirSync(`${videoPathDir}/ts-${fileName}`);

    // create key for m3u8
    await fs.writeFileSync(
      `${videoPathDir}/ts-${fileName}/key.key`,
      await this.createM3U8Key(),
    );

    // create key info file
    await fs.writeFileSync(
      `${videoPathDir}/ts-${fileName}/key.keyinfo`,
      `key.key\n${videoPathDir}/ts-${fileName}/key.key`,
    );

    // create file progress.txt
    await fs.writeFileSync(`${videoPathDir}/ts-${fileName}/progress.txt`, '');

    let totalTime = 0;

    ffmpegApp
      .setFfmpegPath(ffmpegAppPath)
      .input(videoPath)
      .outputOptions([
        '-c copy',
        '-map 0',
        '-start_number 0',
        '-f hls',
        '-hls_time 10',
        '-hls_list_size 0',
        '-hls_segment_filename',
        `${videoPathDir}/ts-${fileName}/streamingvid-%d.ts`,
        '-hls_playlist_type vod',
        '-hls_key_info_file',
        `${videoPathDir}/ts-${fileName}/key.keyinfo`,
      ])
      .output(`${videoPathDir}/ts-${fileName}/original.m3u8`)
      .on('start', function () {
        return res.status(HttpStatus.ACCEPTED).send({ percent: 0 });
      })
      .on('error', function (err, stdout, stderr) {
        console.log('An error occurred: ' + err.message, err, stderr);
        fs.unlinkSync(`${videoPathDir}/ts-${fileName}/progress.txt`);
        throw err;
      })
      .on('codecData', (data) => {
        // HERE YOU GET THE TOTAL TIME
        totalTime = parseInt(data.duration.replace(/:/g, ''));
      })
      .on('progress', (progress) => {
        const time = parseInt(progress.timemark.replace(/:/g, ''));
        const percent = (time / totalTime) * 100;
        try {
          fs.writeFileSync(
            `${videoPathDir}/ts-${fileName}/progress.txt`,
            percent.toString(),
          );
        } catch (err) {
          console.log('error', err);
        }
      })
      .on('end', function () {
        fs.unlinkSync(`${videoPathDir}/ts-${fileName}/progress.txt`);
        fs.unlinkSync(`${videoPathDir}/ts-${fileName}/key.keyinfo`);
      })
      .run();
  }

  async returnM3U8(
    videoPathDir: any,
    fileName: any,
    keyBlobURL: string,
    res: Response<any, Record<string, any>>,
    req: Request<any, Record<string, any>, any, any>,
  ) {
    const m3u8 = await fs.readFileSync(
      `${videoPathDir}/ts-${fileName}/original.m3u8`,
      'utf8',
    );
    const temporaryID = await this.createRandomID();

    // create key info file
    if (!fs.existsSync(`/tmp/Dsessential-Videos`))
      fs.mkdirSync(`/tmp/Dsessential-Videos`);
    await fs.writeFileSync(
      `/tmp/Dsessential-Videos/${temporaryID}`,
      `${videoPathDir}/ts-${fileName}`,
    );

    const m3u8Edit = m3u8
      .replace(
        // replace all streamingvid to path
        /streamingvid-/g,
        `https://${req.headers.host}/video/stream/${temporaryID}?video=`,
      )
      .replace(
        // replace key.key to keyBlobURL
        /key.key/g,
        keyBlobURL,
      );

    // make m3u8Edit as a file
    const tempPath = `/tmp/Dsessential-Videos/${temporaryID}.m3u8`;
    await fs.writeFileSync(tempPath, m3u8Edit);

    // get file size
    const stat = fs.statSync(tempPath);
    const fileSize = stat.size;

    // set header
    res.setHeader('Accept-Length', fileSize);
    res.setHeader('Content-Length', fileSize);

    res.status(HttpStatus.OK).sendFile(tempPath);

    // scan /tmp/Dsessential-Videos, if there are any file that created more than 3 hour, delete it
    const files = fs.readdirSync(`/tmp/Dsessential-Videos`);
    files.forEach((file) => {
      const stat = fs.statSync(`/tmp/Dsessential-Videos/${file}`);
      const now = new Date().getTime();
      const endTime = new Date(stat.ctime).getTime() + 3 * 60 * 60 * 1000;
      if (now > endTime) {
        fs.rmSync(`/tmp/Dsessential-Videos/${file}`, {
          recursive: true,
          force: true,
        });
      }
    });
  }
}
