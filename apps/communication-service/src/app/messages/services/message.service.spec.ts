import { Test, TestingModule } from '@nestjs/testing';
import { MessageService } from './message.service';
import { MessageRepository } from '../repositories/message.repository';
import { MessageStatus } from '../domain/message.entity';

const mockMessageRepository = () => ({
  create: jest.fn(),
});

describe('MessageService', () => {
  let service: MessageService;
  let messageRepository: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageService,
        { provide: MessageRepository, useFactory: mockMessageRepository },
      ],
    }).compile();

    service = module.get<MessageService>(MessageService);
    messageRepository = module.get(MessageRepository);
    jest.clearAllMocks();
  });

  it('should send a new message with required fields', async () => {
    const dto = {
      conversationId: 'c1',
      senderId: 'u1',
      receiverId: 'u2',
      content: 'Hello',
    };
    const mockMessage = { id: 'm1', ...dto, status: MessageStatus.SENT };
    messageRepository.create.mockResolvedValue(mockMessage);

    const result = await service.sendMessage(
      dto.conversationId,
      dto.senderId,
      dto.receiverId,
      dto.content
    );
    expect(messageRepository.create).toHaveBeenCalledWith({
      conversationId: 'c1',
      senderId: 'u1',
      receiverId: 'u2',
      content: 'Hello',
      attachments: undefined,
      status: MessageStatus.SENT,
    });
    expect(result).toBe(mockMessage);
  });
});
