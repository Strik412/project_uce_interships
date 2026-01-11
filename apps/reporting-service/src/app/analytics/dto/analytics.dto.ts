import { IsUUID, IsString, IsEnum, IsOptional, IsObject, IsNotEmpty, IsDate, IsArray, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TrendDirection } from '../domain/analytics.entity';

export class AnalyticsSummaryDto {
  @ApiProperty()
  totalTasks!: number;

  @ApiProperty()
  completedTasks!: number;

  @ApiProperty()
  avgCompletionTime!: number;

  @ApiProperty()
  documentCount!: number;

  @ApiProperty()
  messageCount!: number;

  @ApiProperty()
  engagementScore!: number;
}

export class TrendDto {
  @ApiProperty()
  metric!: string;

  @ApiProperty({ enum: TrendDirection })
  @IsEnum(TrendDirection)
  direction!: TrendDirection;

  @ApiProperty()
  percentage!: number;
}

export class CreateAnalyticsDto {
  @ApiPropertyOptional({ description: 'User ID' })
  @IsUUID()
  @IsOptional()
  userId?: string;

  @ApiPropertyOptional({ description: 'Practice ID' })
  @IsUUID()
  @IsOptional()
  practiceId?: string;

  @ApiPropertyOptional({ description: 'Company ID' })
  @IsUUID()
  @IsOptional()
  companyId?: string;

  @ApiProperty({ description: 'Period type (weekly, monthly, quarterly)' })
  @IsString()
  @IsNotEmpty()
  period!: string;

  @ApiProperty({ description: 'Start date' })
  @IsNotEmpty()
  startDate!: Date;

  @ApiProperty({ description: 'End date' })
  @IsNotEmpty()
  endDate!: Date;

  @ApiProperty({ description: 'Summary data', type: AnalyticsSummaryDto })
  @IsObject()
  @IsNotEmpty()
  summary!: AnalyticsSummaryDto;

  @ApiProperty({ description: 'Trends', type: [TrendDto] })
  @IsArray()
  @IsNotEmpty()
  trends!: TrendDto[];

  @ApiPropertyOptional({ description: 'Comparisons' })
  @IsObject()
  @IsOptional()
  comparisons?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Recommendations' })
  @IsArray()
  @IsOptional()
  recommendations?: string[];

  @ApiPropertyOptional({ description: 'Warnings' })
  @IsArray()
  @IsOptional()
  warnings?: string[];
}

export class AnalyticsResponseDto {
  @ApiProperty()
  id!: string;

  @ApiPropertyOptional()
  userId?: string;

  @ApiPropertyOptional()
  practiceId?: string;

  @ApiPropertyOptional()
  companyId?: string;

  @ApiProperty()
  period!: string;

  @ApiProperty()
  startDate!: Date;

  @ApiProperty()
  endDate!: Date;

  @ApiProperty({ type: AnalyticsSummaryDto })
  summary!: AnalyticsSummaryDto;

  @ApiProperty({ type: [TrendDto] })
  trends!: TrendDto[];

  @ApiPropertyOptional()
  comparisons?: Record<string, any>;

  @ApiPropertyOptional()
  recommendations?: string[];

  @ApiPropertyOptional()
  warnings?: string[];

  @ApiProperty()
  hasAnomalies!: boolean;

  @ApiProperty()
  anomalyCount!: number;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

export class AnalyticsQueryDto {
  @ApiPropertyOptional({ description: 'User ID' })
  @IsUUID()
  @IsOptional()
  userId?: string;

  @ApiPropertyOptional({ description: 'Period' })
  @IsString()
  @IsOptional()
  period?: string;

  @ApiPropertyOptional({ description: 'Start date' })
  @IsOptional()
  startDate?: Date;

  @ApiPropertyOptional({ description: 'End date' })
  @IsOptional()
  endDate?: Date;
}
