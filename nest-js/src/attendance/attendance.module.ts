import { Module } from '@nestjs/common';
import { GoogleSheetModule } from 'nest-google-sheet-connector';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';
import * as googleCredentials from '../google-credentials.json';

@Module({
  imports: [GoogleSheetModule.register(googleCredentials)],
  controllers: [AttendanceController],
  providers: [AttendanceService],
})
export class AttendanceModule {}
