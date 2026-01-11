import { ApiPropertyOptional } from '@nestjs/swagger';
import { PartialType } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsEmail, IsOptional, IsString } from 'class-validator';
import { CreateUserDto } from './create-user.dto';
import { UserRole } from '@shared/types';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiPropertyOptional({ example: 'user@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ isArray: true, enum: UserRole })
  @IsOptional()
  @IsArray()
  roles?: UserRole[];

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  altEmail?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  profileImage?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  organization?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  about?: string;

  @ApiPropertyOptional({ description: 'Facultad del estudiante' })
  @IsOptional()
  @IsString()
  faculty?: string;

  @ApiPropertyOptional({ description: 'Carrera del estudiante' })
  @IsOptional()
  @IsString()
  career?: string;

  @ApiPropertyOptional({ description: 'Semestre actual del estudiante' })
  @IsOptional()
  @IsString()
  semester?: string;

  @ApiPropertyOptional({ description: 'Horario de atencion del profesor' })
  @IsOptional()
  @IsString()
  officeHours?: string;

  @ApiPropertyOptional({ description: 'Ubicacion de oficina del profesor' })
  @IsOptional()
  @IsString()
  officeLocation?: string;

  @ApiPropertyOptional({ description: 'Notas adicionales del profesor' })
  @IsOptional()
  @IsString()
  officeNotes?: string;

  @ApiPropertyOptional({ description: 'Descripcion publica de la empresa' })
  @IsOptional()
  @IsString()
  companyDescription?: string;

  @ApiPropertyOptional({ description: 'Sitio web de la empresa' })
  @IsOptional()
  @IsString()
  companyWebsite?: string;

  @ApiPropertyOptional({ description: 'Contacto directo de la empresa' })
  @IsOptional()
  @IsString()
  companyContact?: string;
}
