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
import { statSync, createReadStream } from 'fs';
import { Headers } from '@nestjs/common';
import { Response } from 'express';
import { AuthGuard } from 'src/auth/auth.guard';
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
    console.log('video', video);
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
    const { size } = statSync(videoPath);
    const videoRange = headers.range;
    if (videoRange) {
      const parts = videoRange.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : size - 1;
      const chunksize = end - start + 1;
      const readStreamfile = createReadStream(videoPath, {
        start,
        end,
        highWaterMark: 60,
      });
      const head = {
        'Content-Range': `bytes ${start}-${end}/${size}`,
        'Content-Length': chunksize,
      };
      res.writeHead(HttpStatus.PARTIAL_CONTENT, head); //206
      readStreamfile.pipe(res);
    } else {
      const head = {
        'Content-Length': size,
      };
      res.writeHead(HttpStatus.OK, head); //200
      createReadStream(videoPath).pipe(res);
    }
  }
}
