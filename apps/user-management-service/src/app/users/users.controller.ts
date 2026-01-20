import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUsersDto } from './dto/query-users.dto';
import { Roles } from '../decorators/roles.decorator';
import { UserRole } from '@shared/types';
import { Request } from 'express';
import { Req } from '@nestjs/common';
import { Public } from '../decorators/public.decorator';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Crear usuario' })
  @Roles(UserRole.ADMIN)
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get('professors')
  @Public()
  @ApiOperation({ summary: 'Listar profesores (simple, sin filtros)' })
  async getProfessors() {
    return this.usersService.getProfessors();
  }

  @Get('students')
  @Public()
  @ApiOperation({ summary: 'Listar estudiantes (simple, sin filtros)' })
  async getStudents() {
    return this.usersService.getStudents();
  }

  @Get('directory')
  @ApiOperation({ summary: 'Ver directorio de perfiles (solo lectura)' })
  findDirectory(@Query() query: QueryUsersDto) {
    return this.usersService.findDirectory(query);
  }

  @Get('me')
  @ApiOperation({ summary: 'Obtener mi perfil' })
  findMe(@Req() req: Request) {
    const userId = (req as any).user?.sub || (req as any).user?.userId;
    return this.usersService.findOne(userId);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Listar usuarios con filtros' })
  findAll(@Query() query: QueryUsersDto) {
    return this.usersService.findAll(query);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Actualizar mi perfil' })
  updateMe(@Req() req: Request, @Body() updateUserDto: UpdateUserDto) {
    const userId = (req as any).user?.sub || (req as any).user?.userId;
    return this.usersService.update(userId, updateUserDto);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Obtener usuario por ID' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar usuario' })
  @Roles(UserRole.ADMIN)
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar usuario' })
  @Roles(UserRole.ADMIN)
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.usersService.remove(id);
  }
}
