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
  Param,
} from '@nestjs/common';
import { VideoService } from './video.service';
import { LogServiceService } from 'src/log-service/log-service.service';
import { Headers } from '@nestjs/common';
import { Response } from 'express';
import { AuthGuard } from 'src/auth/auth.guard';
import * as fs from 'fs';
import { createReadStream, statSync, existsSync, readFileSync } from 'fs';

@Controller('video')
export class VideoController {
  constructor(
    private readonly videoService: VideoService,
    private readonly logService: LogServiceService,
  ) {}

  @UseGuards(AuthGuard)
  @Post('createStream')
  async createStream(@Res() res, @Body() body, @Req() req) {
    // create route with randomID
    let temporaryID = await this.videoService.createRandomID();

    while (fs.existsSync(`/tmp/Dsessential-Videos/${temporaryID}`))
      temporaryID = await this.videoService.createRandomID();

    // create routing file
    if (!fs.existsSync(`/tmp/Dsessential-Videos`))
      fs.mkdirSync(`/tmp/Dsessential-Videos`);
    // get video url and replace all space with underscore
    let videoURL = body.url;

    if (videoURL.includes(' ')) {
      if (fs.existsSync(videoURL)) {
        await fs.renameSync(videoURL, videoURL.replace(/ /g, '_'));
      }
      videoURL = videoURL.replace(/ /g, '_');
    }

    await fs.writeFileSync(`/tmp/Dsessential-Videos/${temporaryID}`, videoURL);
    res.status(HttpStatus.CREATED).send(temporaryID);

    const fileName = body.url.split('/').pop()?.split('.')[0];
    this.logService.logEvent(req.user.username, '觀看影片', fileName);

    this.videoService.removeExpiredFile();
  }

  @UseGuards(AuthGuard)
  @Post('getKey/:videoKey')
  async getKey(
    @Req() req,
    @Body() body,
    @Res() res: Response,
    @Param('videoKey') videoKey: string,
  ) {
    const videoPath = fs.readFileSync(`/tmp/Dsessential-Videos/${videoKey}`, {
      encoding: 'utf8',
    });
    const videoPathDir = videoPath.split('/').slice(0, -1).join('/');
    const fileName = videoPath.split('/').pop()?.split('.')[0];
    const keyPath = `${videoPathDir}/ts-${fileName}/key.key`;

    if (!fs.existsSync(keyPath)) return res.sendStatus(HttpStatus.CREATED);
    return res.status(HttpStatus.OK).sendFile(keyPath);
  }

  @UseGuards(AuthGuard)
  @Post('stream/:videoKey')
  @Header('Accept-Ranges', 'bytes')
  @Header('Content-Type', 'application/vnd.apple.mpegurl')
  async getStreamM3U8(
    @Res() res: Response,
    @Body() body,
    @Req() req,
    @Param('videoKey') videoKey: string,
  ) {
    const videoPath = fs.readFileSync(`/tmp/Dsessential-Videos/${videoKey}`, {
      encoding: 'utf8',
    });
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
          !fs.existsSync(`${videoPathDir}/ts-${fileName}/streamVideo-0.ts`)
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
          videoKey,
          atob(body.keyBlobURL),
          res,
          req,
          body.baseURL,
        );
      }
    }

    // if folder ${videoPathDir}/ts-${fileName} not exist, create it

    await this.videoService.createM3U8(videoPathDir, fileName, videoPath, res);
  }

  @Get('streamList/:videoKey')
  async getStreamList(
    @Res() res: Response,
    @Req() req,
    @Param('videoKey') videoKey: string,
  ) {
    const videoPath = fs.readFileSync(`/tmp/Dsessential-Videos/${videoKey}`, {
      encoding: 'utf8',
    });
    const videoPathDir = videoPath.split('/').slice(0, -1).join('/');
    const fileName = videoPath.split('/').pop()?.split('.')[0];
    await this.videoService.returnM3U8(
      videoPathDir,
      fileName,
      videoKey,
      atob(req.query.key),
      res,
      req,
      req.query.baseURL,
    );
  }

  @Get('stream/:videoKey')
  @Header('Accept-Ranges', 'bytes')
  @Header('Content-Type', 'video/MP2T')
  async getStreamVideo(
    @Req() req,
    @Res() res,
    @Headers() headers: any,
    @Param('videoKey') videoKey: string,
  ) {
    const videoPath = readFileSync(
      `/tmp/Dsessential-Videos/${videoKey}`,
    ).toString('utf8');

    const videoPathDir = videoPath.split('/').slice(0, -1).join('/');
    const fileName = videoPath.split('/').pop()?.split('.')[0];

    // Get query string
    const tsName = req.query.video as string;
    const tsPath = `${videoPathDir}/ts-${fileName}/streamVideo-${tsName}`;

    if (!existsSync(tsPath)) {
      res.status(404).send('File not found');
      return;
    }

    const stat = statSync(tsPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      if (start >= fileSize) {
        res
          .status(416)
          .send(
            'Requested range not satisfiable\n' + start + ' >= ' + fileSize,
          );
        return;
      }

      const chunksize = end - start + 1;
      const file = createReadStream(tsPath, { start, end });
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/MP2T',
      };

      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        'Content-Length': fileSize,
        'Content-Type': 'video/MP2T',
      };

      res.writeHead(200, head);
      createReadStream(tsPath).pipe(res);
    }
  }
}
