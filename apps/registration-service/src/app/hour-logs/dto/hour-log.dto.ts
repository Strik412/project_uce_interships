import { IsUUID, IsDateString, IsNumber, IsString, IsOptional, IsEnum, Min, Max } from 'class-validator';
import { HourLogStatus } from '../../database/entities/hour-log.entity';

export class CreateHourLogDto {
  @IsUUID()
  placementId!: string;

  @IsDateString()
  date!: string;

  @IsNumber()
  @Min(0.5)
  @Max(24)
  hours!: number;

  @IsString()
  description!: string;

  @IsString()
  @IsOptional()
  activities?: string;

  @IsString()
  @IsOptional()
  evidenceUrl?: string;
}

export class ReviewHourLogDto {
  @IsEnum(HourLogStatus)
  status!: HourLogStatus;

  @IsString()
  @IsOptional()
  reviewerComments?: string;
}

export class UpdateHourLogDto {
  @IsDateString()
  @IsOptional()
  date?: string;

  @IsNumber()
  @Min(0.5)
  @Max(24)
  @IsOptional()
  hours?: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  activities?: string;

  @IsString()
  @IsOptional()
  evidenceUrl?: string;
}
