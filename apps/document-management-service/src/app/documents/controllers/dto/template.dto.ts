import { IsString, IsNotEmpty, IsOptional, IsEnum, MaxLength, IsArray } from 'class-validator';
import { TemplateType } from '../../domain/document-template.entity';

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
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  content?: string;

  @IsOptional()
  @IsString()
  htmlContent?: string;

  @IsOptional()
  @IsArray()
  variables?: string[];
}

export class TemplateResponseDto {
  id!: string;
  name!: string;
  type!: string;
  content!: string;
  htmlContent?: string;
  variables!: string[];
  active!: boolean;
  version!: number;
  createdAt!: Date;
  updatedAt!: Date;
}
