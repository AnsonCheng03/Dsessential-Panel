import { Test, TestingModule } from '@nestjs/testing';
import { LessonReplayService } from './lesson-replay.service';

describe('LessonReplayService', () => {
  let service: LessonReplayService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LessonReplayService],
    }).compile();

    service = module.get<LessonReplayService>(LessonReplayService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
