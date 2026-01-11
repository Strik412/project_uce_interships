import { IsString, IsUUID, IsNotEmpty, IsOptional, IsEnum, MaxLength } from 'class-validator';
import { NotificationType, NotificationPriority } from '../../domain/notification.entity';

export class SendNotificationDto {
  @IsUUID()
  @IsNotEmpty()
  userId!: string;

  @IsEnum(NotificationType)
  @IsNotEmpty()
  type!: NotificationType;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  content!: string;

  @IsOptional()
  @IsEnum(NotificationPriority)
  priority?: NotificationPriority;

  @IsOptional()
  @IsString()
  recipient?: string;

  @IsOptional()
  data?: Record<string, any>;
}

export class MarkAsReadDto {
  @IsUUID()
  @IsNotEmpty()
  notificationId!: string;
}

export class GetNotificationsFilterDto {
  @IsOptional()
  @IsEnum(['unread', 'pending', 'all'])
  status?: 'unread' | 'pending' | 'all';

  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;
}

export class NotificationResponseDto {
  id!: string;
  userId!: string;
  type!: string;
  title!: string;
  content!: string;
  status!: string;
  priority!: string;
  data?: Record<string, any>;
  recipient?: string;
  readAt?: Date;
  sentAt?: Date;
  deliveredAt?: Date;
  error?: string;
  createdAt!: Date;
  updatedAt!: Date;
}
