import { Test, TestingModule } from '@nestjs/testing';
import { ProgressService } from './progress.service';
import { ProgressRepository } from '../repositories/progress.repository';
import { ProgressStatus } from '../domain/progress.entity';

const mockProgressRepository = () => ({
  findByPlacementAndWeek: jest.fn(),
  create: jest.fn(),
});

describe('ProgressService', () => {
  let service: ProgressService;
  let progressRepository: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProgressService,
        { provide: ProgressRepository, useFactory: mockProgressRepository },
      ],
    }).compile();

    service = module.get<ProgressService>(ProgressService);
    progressRepository = module.get(ProgressRepository);
    jest.clearAllMocks();
  });

  it('should submit a new progress report if not exists for week', async () => {
    const dto = { placementId: '1', weekNumber: 2, content: 'Test' };
    const mockReport = { id: 'r1', ...dto, status: ProgressStatus.PENDING, reportDate: expect.any(Date) };
    progressRepository.findByPlacementAndWeek.mockResolvedValue(null);
    progressRepository.create.mockResolvedValue(mockReport);

    const result = await service.submitProgress(dto as any);
    expect(progressRepository.findByPlacementAndWeek).toHaveBeenCalledWith('1', 2);
    expect(progressRepository.create).toHaveBeenCalledWith({ ...dto, status: ProgressStatus.PENDING, reportDate: expect.any(Date) });
    expect(result).toBe(mockReport);
  });
});
