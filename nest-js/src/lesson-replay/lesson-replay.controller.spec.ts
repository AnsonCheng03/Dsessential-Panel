import { Test, TestingModule } from '@nestjs/testing';
import { LessonReplayController } from './lesson-replay.controller';

describe('LessonReplayController', () => {
  let controller: LessonReplayController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LessonReplayController],
    }).compile();

    controller = module.get<LessonReplayController>(LessonReplayController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
