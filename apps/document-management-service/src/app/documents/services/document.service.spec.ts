import { Test, TestingModule } from '@nestjs/testing';
import { DocumentService } from './document.service';
import { DocumentRepository } from '../repositories/document.repository';
import { DocumentStatus, DocumentType } from '../domain/document.entity';

const mockDocumentRepository = () => ({
  create: jest.fn(),
});

describe('DocumentService', () => {
  let service: DocumentService;
  let documentRepository: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentService,
        { provide: DocumentRepository, useFactory: mockDocumentRepository },
      ],
    }).compile();

    service = module.get<DocumentService>(DocumentService);
    documentRepository = module.get(DocumentRepository);
    jest.clearAllMocks();
  });

  it('should upload a new document with required fields', async () => {
    const dto = {
      userId: '1',
      title: 'Test Doc',
      description: 'Desc',
      type: DocumentType.REPORT,
      fileUrl: 'http://file.url',
    };
    const mockDoc = { id: 'd1', ...dto, status: DocumentStatus.DRAFT, uploadedBy: '1' };
    documentRepository.create.mockResolvedValue(mockDoc);

    const result = await service.uploadDocument(
      dto.userId,
      dto.title,
      dto.description,
      dto.type,
      dto.fileUrl
    );
    expect(documentRepository.create).toHaveBeenCalledWith({
      userId: '1',
      title: 'Test Doc',
      description: 'Desc',
      type: DocumentType.REPORT,
      fileUrl: 'http://file.url',
      mimeType: undefined,
      fileSize: undefined,
      practiceId: undefined,
      status: DocumentStatus.DRAFT,
      uploadedBy: '1',
    });
    expect(result).toBe(mockDoc);
  });
});
