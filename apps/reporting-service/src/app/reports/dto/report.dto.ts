import { IsUUID, IsString, IsEnum, IsOptional, IsObject, IsNotEmpty } from 'class-validator';
import { ReportType, ReportStatus } from '../domain/report.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReportDto {
  @ApiProperty({ description: 'User ID who is requesting the report' })
  @IsUUID()
  @IsNotEmpty()
  userId!: string;

  @ApiProperty({
    description: 'Type of report',
    enum: ReportType,
  })
  @IsEnum(ReportType)
  @IsNotEmpty()
  type!: ReportType;

  @ApiProperty({ description: 'Report title' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiPropertyOptional({ description: 'Report description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Filters applied to the report' })
  @IsObject()
  @IsOptional()
  filters?: Record<string, any>;
}

export class UpdateReportDto {
  @ApiPropertyOptional({ description: 'Report title' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ description: 'Report description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Filters applied to the report' })
  @IsObject()
  @IsOptional()
  filters?: Record<string, any>;
}

export class ReportResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  userId!: string;

  @ApiProperty({ enum: ReportType })
  type!: ReportType;

  @ApiProperty()
  title!: string;

  @ApiProperty({ enum: ReportStatus })
  status!: ReportStatus;

  @ApiPropertyOptional()
  description?: string;

  @ApiPropertyOptional()
  filters?: Record<string, any>;

  @ApiPropertyOptional()
  data?: Record<string, any>;

  @ApiPropertyOptional()
  fileUrl?: string;

  @ApiPropertyOptional()
  fileSize!: number;

  @ApiPropertyOptional()
  generatedAt?: Date;

  @ApiPropertyOptional()
  expiresAt?: Date;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

export class GenerateReportDto {
  @ApiProperty({ description: 'User ID' })
  @IsUUID()
  @IsNotEmpty()
  userId!: string;

  @ApiProperty({ description: 'Report type', enum: ReportType })
  @IsEnum(ReportType)
  @IsNotEmpty()
  type!: ReportType;

  @ApiPropertyOptional({ description: 'Optional filters' })
  @IsObject()
  @IsOptional()
  filters?: Record<string, any>;
}
