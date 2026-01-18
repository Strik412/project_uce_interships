import { IsUUID, IsOptional, IsDateString, IsInt, IsEnum, IsString, Min } from 'class-validator';
import { PlacementStatus } from '../../database/entities/placement.entity';

export class CreatePlacementDto {
  @IsUUID()
  studentId!: string;

  @IsUUID()
  practiceId!: string;

  @IsUUID()
  @IsOptional()
  applicationId?: string;

  @IsUUID()
  @IsOptional()
  companySupervisorId?: string;

  @IsUUID()
  @IsOptional()
  professorId?: string;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsInt()
  @Min(0)
  expectedHours!: number;

  @IsString()
  @IsOptional()
  coordinatorNotes?: string;
}

export class UpdatePlacementDto {
  @IsUUID()
  @IsOptional()
  companySupervisorId?: string;

  @IsUUID()
  @IsOptional()
  professorId?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  expectedHours?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  completedHours?: number;

  @IsEnum(PlacementStatus)
  @IsOptional()
  status?: typeof PlacementStatus[keyof typeof PlacementStatus];

  @IsString()
  @IsOptional()
  coordinatorNotes?: string;
}
