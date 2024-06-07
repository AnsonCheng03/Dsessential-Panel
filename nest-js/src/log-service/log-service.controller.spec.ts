import { Test, TestingModule } from '@nestjs/testing';
import { LogServiceController } from './log-service.controller';

describe('LogServiceController', () => {
  let controller: LogServiceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LogServiceController],
    }).compile();

    controller = module.get<LogServiceController>(LogServiceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
