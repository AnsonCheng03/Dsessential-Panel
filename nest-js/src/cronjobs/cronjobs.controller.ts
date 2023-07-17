import { Controller, Get } from '@nestjs/common';
import { CronjobsService } from './cronjobs.service';

@Controller('cronjobs')
export class CronjobsController {
  constructor(private cronService: CronjobsService) {}

  @Get('getStudentInfos')
  async getStudentInfos() {
    return this.cronService.getStudentInfos();
  }
}
