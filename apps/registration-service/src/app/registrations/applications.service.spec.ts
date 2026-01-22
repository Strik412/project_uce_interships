import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationsService } from './applications.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ApplicationEntity } from '../database/entities/application.entity';
import { PracticeEntity } from '../database/entities/practice.entity';
import { PlacementsService } from '../placements/placements.service';

const mockApplicationsRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
});
const mockPracticesRepository = () => ({});
const mockPlacementsService = {};

describe('ApplicationsService', () => {
  let service: ApplicationsService;
  let applicationsRepository: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationsService,
        { provide: getRepositoryToken(ApplicationEntity), useFactory: mockApplicationsRepository },
        { provide: getRepositoryToken(PracticeEntity), useFactory: mockPracticesRepository },
        { provide: PlacementsService, useValue: mockPlacementsService },
      ],
    }).compile();

    service = module.get<ApplicationsService>(ApplicationsService);
    applicationsRepository = module.get(getRepositoryToken(ApplicationEntity));
    jest.clearAllMocks();
  });

  it('should create a new application', async () => {
    const dto = { practiceId: '1', userId: '2' };
    const mockApp = { id: 'app1', practice: { id: '1' }, user: { id: '2' } };
    applicationsRepository.create.mockReturnValue(mockApp);
    applicationsRepository.save.mockResolvedValue(mockApp);

    const result = await service.create(dto as any);
    expect(applicationsRepository.create).toHaveBeenCalledWith({ practice: { id: '1' }, user: { id: '2' } });
    expect(applicationsRepository.save).toHaveBeenCalledWith(mockApp);
    expect(result).toBe(mockApp);
  });
});
