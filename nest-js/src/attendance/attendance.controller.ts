import {
  Body,
  Controller,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly service: AttendanceService) {}

  @UseGuards(AuthGuard)
  @Post('sendForm')
  async sendForm(@Body() body, @Req() req) {
    if (req.user.role !== 'admin') throw new UnauthorizedException();
    console.log(body);

    const data = [
      [
        // time format: 7/16/2023 15:38:47
        new Date().toLocaleString('en-US', { timeZone: 'Asia/Hong_Kong' }),
        body.ipAddress,
        // if is number then make it in number format (body.studentName)
        !isNaN(body.studentName)
          ? body.studentName
          : parseInt(body.studentName),
        body.lessonCount,
        body.studentStatus === '出席' ? '' : body.studentStatus,
        body.homework,
        body.paymentAmount,
        body.paymentMethod === '無' ? '' : body.paymentMethod === '上門支付',
        body.otherItems.includes('無限Video') ? 80 : '',
        body.discountAmount === 0 ? '' : body.discountAmount,
        body.otherItems.join(','),
        body.otherItemsPrice,
      ],
    ];

    console.log(data);

    // await this.googleSheetConnectorService.appendRow(
    //   '1V5SY55VS3JIfFkhHHKBWWQbO_aqU9Jc6FDWUq7b6xOg',
    //   '學生報到機2021.8',
    //   data,
    // );

    return 'done';
  }
}
