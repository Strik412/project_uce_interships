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
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto, UpdateApplicationStatusDto } from './dto/application.dto';
import { Roles } from '../decorators/roles.decorator';
import { Public } from '../decorators/public.decorator';

@ApiTags('applications')
@ApiBearerAuth()
@Controller('applications')
export class ApplicationsController {
  constructor(private applicationsService: ApplicationsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Public()
  @ApiOperation({ summary: 'Create application for practice' })
  async create(@Body() dto: CreateApplicationDto) {
    return this.applicationsService.create(dto);
  }

  @Get()
  @Roles('admin', 'supervisor', 'company', 'student')
  @ApiOperation({ summary: 'Get all applications' })
  async findAll(
    @Query('practiceId') practiceId?: string,
    @Query('userId') userId?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.applicationsService.findAll(practiceId, userId, page, limit);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get application by ID' })
  async findOne(@Param('id') id: string) {
    return this.applicationsService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin', 'supervisor', 'company')
  @ApiOperation({ summary: 'Update application status' })
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateApplicationStatusDto) {
    return this.applicationsService.updateStatus(id, dto);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Delete application' })
  async remove(@Param('id') id: string) {
    return this.applicationsService.remove(id);
  }
}
