import { Test, TestingModule } from '@nestjs/testing';
import { GptGeneratorController } from './gpt-generator.controller';

describe('GptGeneratorController', () => {
  let controller: GptGeneratorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GptGeneratorController],
    }).compile();

    controller = module.get<GptGeneratorController>(GptGeneratorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
