import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageModule } from './messages/message.module';
import { ConversationModule } from './conversations/conversation.module';
import { Message } from './messages/domain/message.entity';
import { Conversation } from './conversations/domain/conversation.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Message, Conversation]),
    MessageModule,
    ConversationModule,
  ],
})
export class CommunicationModule {}
