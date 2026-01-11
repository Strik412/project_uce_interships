import { IsUUID, IsString, IsDate, IsNumber, IsEnum, IsOptional, IsArray, Min, Max } from 'class-validator';
import { AssignmentStatus } from '../../domain/assignment.entity';

export class CreateAssignmentDto {
  @IsUUID()
  practiceId!: string;

  @IsUUID()
  studentId!: string;

  @IsUUID()
  companyId!: string;

  @IsUUID()
  supervisorId!: string;

  @IsDate()
  startDate!: Date;

  @IsDate()
  endDate!: Date;

  @IsNumber()
  @Min(30)
  totalHours!: number;

  @IsString()
  description!: string;

  @IsOptional()
  @IsArray()
  requirements?: string[];

  @IsOptional()
  @IsArray()
  schedule?: any[];
}

export class UpdateAssignmentDto {
  @IsOptional()
  @IsDate()
  startDate?: Date;

  @IsOptional()
  @IsDate()
  endDate?: Date;

  @IsOptional()
  @IsNumber()
  @Min(30)
  totalHours?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(AssignmentStatus)
  status?: AssignmentStatus;

  @IsOptional()
  @IsArray()
  requirements?: string[];

  @IsOptional()
  @IsArray()
  schedule?: any[];
}

export class UpdateProgressDto {
  @IsNumber()
  @Min(0)
  @Max(100)
  completedHours!: number;
}

export class AssignmentResponseDto {
  id!: string;
  practiceId!: string;
  studentId!: string;
  companyId!: string;
  supervisorId!: string;
  status!: AssignmentStatus;
  startDate!: Date;
  endDate!: Date;
  totalHours!: number;
  completedHours!: number;
  completionPercentage!: number;
  description!: string;
  lastActivityAt?: Date;
  createdAt!: Date;
  updatedAt!: Date;
}
