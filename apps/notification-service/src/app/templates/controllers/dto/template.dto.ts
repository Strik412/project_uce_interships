import { IsString, IsNotEmpty, IsOptional, IsEnum, MaxLength, IsArray } from 'class-validator';
import { TemplateType } from '../../domain/notification-template.entity';

export class CreateTemplateDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @IsEnum(TemplateType)
  @IsNotEmpty()
  type!: TemplateType;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  subject!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  content!: string;

  @IsOptional()
  @IsString()
  htmlContent?: string;

  @IsOptional()
  @IsArray()
  variables?: string[];
}

export class UpdateTemplateDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  subject?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  content?: string;

  @IsOptional()
  @IsString()
  htmlContent?: string;
}

export class TemplateResponseDto {
  id!: string;
  name!: string;
  type!: string;
  subject!: string;
  content!: string;
  active!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
}
