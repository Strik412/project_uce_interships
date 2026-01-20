import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation, ConversationType } from '../domain/conversation.entity';

@Injectable()
export class ConversationRepository {
  constructor(
    @InjectRepository(Conversation)
    private readonly repository: Repository<Conversation>,
  ) {}

  async create(conversation: Partial<Conversation>): Promise<Conversation> {
    const newConversation = this.repository.create(conversation);
    return this.repository.save(newConversation);
  }

  async findById(id: string): Promise<Conversation | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByParticipant(userId: string): Promise<Conversation[]> {
    return this.repository
      .createQueryBuilder('c')
      .where(':userId = ANY(c.participantIds)', { userId })
      .orderBy('c.lastMessageAt', 'DESC')
      .addOrderBy('c.createdAt', 'DESC')
      .getMany();
  }

  async findDirectConversation(userId1: string, userId2: string): Promise<Conversation | null> {
    return this.repository
      .createQueryBuilder('c')
      .where('c.type = :type', { type: ConversationType.DIRECT })
      .andWhere(':userId1 = ANY(c.participantIds)', { userId1 })
      .andWhere(':userId2 = ANY(c.participantIds)', { userId2 })
      .getOne() ?? null;
  }

  async findGroupConversations(userId: string): Promise<Conversation[]> {
    return this.repository
      .createQueryBuilder('c')
      .where('c.type = :type', { type: ConversationType.GROUP })
      .andWhere(':userId = ANY(c.participantIds)', { userId })
      .orderBy('c.lastMessageAt', 'DESC')
      .getMany();
  }

  async update(id: string, conversation: Partial<Conversation>): Promise<Conversation | null> {
    await this.repository.update(id, conversation);
    return this.findById(id);
  }

  async addParticipant(id: string, userId: string): Promise<Conversation | null> {
    const conv = await this.findById(id);
    if (conv && !conv.participantIds.includes(userId)) {
      conv.participantIds.push(userId);
      return this.repository.save(conv);
    }
    return conv ?? null;
  }

  async removeParticipant(id: string, userId: string): Promise<Conversation | null> {
    const conv = await this.findById(id);
    if (conv) {
      conv.participantIds = conv.participantIds.filter((id) => id !== userId);
      return this.repository.save(conv);
    }
    return null;
  }

  async archive(id: string): Promise<Conversation | null> {
    return this.update(id, { isArchived: true });
  }

  async unarchive(id: string): Promise<Conversation | null> {
    return this.update(id, { isArchived: false });
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async findAll(): Promise<Conversation[]> {
    return this.repository.find({ order: { createdAt: 'DESC' } });
  }
}
