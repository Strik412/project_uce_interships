import { Controller, Get, Post, Put, Delete, Param, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MessageService } from '../services/message.service';
import { SendMessageDto, EditMessageDto, MessageResponseDto } from './dto/message.dto';
import { Message } from '../domain/message.entity';

@ApiTags('Messages')
@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async sendMessage(@Body() sendMessageDto: SendMessageDto): Promise<Message> {
    return this.messageService.sendMessage(
      sendMessageDto.conversationId,
      sendMessageDto.conversationId, // Will need to get from JWT in real app
      sendMessageDto.receiverId,
      sendMessageDto.content,
      sendMessageDto.attachments,
    );
  }

  @Get(':id')
  async getMessageById(@Param('id') id: string): Promise<Message> {
    return this.messageService.getMessageById(id);
  }

  @Get('conversation/:conversationId')
  async getConversationMessages(@Param('conversationId') conversationId: string): Promise<Message[]> {
    return this.messageService.getConversationMessages(conversationId);
  }

  @Get('sender/:senderId')
  async getSentMessages(@Param('senderId') senderId: string): Promise<Message[]> {
    return this.messageService.getSentMessages(senderId);
  }

  @Get('receiver/:receiverId/unread')
  async getUnreadMessages(@Param('receiverId') receiverId: string): Promise<Message[]> {
    return this.messageService.getUnreadMessages(receiverId);
  }

  @Get('receiver/:receiverId')
  async getReceivedMessages(@Param('receiverId') receiverId: string): Promise<Message[]> {
    return this.messageService.getReceivedMessages(receiverId);
  }

  @Put(':id')
  async editMessage(@Param('id') id: string, @Body() editDto: EditMessageDto): Promise<Message> {
    return this.messageService.editMessage(id, editDto.content);
  }

  @Post(':id/read')
  @HttpCode(HttpStatus.OK)
  async markAsRead(@Param('id') id: string): Promise<Message> {
    return this.messageService.markAsRead(id);
  }

  @Post(':id/delivered')
  @HttpCode(HttpStatus.OK)
  async markAsDelivered(@Param('id') id: string): Promise<Message> {
    return this.messageService.markAsDelivered(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteMessage(@Param('id') id: string): Promise<void> {
    await this.messageService.deleteMessage(id);
  }

  @Get()
  async getAllMessages(): Promise<Message[]> {
    return this.messageService.getAllMessages();
  }
}
