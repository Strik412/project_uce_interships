import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateApplicationDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  practiceId!: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440001' })
  @IsUUID()
  userId!: string;

  @ApiProperty({ example: 'Me interesa esta práctica porque...', required: false })
  @IsOptional()
  @IsString()
  motivation?: string;

  @ApiProperty({ example: 'https://example.com/resume.pdf', required: false })
  @IsOptional()
  @IsString()
  resume?: string;
}

export class UpdateApplicationStatusDto {
  @ApiProperty({ example: 'accepted' })
  @IsString()
  status!: string;

  @ApiProperty({ example: 'No cumple los requisitos', required: false })
  @IsOptional()
  @IsString()
  rejectionReason?: string;
}
