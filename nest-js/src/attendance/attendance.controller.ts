import { Controller, Post, UseGuards } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { GoogleSheetConnectorService } from 'nest-google-sheet-connector';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('attendance')
export class AttendanceController {
  constructor(
    private googleSheetConnectorService: GoogleSheetConnectorService,
    private readonly service: AttendanceService,
  ) {}

  @UseGuards(AuthGuard)
  @Post('sendForm')
  async sendForm() {
    await this.googleSheetConnectorService.addRow(
      '1dBCGDIgnBKqVR6WCyIrESQqQzcqhIse0KFOLhCJrHDM',
      'Attendance!A1',
      [],
    );
  }
}
