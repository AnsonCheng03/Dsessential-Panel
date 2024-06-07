import {
  Controller,
  Post,
  Body,
  Res,
  HttpStatus,
  Req,
  UseGuards,
} from '@nestjs/common';
import { LogServiceService } from './log-service.service';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('log-service')
export class LogServiceController {
  constructor(private readonly logService: LogServiceService) {}

  @UseGuards(AuthGuard)
  @Post('viewLog')
  async viewLog(@Res() res, @Body() body, @Req() req) {
    if (req.user.role !== 'admin')
      return res.sendStatus(HttpStatus.UNAUTHORIZED);

    const log = await this.logService.viewLog();
    return res.status(HttpStatus.OK).send(log);
  }
}
