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
import { VideoService } from './video.service';
import { Headers } from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthGuard } from 'src/auth/auth.guard';
import * as fs from 'fs';

import { createReadStream } from 'fs';

@Controller('video')
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @UseGuards(AuthGuard)
  @Post('createStream')
  async createStream(@Req() req, @Body() body) {
    // encrypt uri with uuid
    const uuid = req.user.uuid;
    const url = body.url;
    const video = await this.videoService.encrypt(url, uuid);
    return video;
  }

  @UseGuards(AuthGuard)
  @Post('getKey')
  async getKey(@Req() req, @Body() body, @Res() res: Response) {
    const videoPath = await this.videoService.decrypt(body.url, req.user.uuid);
    const videoPathDir = videoPath.split('/').slice(0, -1).join('/');
    const fileName = videoPath.split('/').pop()?.split('.')[0];
    const keyPath = `${videoPathDir}/ts-${fileName}/key.key`;

    if (!fs.existsSync(keyPath)) return res.sendStatus(HttpStatus.CREATED);
    return res.status(HttpStatus.OK).sendFile(keyPath);
  }

  @Get('stream/:videoKey')
  @Header('Accept-Ranges', 'bytes')
  @Header('Content-Type', 'video/MP2T')
  async getStreamVideo(
    @Req() req,
    @Headers() headers,
    @Param('videoKey') videoKey: string,
  ) {
    const videoPath = fs.readFileSync(`/tmp/Dsessential-Videos/${videoKey}`, {
      encoding: 'utf8',
    });

    const videoPathDir = videoPath.split('/').slice(0, -1).join('/');
    const fileName = videoPath.split('/').pop()?.split('.')[0];

    // get query string
    const tsName = req.query.video;
    const tsPath = `${videoPathDir}/${fileName}/streamingvid-${tsName}`;

    if (!fs.existsSync(tsPath)) throw new Error('File not found');

    const file = createReadStream(tsPath);
    return new StreamableFile(file);
  }

  @UseGuards(AuthGuard)
  @Post('stream')
  @Header('Accept-Ranges', 'bytes')
  @Header('Content-Type', 'application/vnd.apple.mpegurl')
  async getStreamM3U8(
    @Headers() headers,
    @Res() res: Response,
    @Body() body,
    @Req() req,
  ) {
    const videoPath = await this.videoService.decrypt(body.url, req.user.uuid);
    const videoPathDir = videoPath.split('/').slice(0, -1).join('/');
    const fileName = videoPath.split('/').pop()?.split('.')[0];

    if (fs.existsSync(`${videoPathDir}/ts-${fileName}`)) {
      if (fs.existsSync(`${videoPathDir}/ts-${fileName}/progress.txt`)) {
        const stat = fs.statSync(`${videoPathDir}/ts-${fileName}/progress.txt`);
        const now = new Date().getTime();
        const endTime = new Date(stat.ctime).getTime() + 3 * 60 * 60 * 1000;
        if (now > endTime) {
          // if progress.txt exists and its created time is more than 3 hour, delete the folder
          fs.rmSync(`${videoPathDir}/ts-${fileName}`, {
            recursive: true,
            force: true,
          });
          return res.status(HttpStatus.ACCEPTED).send({ percent: 0 });
        } else {
          // else return the progress
          const progress = fs.readFileSync(
            `${videoPathDir}/ts-${fileName}/progress.txt`,
            'utf8',
          );
          const percent = progress;
          return res.status(HttpStatus.ACCEPTED).send({ percent });
        }
      } else {
        // if there are no any m3u8 file, delete the folder
        if (
          !fs.existsSync(`${videoPathDir}/ts-${fileName}/original.m3u8`) ||
          !fs.existsSync(`${videoPathDir}/ts-${fileName}/streamingvid-0.ts`)
        ) {
          fs.rmSync(`${videoPathDir}/ts-${fileName}`, {
            recursive: true,
            force: true,
          });
          return res.status(HttpStatus.ACCEPTED).send({ percent: 0 });
        }
        // return the m3u8 file
        return await this.videoService.returnM3U8(
          videoPathDir,
          fileName,
          body.keyBlobURL,
          res,
          req,
        );
      }
    }

    // if folder ${videoPathDir}/ts-${fileName} not exist, create it
    await this.videoService.createM3U8(videoPathDir, fileName, videoPath, res);
  }
}
