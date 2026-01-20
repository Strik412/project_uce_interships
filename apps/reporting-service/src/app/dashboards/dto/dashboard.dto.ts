import { IsUUID, IsString, IsEnum, IsOptional, IsObject, IsNotEmpty, IsArray, IsNumber } from 'class-validator';
import { DashboardType, DashboardWidget } from '../domain/dashboard.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDashboardDto {
  @ApiProperty({ description: 'User ID' })
  @IsUUID()
  @IsNotEmpty()
  userId!: string;

  @ApiProperty({ description: 'Dashboard name' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ description: 'Dashboard type', enum: DashboardType })
  @IsEnum(DashboardType)
  @IsOptional()
  type?: DashboardType;

  @ApiPropertyOptional({ description: 'Dashboard description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ type: [Object], description: 'Dashboard widgets' })
  @IsArray()
  @IsOptional()
  widgets?: DashboardWidget[];

  @ApiPropertyOptional({ description: 'Is this the default dashboard' })
  @IsOptional()
  isDefault?: boolean;

  @ApiPropertyOptional({ description: 'Refresh interval in minutes' })
  @IsNumber()
  @IsOptional()
  refreshInterval?: number;

  @ApiPropertyOptional({ description: 'Theme (dark, light)' })
  @IsString()
  @IsOptional()
  theme?: string;
}

export class UpdateDashboardDto {
  @ApiPropertyOptional({ description: 'Dashboard name' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'Dashboard description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ type: [Object], description: 'Dashboard widgets' })
  @IsArray()
  @IsOptional()
  widgets?: DashboardWidget[];

  @ApiPropertyOptional({ description: 'Is this the default dashboard' })
  @IsOptional()
  isDefault?: boolean;

  @ApiPropertyOptional({ description: 'Refresh interval in minutes' })
  @IsNumber()
  @IsOptional()
  refreshInterval?: number;

  @ApiPropertyOptional({ description: 'Theme' })
  @IsString()
  @IsOptional()
  theme?: string;

  @ApiPropertyOptional({ description: 'Display settings' })
  @IsObject()
  @IsOptional()
  displaySettings?: Record<string, any>;
}

export class AddWidgetDto {
  @ApiProperty({ description: 'Widget type' })
  @IsString()
  @IsNotEmpty()
  type!: string;

  @ApiProperty({ description: 'Widget title' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiPropertyOptional({ description: 'Metric type' })
  @IsString()
  @IsOptional()
  metricType?: string;

  @ApiPropertyOptional({ description: 'Chart type' })
  @IsString()
  @IsOptional()
  chartType?: string;

  @ApiPropertyOptional({ description: 'Widget size' })
  @IsString()
  @IsOptional()
  size?: string;

  @ApiPropertyOptional({ description: 'Refresh interval' })
  @IsNumber()
  @IsOptional()
  refreshInterval?: number;

  @ApiPropertyOptional({ description: 'Widget filters' })
  @IsObject()
  @IsOptional()
  filters?: Record<string, any>;
}

export class DashboardResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  userId!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ enum: DashboardType })
  type!: DashboardType;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty({ type: [Object] })
  widgets!: DashboardWidget[];

  @ApiProperty()
  isDefault!: boolean;

  @ApiProperty()
  isActive!: boolean;

  @ApiProperty()
  refreshInterval!: number;

  @ApiPropertyOptional()
  theme?: string;

  @ApiPropertyOptional()
  lastViewedAt?: Date;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
