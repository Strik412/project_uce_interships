import { Controller, Get, Post, Put, Delete, Param, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ConversationService } from '../services/conversation.service';
import {
  CreateDirectConversationDto,
  CreateGroupConversationDto,
  UpdateConversationDto,
  AddParticipantDto,
  ConversationResponseDto,
} from './dto/conversation.dto';
import { Conversation } from '../domain/conversation.entity';

@ApiTags('Conversations')
@Controller('conversations')
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @Post('direct')
  @HttpCode(HttpStatus.CREATED)
  async createDirectConversation(@Body() createDto: CreateDirectConversationDto): Promise<Conversation> {
    return this.conversationService.createDirectConversation(
      createDto.userId, // Will get from JWT in real app
      createDto.userId,
    );
  }

  @Post('group')
  @HttpCode(HttpStatus.CREATED)
  async createGroupConversation(@Body() createDto: CreateGroupConversationDto): Promise<Conversation> {
    return this.conversationService.createGroupConversation(
      createDto.name,
      createDto.description || '',
      createDto.participantIds,
      createDto.participantIds[0],
    );
  }

  @Get(':id')
  async getConversationById(@Param('id') id: string): Promise<Conversation> {
    return this.conversationService.getConversationById(id);
  }

  @Get('participant/:userId')
  async getParticipantConversations(@Param('userId') userId: string): Promise<Conversation[]> {
    return this.conversationService.getParticipantConversations(userId);
  }

  @Get('direct/:otherUserId')
  async getDirectConversation(@Param('otherUserId') otherUserId: string): Promise<Conversation> {
    return this.conversationService.getDirectConversation(
      otherUserId, // Will get from JWT
      otherUserId,
    );
  }

  @Get('groups/:userId')
  async getUserGroupConversations(@Param('userId') userId: string): Promise<Conversation[]> {
    return this.conversationService.getUserGroupConversations(userId);
  }

  @Put(':id')
  async updateConversation(@Param('id') id: string, @Body() updateDto: UpdateConversationDto): Promise<Conversation> {
    return this.conversationService.updateConversation(id, updateDto.name, updateDto.description);
  }

  @Post(':id/participants')
  @HttpCode(HttpStatus.OK)
  async addParticipant(@Param('id') id: string, @Body() addParticipantDto: AddParticipantDto): Promise<Conversation> {
    return this.conversationService.addParticipant(id, addParticipantDto.userId);
  }

  @Delete(':id/participants/:userId')
  @HttpCode(HttpStatus.OK)
  async removeParticipant(@Param('id') id: string, @Param('userId') userId: string): Promise<Conversation> {
    return this.conversationService.removeParticipant(id, userId);
  }

  @Post(':id/archive')
  @HttpCode(HttpStatus.OK)
  async archiveConversation(@Param('id') id: string): Promise<Conversation> {
    return this.conversationService.archiveConversation(id);
  }

  @Post(':id/unarchive')
  @HttpCode(HttpStatus.OK)
  async unarchiveConversation(@Param('id') id: string): Promise<Conversation> {
    return this.conversationService.unarchiveConversation(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteConversation(@Param('id') id: string): Promise<void> {
    await this.conversationService.deleteConversation(id);
  }

  @Get()
  async getAllConversations(): Promise<Conversation[]> {
    return this.conversationService.getAllConversations();
  }
}
