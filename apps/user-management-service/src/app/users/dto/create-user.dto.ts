import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsEmail, IsOptional, IsString } from 'class-validator';
import { UserRole } from '@shared/types';

export class CreateUserDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Ada' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Lovelace' })
  @IsString()
  lastName: string;

  @ApiProperty({ isArray: true, enum: UserRole, default: [UserRole.STUDENT] })
  @IsArray()
  roles: UserRole[] = [UserRole.STUDENT];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  altEmail?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  profileImage?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  organization?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  about?: string;

  @ApiProperty({ required: false, description: 'Facultad del estudiante' })
  @IsOptional()
  @IsString()
  faculty?: string;

  @ApiProperty({ required: false, description: 'Carrera del estudiante' })
  @IsOptional()
  @IsString()
  career?: string;

  @ApiProperty({ required: false, description: 'Semestre actual del estudiante' })
  @IsOptional()
  @IsString()
  semester?: string;

  @ApiProperty({ required: false, description: 'Horario de atencion del profesor' })
  @IsOptional()
  @IsString()
  officeHours?: string;

  @ApiProperty({ required: false, description: 'Ubicacion de oficina del profesor' })
  @IsOptional()
  @IsString()
  officeLocation?: string;

  @ApiProperty({ required: false, description: 'Notas adicionales del profesor' })
  @IsOptional()
  @IsString()
  officeNotes?: string;

  @ApiProperty({ required: false, description: 'Descripcion publica de la empresa' })
  @IsOptional()
  @IsString()
  companyDescription?: string;

  @ApiProperty({ required: false, description: 'Sitio web de la empresa' })
  @IsOptional()
  @IsString()
  companyWebsite?: string;

  @ApiProperty({ required: false, description: 'Contacto directo de la empresa' })
  @IsOptional()
  @IsString()
  companyContact?: string;

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;
}
