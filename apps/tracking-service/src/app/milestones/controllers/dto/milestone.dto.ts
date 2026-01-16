import { IsUUID, IsString, IsDate, IsNumber, IsEnum, IsOptional, Min, Max } from 'class-validator';
import { MilestoneStatus } from '../../domain/milestone.entity';

export class CreateMilestoneDto {
  @IsUUID()
  placementId!: string;

  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDate()
  dueDate!: Date;

  @IsOptional()
  @IsString()
  deliverable?: string;

  @IsOptional()
  @IsString()
  feedback?: string;
}

export class UpdateMilestoneDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDate()
  dueDate?: Date;

  @IsOptional()
  @IsString()
  deliverable?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  progress?: number;

  @IsOptional()
  @IsString()
  feedback?: string;
}

export class CompleteMilestoneDto {
  @IsOptional()
  @IsString()
  feedback?: string;
}

export class UpdateProgressDto {
  @IsNumber()
  @Min(0)
  @Max(100)
  progress!: number;
}

export class MilestoneResponseDto {
  id!: string;
  assignmentId!: string;
  title!: string;
  description?: string;
  dueDate!: Date;
  status!: MilestoneStatus;
  progress!: number;
  deliverable?: string;
  isCompleted!: boolean;
  completedAt?: Date;
  feedback?: string;
  createdAt!: Date;
  updatedAt!: Date;
}

export class MilestoneStatsDto {
  totalMilestones!: number;
  completedMilestones!: number;
  overdueMilestones!: number;
  averageProgress!: number;
  completionRate!: number;
}
