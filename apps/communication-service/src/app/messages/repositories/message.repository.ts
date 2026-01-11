import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message, MessageStatus } from '../domain/message.entity';

@Injectable()
export class MessageRepository {
  constructor(
    @InjectRepository(Message)
    private readonly repository: Repository<Message>,
  ) {}

  async create(message: Partial<Message>): Promise<Message> {
    const newMessage = this.repository.create(message);
    return this.repository.save(newMessage);
  }

  async findById(id: string): Promise<Message | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByConversationId(conversationId: string, limit: number = 50): Promise<Message[]> {
    return this.repository.find({
      where: { conversationId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async findBySenderId(senderId: string, limit: number = 50): Promise<Message[]> {
    return this.repository.find({
      where: { senderId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async findByReceiverId(receiverId: string): Promise<Message[]> {
    return this.repository.find({
      where: { receiverId, status: MessageStatus.SENT },
      order: { createdAt: 'DESC' },
    });
  }

  async findUnread(receiverId: string): Promise<Message[]> {
    return this.repository.find({
      where: { receiverId, status: MessageStatus.SENT },
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, message: Partial<Message>): Promise<Message | null> {
    await this.repository.update(id, message);
    return this.findById(id);
  }

  async markAsRead(id: string): Promise<Message | null> {
    return this.update(id, { status: MessageStatus.READ, readAt: new Date() });
  }

  async markAsDelivered(id: string): Promise<Message | null> {
    return this.update(id, { status: MessageStatus.DELIVERED });
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async findAll(): Promise<Message[]> {
    return this.repository.find({ order: { createdAt: 'DESC' } });
  }
}
