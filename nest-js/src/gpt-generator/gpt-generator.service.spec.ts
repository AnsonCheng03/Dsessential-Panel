import { Test, TestingModule } from '@nestjs/testing';
import { GptGeneratorService } from './gpt-generator.service';

describe('GptGeneratorService', () => {
  let service: GptGeneratorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GptGeneratorService],
    }).compile();

    service = module.get<GptGeneratorService>(GptGeneratorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
