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

    console.log('body', body);

    //日期	IP	卡/電話/名	出席堂數	狀態	功課份數	款項	在中心支付	無限Video	折扣	其他項目	其他項目總價
    const data = {
      日期: new Date().toLocaleString('en-US', { timeZone: 'Asia/Hong_Kong' }),
      IP: `${body.ipAddress}(${req.user.username})`,
      '卡/電話/名': !isNaN(body.studentName)
        ? body.studentName
        : parseInt(body.studentName),
      出席堂數: body.lessonCount,
      狀態: body.studentStatus === '出席' ? '' : body.studentStatus,
      功課份數: body.homeworkCount,
      款項: body.paymentAmount,
      在中心支付:
        body.paymentMethod === '無' ? '' : body.paymentMethod === '上門支付',
      無限Video: body.otherItems.includes('無限Video') ? 80 : '',
      折扣: body.discountAmount === 0 ? '' : body.discountAmount,
      其他項目: body.otherItems.join(','),
      其他項目總價: body.otherItemsPrice,
    };

    // remove undefined from data
    Object.keys(data).forEach(
      (key) => data[key] === undefined && delete data[key],
    );

    return this.service.createData(data);
  }
}
