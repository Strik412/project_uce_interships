import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from './notification.service';
import { NotificationRepository } from '../repositories/notification.repository';
import { NotificationStatus, NotificationType, NotificationPriority } from '../domain/notification.entity';

const mockNotificationRepository = () => ({
  create: jest.fn(),
});

describe('NotificationService', () => {
  let service: NotificationService;
  let notificationRepository: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        { provide: NotificationRepository, useFactory: mockNotificationRepository },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
    notificationRepository = module.get(NotificationRepository);
    jest.clearAllMocks();
  });

  it('should send a new notification with required fields', async () => {
    const dto = {
      userId: '1',
      type: NotificationType.IN_APP,
      title: 'Test Notification',
      content: 'Content',
    };
    const mockNotification = { id: 'n1', ...dto, priority: NotificationPriority.NORMAL, status: NotificationStatus.PENDING };
    notificationRepository.create.mockResolvedValue(mockNotification);

    const result = await service.sendNotification(
      dto.userId,
      dto.type,
      dto.title,
      dto.content
    );
    expect(notificationRepository.create).toHaveBeenCalledWith({
      userId: '1',
      type: NotificationType.IN_APP,
      title: 'Test Notification',
      content: 'Content',
      priority: NotificationPriority.NORMAL,
      recipient: undefined,
      data: undefined,
      status: NotificationStatus.PENDING,
    });
    expect(result).toBe(mockNotification);
  });
});
