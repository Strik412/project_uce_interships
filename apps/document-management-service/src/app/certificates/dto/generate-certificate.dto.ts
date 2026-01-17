import { IsUUID, IsString, IsNumber, IsDate, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class GenerateCertificateDto {
  @ApiProperty({ description: 'Placement ID from Registration Service' })
  @IsUUID()
  placementId!: string;

  @ApiProperty({ description: 'Student ID' })
  @IsUUID()
  studentId!: string;

  @ApiProperty({ description: 'Student full name' })
  @IsString()
  studentName!: string;

  @ApiProperty({ description: 'Professor ID' })
  @IsUUID()
  professorId!: string;

  @ApiProperty({ description: 'Professor full name' })
  @IsString()
  professorName!: string;

  @ApiProperty({ description: 'Practice/Internship name' })
  @IsString()
  practiceName!: string;

  @ApiProperty({ description: 'Total completed hours' })
  @IsNumber()
  totalHours!: number;

  @ApiProperty({ description: 'Internship start date' })
  @IsDate()
  @Type(() => Date)
  startDate!: Date;

  @ApiProperty({ description: 'Internship end date' })
  @IsDate()
  @Type(() => Date)
  endDate!: Date;

  @ApiProperty({ description: 'Optional description', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}

export class ApproveCertificateDto {
  @ApiProperty({ description: 'Teacher/Professor ID who is approving' })
  @IsUUID()
  teacherId!: string;

  @ApiProperty({ description: 'Optional approval comments', required: false })
  @IsOptional()
  @IsString()
  comments?: string;
}

export class RejectCertificateDto {
  @ApiProperty({ description: 'Teacher/Professor ID who is rejecting' })
  @IsUUID()
  teacherId!: string;

  @ApiProperty({ description: 'Reason for rejection' })
  @IsString()
  reason!: string;
}
