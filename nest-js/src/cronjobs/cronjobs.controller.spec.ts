import { Test, TestingModule } from '@nestjs/testing';
import { CronjobsController } from './cronjobs.controller';

describe('CronjobsController', () => {
  let controller: CronjobsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CronjobsController],
    }).compile();

    controller = module.get<CronjobsController>(CronjobsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
