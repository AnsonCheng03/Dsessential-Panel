import { Test, TestingModule } from '@nestjs/testing';
import { LogServiceService } from './log-service.service';

describe('LogServiceService', () => {
  let service: LogServiceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LogServiceService],
    }).compile();

    service = module.get<LogServiceService>(LogServiceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
