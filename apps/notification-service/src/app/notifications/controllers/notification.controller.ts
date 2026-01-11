import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { NotificationService } from '../services/notification.service';
import {
  SendNotificationDto,
  MarkAsReadDto,
  NotificationResponseDto,
  GetNotificationsFilterDto,
} from './dto/notification.dto';

@Controller('notifications')
@ApiTags('Notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Send a new notification' })
  @ApiResponse({
    status: 201,
    description: 'Notification sent successfully',
    type: NotificationResponseDto,
  })
  async sendNotification(@Body() sendNotificationDto: SendNotificationDto) {
    const notification = await this.notificationService.sendNotification(
      sendNotificationDto.userId,
      sendNotificationDto.type,
      sendNotificationDto.title,
      sendNotificationDto.content,
      sendNotificationDto.priority,
      sendNotificationDto.recipient,
      sendNotificationDto.data,
    );
    return this.toResponseDto(notification);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get all notifications for a user' })
  @ApiResponse({
    status: 200,
    description: 'List of user notifications',
    type: [NotificationResponseDto],
  })
  async getUserNotifications(
    @Param('userId') userId: string,
    @Query() filterDto: GetNotificationsFilterDto,
  ) {
    let notifications;

    if (filterDto.status === 'unread') {
      notifications = await this.notificationService.getUnreadNotifications(userId);
    } else if (filterDto.status === 'pending') {
      notifications = await this.notificationService.getPendingNotifications(userId);
    } else {
      notifications = await this.notificationService.getUserNotifications(userId);
    }

    return notifications.map((n: any) => this.toResponseDto(n));
  }

  @Get('user/:userId/unread')
  @ApiOperation({ summary: 'Get unread notifications for a user' })
  @ApiResponse({
    status: 200,
    description: 'List of unread notifications',
    type: [NotificationResponseDto],
  })
  async getUnreadNotifications(@Param('userId') userId: string) {
    const notifications = await this.notificationService.getUnreadNotifications(userId);
    return notifications.map((n: any) => this.toResponseDto(n));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get notification by ID' })
  @ApiResponse({
    status: 200,
    description: 'Notification details',
    type: NotificationResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async getNotificationById(@Param('id') id: string) {
    const notification = await this.notificationService.getNotificationById(id);
    if (!notification) {
      throw new Error('Notification not found');
    }
    return this.toResponseDto(notification);
  }

  @Put(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiResponse({
    status: 200,
    description: 'Notification marked as read',
    type: NotificationResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async markAsRead(@Param('id') id: string, @Body() markAsReadDto: MarkAsReadDto) {
    const notification = await this.notificationService.markAsRead(id);
    if (!notification) {
      throw new Error('Notification not found');
    }
    return this.toResponseDto(notification);
  }

  @Put('user/:userId/read-all')
  @ApiOperation({ summary: 'Mark all notifications as read for a user' })
  @ApiResponse({
    status: 200,
    description: 'All notifications marked as read',
  })
  async markAllAsRead(@Param('userId') userId: string) {
    await this.notificationService.markAllAsRead(userId);
    return { message: 'All notifications marked as read' };
  }

  @Put(':id/sent')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark notification as sent' })
  @ApiResponse({
    status: 200,
    description: 'Notification marked as sent',
    type: NotificationResponseDto,
  })
  async markAsSent(@Param('id') id: string) {
    const notification = await this.notificationService.markAsSent(id);
    if (!notification) {
      throw new Error('Notification not found');
    }
    return this.toResponseDto(notification);
  }

  @Put(':id/delivered')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark notification as delivered' })
  @ApiResponse({
    status: 200,
    description: 'Notification marked as delivered',
    type: NotificationResponseDto,
  })
  async markAsDelivered(@Param('id') id: string) {
    const notification = await this.notificationService.markAsDelivered(id);
    if (!notification) {
      throw new Error('Notification not found');
    }
    return this.toResponseDto(notification);
  }

  @Put(':id/failed')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark notification as failed' })
  @ApiResponse({
    status: 200,
    description: 'Notification marked as failed',
    type: NotificationResponseDto,
  })
  async markAsFailed(@Param('id') id: string, @Body('reason') reason?: string) {
    const notification = await this.notificationService.markAsFailed(id, reason);
    if (!notification) {
      throw new Error('Notification not found');
    }
    return this.toResponseDto(notification);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a notification' })
  @ApiResponse({ status: 204, description: 'Notification deleted successfully' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async deleteNotification(@Param('id') id: string) {
    await this.notificationService.deleteNotification(id);
  }

  private toResponseDto(notification: any): NotificationResponseDto {
    return {
      id: notification.id,
      userId: notification.userId,
      type: notification.type,
      title: notification.title,
      content: notification.content,
      status: notification.status,
      priority: notification.priority,
      data: notification.data,
      recipient: notification.recipient,
      readAt: notification.readAt,
      sentAt: notification.sentAt,
      deliveredAt: notification.deliveredAt,
      error: notification.error,
      createdAt: notification.createdAt,
      updatedAt: notification.updatedAt,
    };
  }
}
