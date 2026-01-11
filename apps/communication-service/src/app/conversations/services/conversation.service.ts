import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConversationRepository } from '../repositories/conversation.repository';
import { Conversation, ConversationType } from '../domain/conversation.entity';

@Injectable()
export class ConversationService {
  constructor(private readonly conversationRepository: ConversationRepository) {}

  async createDirectConversation(userId1: string, userId2: string): Promise<Conversation> {
    if (userId1 === userId2) {
      throw new BadRequestException('Cannot create conversation with yourself');
    }

    // Check if direct conversation already exists
    const existing = await this.conversationRepository.findDirectConversation(userId1, userId2);
    if (existing) {
      return existing;
    }

    return this.conversationRepository.create({
      type: ConversationType.DIRECT,
      participantIds: [userId1, userId2],
      createdBy: userId1,
    });
  }

  async createGroupConversation(
    name: string,
    description: string,
    participantIds: string[],
    createdBy: string,
  ): Promise<Conversation> {
    if (!participantIds.includes(createdBy)) {
      participantIds.push(createdBy);
    }

    if (participantIds.length < 2) {
      throw new BadRequestException('Group conversation must have at least 2 participants');
    }

    return this.conversationRepository.create({
      type: ConversationType.GROUP,
      name,
      description,
      participantIds: [...new Set(participantIds)], // Remove duplicates
      createdBy,
    });
  }

  async getConversationById(id: string): Promise<Conversation> {
    const conversation = await this.conversationRepository.findById(id);
    if (!conversation) {
      throw new NotFoundException(`Conversation with ID ${id} not found`);
    }
    return conversation;
  }

  async getParticipantConversations(userId: string): Promise<Conversation[]> {
    return this.conversationRepository.findByParticipant(userId);
  }

  async getDirectConversation(userId1: string, userId2: string): Promise<Conversation> {
    const conversation = await this.conversationRepository.findDirectConversation(userId1, userId2);
    if (!conversation) {
      throw new NotFoundException('Direct conversation not found');
    }
    return conversation;
  }

  async getUserGroupConversations(userId: string): Promise<Conversation[]> {
    return this.conversationRepository.findGroupConversations(userId);
  }

  async updateConversation(id: string, name?: string, description?: string): Promise<Conversation> {
    const updated = await this.conversationRepository.update(id, { name, description });
    if (!updated) {
      throw new NotFoundException(`Conversation with ID ${id} not found`);
    }
    return updated;
  }

  async addParticipant(conversationId: string, userId: string): Promise<Conversation> {
    const updated = await this.conversationRepository.addParticipant(conversationId, userId);
    if (!updated) {
      throw new NotFoundException(`Conversation with ID ${conversationId} not found`);
    }
    return updated;
  }

  async removeParticipant(conversationId: string, userId: string): Promise<Conversation> {
    const conversation = await this.getConversationById(conversationId);

    if (conversation.participantIds.length <= 2) {
      throw new BadRequestException('Cannot remove participant: group would have less than 2 participants');
    }

    const updated = await this.conversationRepository.removeParticipant(conversationId, userId);
    if (!updated) {
      throw new NotFoundException(`Conversation with ID ${conversationId} not found`);
    }
    return updated;
  }

  async archiveConversation(id: string): Promise<Conversation> {
    const updated = await this.conversationRepository.archive(id);
    if (!updated) {
      throw new NotFoundException(`Conversation with ID ${id} not found`);
    }
    return updated;
  }

  async unarchiveConversation(id: string): Promise<Conversation> {
    const updated = await this.conversationRepository.unarchive(id);
    if (!updated) {
      throw new NotFoundException(`Conversation with ID ${id} not found`);
    }
    return updated;
  }

  async deleteConversation(id: string): Promise<void> {
    const success = await this.conversationRepository.delete(id);
    if (!success) {
      throw new NotFoundException(`Conversation with ID ${id} not found`);
    }
  }

  async getAllConversations(): Promise<Conversation[]> {
    return this.conversationRepository.findAll();
  }
}
