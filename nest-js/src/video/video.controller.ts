import {
  Controller,
  Post,
  Body,
  Res,
  HttpStatus,
  Header,
  Request,
  UseGuards,
} from '@nestjs/common';
import { VideoService } from './video.service';
import { Headers } from '@nestjs/common';
import { Response } from 'express';
import { AuthGuard } from 'src/auth/auth.guard';
import * as fs from 'fs';
import * as ffmpeg from 'fluent-ffmpeg';
import * as ffmpegPath from '@ffmpeg-installer/ffmpeg';

@Controller('video')
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @UseGuards(AuthGuard)
  @Post('createStream')
  async createStream(@Request() req, @Body() body) {
    // encrypt uri with uuid
    const uuid = req.user.uuid;
    const url = body.url;
    const video = await this.videoService.encrypt(url, uuid);
    return video;
  }

  @UseGuards(AuthGuard)
  @Post('stream')
  @Header('Accept-Ranges', 'bytes')
  @Header('Content-Type', 'video/mp4')
  async getStreamVideo(
    @Headers() headers,
    @Res() res: Response,
    @Body() body,
    @Request() req,
  ) {
    const videoPath = await this.videoService.decrypt(body.url, req.user.uuid);
    const videoPathDir = videoPath.split('/').slice(0, -1).join('/');
    const fileName = videoPath.split('/').pop()?.split('.')[0];

    // if folder ${videoPathDir}/ts-${fileName} not exist, create it
    if (!fs.existsSync(`${videoPathDir}/ts-${fileName}`)) {
      const ffmpegAppPath = ffmpegPath.path;
      const ffmpegApp = new ffmpeg();

      // create file progress.txt
      await fs.mkdirSync(`${videoPathDir}/ts-${fileName}`);
      await fs.writeFileSync(`${videoPathDir}/ts-${fileName}/progress.txt`, '');

      let totalTime = 0;

      ffmpegApp
        .setFfmpegPath(ffmpegAppPath)
        .input(videoPath)
        .outputOptions([
          '-map 0:0',
          '-map 0:1',
          '-map 0:0',
          '-map 0:1',
          '-s:v:0 2160x3840',
          '-c:v:0 libx264',
          '-b:v:0 2000k',
          '-s:v:1 960x540',
          '-c:v:1 libx264',
          '-b:v:1 365k',
          // '-var_stream_map', '"v:0,a:0 v:1,a:1"',
          '-master_pl_name master.m3u8',
          '-f hls',
          '-max_muxing_queue_size 1024',
          '-hls_time 1',
          '-hls_list_size 0',
          '-hls_segment_filename',
          `${videoPathDir}/ts-${fileName}/streamingvid-%d.ts`,
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
          fs.writeFileSync(
            `${videoPathDir}/ts-${fileName}/progress.txt`,
            percent.toString(),
          );
        })
        .on('end', function (err, stdout, stderr) {
          console.log('Finished processing!', err, stdout, stderr);
          fs.unlinkSync(`${videoPathDir}/ts-${fileName}/progress.txt`);
        })
        .run();
    } else {
      //   return fs.rmdirSync(`${videoPathDir}/ts-${fileName}`, {
      //     recursive: true,
      //   });

      if (fs.existsSync(`${videoPathDir}/ts-${fileName}/progress.txt`)) {
        const progress = fs.readFileSync(
          `${videoPathDir}/ts-${fileName}/progress.txt`,
          'utf8',
        );
        const percent = parseInt(progress);
        return res.status(HttpStatus.ACCEPTED).send({ percent });
      } else {
        // return the m3u8 file
        const m3u8 = fs.readFileSync(
          `${videoPathDir}/ts-${fileName}/original.m3u8`,
          'utf8',
        );
        return res.status(HttpStatus.OK).send(m3u8);
      }
    }

    // const { size } = statSync(videoPath);
    // const videoRange = headers.range;
    // if (videoRange) {
    //   const parts = videoRange.replace(/bytes=/, '').split('-');
    //   const start = parseInt(parts[0], 10);
    //   const end = parts[1] ? parseInt(parts[1], 10) : size - 1;
    //   const chunksize = end - start + 1;
    //   const readStreamfile = createReadStream(videoPath, {
    //     start,
    //     end,
    //     highWaterMark: 60,
    //   });
    //   const head = {
    //     'Content-Range': `bytes ${start}-${end}/${size}`,
    //     'Content-Length': chunksize,
    //   };
    //   res.writeHead(HttpStatus.PARTIAL_CONTENT, head); //206
    //   readStreamfile.pipe(res);
    // } else {
    //   const head = {
    //     'Content-Length': size,
    //   };
    //   res.writeHead(HttpStatus.OK, head); //200
    //   createReadStream(videoPath).pipe(res);
    // }
  }
}
