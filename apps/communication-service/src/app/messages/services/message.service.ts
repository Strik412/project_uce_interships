import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { MessageRepository } from '../repositories/message.repository';
import { Message, MessageStatus } from '../domain/message.entity';

@Injectable()
export class MessageService {
  constructor(private readonly messageRepository: MessageRepository) {}

  async sendMessage(
    conversationId: string,
    senderId: string,
    receiverId: string,
    content: string,
    attachments?: Array<{ url: string; type: string; name: string }>,
  ): Promise<Message> {
    if (!content || content.trim().length === 0) {
      throw new BadRequestException('Message content cannot be empty');
    }

    return this.messageRepository.create({
      conversationId,
      senderId,
      receiverId,
      content: content.trim(),
      attachments,
      status: MessageStatus.SENT,
    });
  }

  async getMessageById(id: string): Promise<Message> {
    const message = await this.messageRepository.findById(id);
    if (!message) {
      throw new NotFoundException(`Message with ID ${id} not found`);
    }
    return message;
  }

  async getConversationMessages(conversationId: string, limit: number = 50): Promise<Message[]> {
    return this.messageRepository.findByConversationId(conversationId, limit);
  }

  async getSentMessages(senderId: string): Promise<Message[]> {
    return this.messageRepository.findBySenderId(senderId);
  }

  async getUnreadMessages(receiverId: string): Promise<Message[]> {
    return this.messageRepository.findUnread(receiverId);
  }

  async getReceivedMessages(receiverId: string): Promise<Message[]> {
    return this.messageRepository.findByReceiverId(receiverId);
  }

  async editMessage(id: string, newContent: string): Promise<Message> {
    if (!newContent || newContent.trim().length === 0) {
      throw new BadRequestException('Message content cannot be empty');
    }

    const updated = await this.messageRepository.update(id, {
      content: newContent.trim(),
      isEdited: true,
      editedAt: new Date(),
    });

    if (!updated) {
      throw new NotFoundException(`Message with ID ${id} not found`);
    }

    return updated;
  }

  async markAsRead(id: string): Promise<Message> {
    const updated = await this.messageRepository.markAsRead(id);
    if (!updated) {
      throw new NotFoundException(`Message with ID ${id} not found`);
    }
    return updated;
  }

  async markAsDelivered(id: string): Promise<Message> {
    const updated = await this.messageRepository.markAsDelivered(id);
    if (!updated) {
      throw new NotFoundException(`Message with ID ${id} not found`);
    }
    return updated;
  }

  async deleteMessage(id: string): Promise<void> {
    const success = await this.messageRepository.delete(id);
    if (!success) {
      throw new NotFoundException(`Message with ID ${id} not found`);
    }
  }

  async getAllMessages(): Promise<Message[]> {
    return this.messageRepository.findAll();
  }
}
