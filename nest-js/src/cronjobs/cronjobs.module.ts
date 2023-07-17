import { Module } from '@nestjs/common';
import { CronjobsService } from './cronjobs.service';
import { CronjobsController } from './cronjobs.controller';

@Module({
  providers: [CronjobsService],
  controllers: [CronjobsController],
})
export class CronjobsModule {}
