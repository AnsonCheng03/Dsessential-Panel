import { Test, TestingModule } from '@nestjs/testing';
import { AiserviceService } from './aiservice.service';

describe('AiserviceService', () => {
  let service: AiserviceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AiserviceService],
    }).compile();

    service = module.get<AiserviceService>(AiserviceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
