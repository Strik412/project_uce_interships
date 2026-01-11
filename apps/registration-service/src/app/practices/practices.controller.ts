import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { PracticesService } from './practices.service';
import { CreatePracticeDto, UpdatePracticeDto, QueryPracticesDto } from './dto/practice.dto';
import { Roles } from '../decorators/roles.decorator';
import { Public } from '../decorators/public.decorator';

@ApiTags('practices')
@ApiBearerAuth()
@Controller('practices')
export class PracticesController {
  constructor(private practicesService: PracticesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles('admin', 'student', 'company', 'professor')
  @ApiOperation({ summary: 'Register a new practice' })
  @ApiResponse({ status: 201, description: 'Practice registered successfully' })
  async create(@Body() dto: CreatePracticeDto) {
    return this.practicesService.create(dto);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all practices with pagination' })
  @ApiResponse({ status: 200, description: 'List of practices' })
  async findAll(@Query() query: QueryPracticesDto) {
    return this.practicesService.findAll(query);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get practice by ID' })
  @ApiResponse({ status: 200, description: 'Practice details' })
  async findOne(@Param('id') id: string) {
    return this.practicesService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin', 'supervisor')
  @ApiOperation({ summary: 'Update practice' })
  @ApiResponse({ status: 200, description: 'Practice updated' })
  async update(@Param('id') id: string, @Body() dto: UpdatePracticeDto) {
    return this.practicesService.update(id, dto);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Delete practice' })
  @ApiResponse({ status: 200, description: 'Practice deleted' })
  async remove(@Param('id') id: string) {
    return this.practicesService.remove(id);
  }
}
