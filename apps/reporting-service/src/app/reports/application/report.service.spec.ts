import { Test, TestingModule } from '@nestjs/testing';
import { ReportService } from './report.service';
import { ReportRepository } from '../infrastructure/report.repository';
import { ReportStatus } from '../domain/report.entity';

const mockReportRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
});

describe('ReportService', () => {
  let service: ReportService;
  let reportRepository: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportService,
        { provide: ReportRepository, useFactory: mockReportRepository },
      ],
    }).compile();

    service = module.get<ReportService>(ReportService);
    reportRepository = module.get(ReportRepository);
    jest.clearAllMocks();
  });

  it('should create a new report', async () => {
    const dto = { userId: '1', type: 'summary', title: 'Test', description: 'Desc', filters: {} };
    const mockReport = { id: 'r1', ...dto, status: ReportStatus.PENDING };
    reportRepository.create.mockReturnValue(mockReport);
    reportRepository.save.mockResolvedValue(mockReport);

    const result = await service.createReport(dto as any);
    expect(reportRepository.create).toHaveBeenCalledWith({
      userId: '1',
      type: 'summary',
      title: 'Test',
      description: 'Desc',
      filters: {},
      status: ReportStatus.PENDING,
    });
    expect(reportRepository.save).toHaveBeenCalledWith(mockReport);
    expect(result).toBe(mockReport);
  });
});
