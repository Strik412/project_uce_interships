import { IsUUID, IsString, IsDate, IsNumber, IsEnum, IsOptional, Min, Max } from 'class-validator';
import { ProgressStatus } from '../../domain/progress.entity';

export class CreateProgressDto {
  @IsUUID()
  placementId!: string;

  @IsNumber()
  @Min(1)
  weekNumber!: number;

  @IsNumber()
  @Min(0)
  hoursWorked!: number;

  @IsString()
  activitiesDescription!: string;

  @IsOptional()
  @IsString()
  accomplishments?: string;

  @IsOptional()
  @IsString()
  challenges?: string;

  @IsOptional()
  @IsString()
  learnings?: string;

  @IsOptional()
  @IsString()
  feedback?: string;
}

export class UpdateProgressDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  hoursWorked?: number;

  @IsOptional()
  @IsString()
  activitiesDescription?: string;

  @IsOptional()
  @IsString()
  accomplishments?: string;

  @IsOptional()
  @IsString()
  challenges?: string;

  @IsOptional()
  @IsString()
  learnings?: string;
}

export class ApproveProgressDto {
  @IsUUID()
  reviewedBy!: string;

  @IsOptional()
  @IsString()
  comments?: string;
}

export class ProgressResponseDto {
  id!: string;
  assignmentId!: string;
  weekNumber!: number;
  reportDate!: Date;
  hoursWorked!: number;
  activitiesDescription!: string;
  status!: ProgressStatus;
  reviewedBy?: string;
  reviewComments?: string;
  reviewedAt?: Date;
  createdAt!: Date;
  updatedAt!: Date;
}

export class ProgressStatsDto {
  totalReports!: number;
  approvedReports!: number;
  totalHours!: number;
  averageHoursPerWeek!: number;
  approvalRate!: number;
}
