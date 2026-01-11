import { IsString, IsUUID, IsNotEmpty, IsOptional, IsArray, MaxLength, MinLength } from 'class-validator';

export class SendMessageDto {
  @IsUUID()
  @IsNotEmpty()
  conversationId!: string;

  @IsUUID()
  @IsNotEmpty()
  receiverId!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(5000)
  content!: string;

  @IsOptional()
  @IsArray()
  attachments?: Array<{ url: string; type: string; name: string }>;
}

export class EditMessageDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(5000)
  content!: string;
}

export class MessageResponseDto {
  id!: string;
  conversationId!: string;
  senderId!: string;
  receiverId!: string;
  content!: string;
  status!: string;
  isEdited!: boolean;
  editedAt?: Date;
  readAt?: Date;
  createdAt!: Date;
  updatedAt!: Date;
}
