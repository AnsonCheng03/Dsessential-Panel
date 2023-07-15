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
  Inject,
  Param,
} from '@nestjs/common';
import { VideoService } from './video.service';
import { Headers } from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthGuard } from 'src/auth/auth.guard';
import * as fs from 'fs';
import * as ffmpeg from 'fluent-ffmpeg';
import * as ffmpegPath from '@ffmpeg-installer/ffmpeg';
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
    try {
      const key = fs.readFileSync(keyPath, 'utf8');
      return res.status(HttpStatus.OK).send(key);
    } catch (e) {
      return res.sendStatus(HttpStatus.CREATED);
    }
  }

  @UseGuards(AuthGuard)
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

    const file = createReadStream(tsPath);
    return new StreamableFile(file);
  }

  @UseGuards(AuthGuard)
  @Post('stream')
  @Header('Accept-Ranges', 'bytes')
  @Header('Content-Type', 'video/mp4')
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
        return await this.returnM3U8(
          videoPathDir,
          fileName,
          body.keyBlobURL,
          res,
          req,
        );
      }
    }

    // if folder ${videoPathDir}/ts-${fileName} not exist, create it
    await this.createM3U8(videoPathDir, fileName, videoPath, res);
  }

  private async returnM3U8(
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
    const temporaryID = await this.videoService.createM3U8Key();
    console.log('temporaryID', temporaryID);

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
    res.status(HttpStatus.OK).send(m3u8Edit);

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

  private async createM3U8(
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
      await this.videoService.createM3U8Key().toString('base64'),
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
        '-hls_key_info_file',
        `${videoPathDir}/ts-${fileName}/key.keyinfo`,
      ])
      .output(`${videoPathDir}/ts-${fileName}/original.m3u8`)
      .on('start', function () {
        return res.status(HttpStatus.ACCEPTED).send({ percent: 0 });
      })
      .on('error', function (err, stdout, stderr) {
        console.log('An error occurred: ' + err.message, err, stderr);
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
}
