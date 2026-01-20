import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsOptional, IsString, IsUUID, IsBoolean } from 'class-validator';

export class CreateAssignmentDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  practiceId!: string;

  @ApiProperty({ example: 'Entregar reporte de avance' })
  @IsString()
  title!: string;

  @ApiProperty({ example: 'Describir actividades realizadas', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ type: Date, example: '2025-03-15', required: false })
  @IsOptional()
  @IsDate()
  dueDate?: Date;

  @ApiProperty({ example: 'https://example.com/archivo.pdf', required: false })
  @IsOptional()
  @IsString()
  fileUrl?: string;
}

export class UpdateAssignmentDto {
  @ApiProperty({ example: 'Entregar reporte mensual', required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ example: 'Describir todas las actividades', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isCompleted?: boolean;

  @ApiProperty({ example: 'https://example.com/entrega.pdf', required: false })
  @IsOptional()
  @IsString()
  submissionUrl?: string;

  @ApiProperty({ example: 'Muy buen trabajo', required: false })
  @IsOptional()
  @IsString()
  feedback?: string;
}
