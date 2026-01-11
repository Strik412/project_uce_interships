import {
  IsString,
  IsUUID,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  MaxLength,
  IsNumber,
  IsArray,
} from 'class-validator';
import { DocumentType, DocumentAccessLevel } from '../../domain/document.entity';

export class UploadDocumentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsEnum(DocumentType)
  @IsNotEmpty()
  type!: DocumentType;

  @IsString()
  @IsNotEmpty()
  fileUrl!: string;

  @IsOptional()
  @IsString()
  mimeType?: string;

  @IsOptional()
  @IsNumber()
  fileSize?: number;

  @IsOptional()
  @IsUUID()
  practiceId?: string;

  @IsOptional()
  @IsEnum(DocumentAccessLevel)
  accessLevel?: DocumentAccessLevel;
}

export class UpdateDocumentDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsEnum(DocumentAccessLevel)
  accessLevel?: DocumentAccessLevel;

  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  sharedWith?: string[];

  @IsOptional()
  metadata?: Record<string, any>;
}

export class ApproveDocumentDto {
  @IsString()
  @IsNotEmpty()
  approvedBy!: string;
}

export class RejectDocumentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  reason!: string;

  @IsString()
  @IsNotEmpty()
  rejectedBy!: string;
}

export class ShareDocumentDto {
  @IsArray()
  @IsUUID('all', { each: true })
  @IsNotEmpty()
  userIds!: string[];
}

export class DocumentResponseDto {
  id!: string;
  userId!: string;
  practiceId?: string;
  title!: string;
  description?: string;
  type!: string;
  fileUrl!: string;
  mimeType?: string;
  fileSize!: number;
  status!: string;
  accessLevel!: string;
  uploadedBy?: string;
  sharedWith!: string[];
  version!: number;
  metadata?: Record<string, any>;
  approvedAt?: Date;
  approvedBy?: string;
  rejectionReason?: string;
  expiresAt?: Date;
  createdAt!: Date;
  updatedAt!: Date;
}
