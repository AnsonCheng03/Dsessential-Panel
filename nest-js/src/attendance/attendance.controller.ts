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

    const data = {
      日期: new Date()
        .toLocaleString('en-US', {
          timeZone: 'Asia/Hong_Kong',
          month: 'numeric',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
        .replace(',', ''),
      IP: `${body.ipAddress}(${req.user.username})`,
      '卡/電話/名': body.studentName,
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

    if (body.rowNumber) return this.service.modifyData(body.rowNumber, data);
    return this.service.createData(data);
  }

  @UseGuards(AuthGuard)
  @Post('deleteForm')
  async deleteForm(@Body() body, @Req() req) {
    if (req.user.role !== 'admin') throw new UnauthorizedException();
    return this.service.deleteData(
      body.ipAddress,
      req.user.username,
      body.deleteRow,
    );
  }
}
