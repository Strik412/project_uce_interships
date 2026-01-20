import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';
import { PracticeStatus, ValidationStatus } from '@shared/types';

export class CreatePracticeDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  userId!: string;

  @ApiProperty({ example: 'Acme Corp', required: false })
  @IsOptional()
  @IsString()
  companyName?: string;

  @ApiProperty({ example: 'Medellín, Colombia', required: false })
  @IsOptional()
  @IsString()
  companyLocation?: string;

  @ApiProperty({ example: 'Desarrollar aplicación web', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ type: Date, example: '2025-01-15', required: false })
  @IsOptional()
  @IsDate()
  startDate?: Date;

  @ApiProperty({ type: Date, example: '2025-06-15', required: false })
  @IsOptional()
  @IsDate()
  endDate?: Date;

  @ApiProperty({ example: 480, default: 0 })
  @IsOptional()
  @IsNumber()
  totalHours?: number;
}

export class UpdatePracticeDto {
  @ApiProperty({ example: 'Acme Corp', required: false })
  @IsOptional()
  @IsString()
  companyName?: string;

  @ApiProperty({ example: 'Medellín, Colombia', required: false })
  @IsOptional()
  @IsString()
  companyLocation?: string;

  @ApiProperty({ example: 'Desarrollar aplicación web', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 240 })
  @IsOptional()
  @IsNumber()
  hoursCompleted?: number;

  @ApiProperty({ enum: PracticeStatus, required: false })
  @IsOptional()
  status?: PracticeStatus;

  @ApiProperty({ enum: ValidationStatus, required: false })
  @IsOptional()
  validationStatus?: ValidationStatus;
}

export class QueryPracticesDto {
  @ApiProperty({ example: 1, default: 1, required: false })
  @IsOptional()
  @IsNumber()
  page?: number;

  @ApiProperty({ example: 10, default: 10, required: false })
  @IsOptional()
  @IsNumber()
  limit?: number;

  @ApiProperty({ example: 'active', required: false })
  @IsOptional()
  @IsString()
  status?: PracticeStatus;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000', required: false })
  @IsOptional()
  @IsUUID()
  userId?: string;
}
