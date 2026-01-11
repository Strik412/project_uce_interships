import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { NotificationRepository } from '../repositories/notification.repository';
import { Notification, NotificationType, NotificationStatus, NotificationPriority } from '../domain/notification.entity';

@Injectable()
export class NotificationService {
  constructor(private readonly notificationRepository: NotificationRepository) {}

  async sendNotification(
    userId: string,
    type: NotificationType,
    title: string,
    content: string,
    priority?: NotificationPriority,
    recipient?: string,
    data?: Record<string, any>,
  ): Promise<Notification> {
    if (!title || !content) {
      throw new BadRequestException('Title and content are required');
    }

    return this.notificationRepository.create({
      userId,
      type,
      title,
      content,
      priority: priority || NotificationPriority.NORMAL,
      recipient,
      data,
      status: NotificationStatus.PENDING,
    });
  }

  async getNotificationById(id: string): Promise<Notification> {
    const notification = await this.notificationRepository.findById(id);
    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }
    return notification;
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    return this.notificationRepository.findByUserId(userId);
  }

  async getUnreadNotifications(userId: string): Promise<Notification[]> {
    return this.notificationRepository.findUnreadByUserId(userId);
  }

  async getPendingNotifications(userId: string): Promise<Notification[]> {
    return this.notificationRepository.findPending(userId);
  }

  async markAsRead(id: string): Promise<Notification> {
    const updated = await this.notificationRepository.markAsRead(id);
    if (!updated) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }
    return updated;
  }

  async markAllAsRead(userId: string): Promise<number> {
    return this.notificationRepository.markAllAsReadByUserId(userId);
  }

  async markAsSent(id: string): Promise<Notification> {
    const updated = await this.notificationRepository.markAsSent(id);
    if (!updated) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }
    return updated;
  }

  async markAsDelivered(id: string): Promise<Notification> {
    const updated = await this.notificationRepository.markAsDelivered(id);
    if (!updated) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }
    return updated;
  }

  async markAsFailed(id: string, error?: string): Promise<Notification> {
    const updated = await this.notificationRepository.markAsFailed(id, error);
    if (!updated) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }
    return updated;
  }

  async getPendingNotificationsAll(): Promise<Notification[]> {
    return this.notificationRepository.findPendingAll();
  }

  async deleteNotification(id: string): Promise<void> {
    const success = await this.notificationRepository.delete(id);
    if (!success) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }
  }

  async getAllNotifications(): Promise<Notification[]> {
    return this.notificationRepository.findAll();
  }
}
