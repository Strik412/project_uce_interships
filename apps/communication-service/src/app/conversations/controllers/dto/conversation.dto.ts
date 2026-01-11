import { IsString, IsUUID, IsNotEmpty, IsOptional, IsArray, MaxLength } from 'class-validator';

export class CreateDirectConversationDto {
  @IsUUID()
  @IsNotEmpty()
  userId!: string;
}

export class CreateGroupConversationDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsArray()
  @IsNotEmpty()
  participantIds!: string[];
}

export class UpdateConversationDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;
}

export class AddParticipantDto {
  @IsUUID()
  @IsNotEmpty()
  userId!: string;
}

export class ConversationResponseDto {
  id!: string;
  type!: string;
  name?: string;
  description?: string;
  participantIds!: string[];
  lastMessageId?: string;
  lastMessageAt?: Date;
  isArchived!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
}
