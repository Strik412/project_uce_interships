import { IsUUID, IsString, IsNumber, IsEnum, IsOptional, IsObject, IsNotEmpty, IsDateString } from 'class-validator';
import { MetricType, MetricScope } from '../domain/metric.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMetricDto {
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

  @ApiProperty({ description: 'Metric type', enum: MetricType })
  @IsEnum(MetricType)
  @IsNotEmpty()
  type!: MetricType;

  @ApiProperty({ description: 'Metric scope', enum: MetricScope })
  @IsEnum(MetricScope)
  @IsNotEmpty()
  scope!: MetricScope;

  @ApiProperty({ description: 'Metric value' })
  @IsNumber()
  @IsNotEmpty()
  value!: number;

  @ApiPropertyOptional({ description: 'Unit of measurement' })
  @IsString()
  @IsOptional()
  unit?: string;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Metric description' })
  @IsString()
  @IsOptional()
  description?: string;
}

export class MetricResponseDto {
  @ApiProperty()
  id!: string;

  @ApiPropertyOptional()
  userId?: string;

  @ApiPropertyOptional()
  practiceId?: string;

  @ApiPropertyOptional()
  companyId?: string;

  @ApiProperty({ enum: MetricType })
  type!: MetricType;

  @ApiProperty({ enum: MetricScope })
  scope!: MetricScope;

  @ApiProperty()
  value!: number;

  @ApiPropertyOptional()
  unit?: string;

  @ApiProperty()
  date!: Date;

  @ApiPropertyOptional()
  metadata?: Record<string, any>;

  @ApiProperty()
  isAnomalous!: boolean;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

export class MetricsTrendDto {
  @ApiProperty({ description: 'Metric type', enum: MetricType })
  @IsEnum(MetricType)
  @IsNotEmpty()
  type!: MetricType;

  @ApiProperty({ description: 'Days to look back' })
  @IsNumber()
  @IsNotEmpty()
  days!: number;
}

export class CreateMetricsDto {
  @ApiProperty({ type: [CreateMetricDto], description: 'Array of metrics to create' })
  @IsNotEmpty()
  metrics!: CreateMetricDto[];
}
