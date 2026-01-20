import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationStatus } from '../domain/notification.entity';

@Injectable()
export class NotificationRepository {
  constructor(
    @InjectRepository(Notification)
    private readonly repository: Repository<Notification>,
  ) {}

  async create(notification: Partial<Notification>): Promise<Notification> {
    const newNotification = this.repository.create(notification);
    return this.repository.save(newNotification);
  }

  async findById(id: string): Promise<Notification | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByUserId(userId: string, limit: number = 50): Promise<Notification[]> {
    return this.repository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async findUnreadByUserId(userId: string): Promise<Notification[]> {
    return this.repository.find({
      where: { userId, status: NotificationStatus.PENDING },
      order: { createdAt: 'DESC' },
    });
  }

  async findByStatus(status: NotificationStatus): Promise<Notification[]> {
    return this.repository.find({
      where: { status },
      order: { createdAt: 'DESC' },
    });
  }

  async findPending(userId?: string): Promise<Notification[]> {
    const query = this.repository.createQueryBuilder('notification');
    query.where('notification.status = :status', { status: NotificationStatus.PENDING });
    if (userId) {
      query.andWhere('notification.userId = :userId', { userId });
    }
    query.orderBy('notification.createdAt', 'ASC');
    return query.getMany();
  }

  async findPendingAll(): Promise<Notification[]> {
    return this.repository.find({
      where: { status: NotificationStatus.PENDING },
      order: { createdAt: 'ASC' },
    });
  }

  async update(id: string, notification: Partial<Notification>): Promise<Notification | null> {
    await this.repository.update(id, notification);
    return this.findById(id);
  }

  async markAsRead(id: string): Promise<Notification | null> {
    return this.update(id, { status: NotificationStatus.READ, readAt: new Date() });
  }

  async markAsSent(id: string): Promise<Notification | null> {
    return this.update(id, { status: NotificationStatus.SENT, sentAt: new Date() });
  }

  async markAsDelivered(id: string): Promise<Notification | null> {
    return this.update(id, { status: NotificationStatus.DELIVERED, deliveredAt: new Date() });
  }

  async markAsFailed(id: string, error?: string): Promise<Notification | null> {
    return this.update(id, { status: NotificationStatus.FAILED, error });
  }

  async markAllAsReadByUserId(userId: string): Promise<number> {
    const result = await this.repository.update(
      { userId, status: NotificationStatus.PENDING },
      { status: NotificationStatus.READ, readAt: new Date() },
    );
    return result.affected ?? 0;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async findAll(): Promise<Notification[]> {
    return this.repository.find({ order: { createdAt: 'DESC' } });
  }
}
