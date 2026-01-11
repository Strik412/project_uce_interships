import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { HourLogsService } from './hour-logs.service';
import { CreateHourLogDto, ReviewHourLogDto, UpdateHourLogDto } from './dto/hour-log.dto';
import { JwtAuthGuard } from '@app/shared';
import { Roles, RolesGuard } from '@app/shared';

@Controller('hour-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class HourLogsController {
  constructor(private readonly hourLogsService: HourLogsService) {}

  @Post()
  @Roles('student')
  async create(@Body() dto: CreateHourLogDto, @Request() req: any) {
    const studentId = req.user.userId;
    return await this.hourLogsService.create(dto, studentId);
  }

  @Get()
  async findAll(
    @Query('placementId') placementId: string | undefined,
    @Request() req: any,
  ) {
    const userId = req.user.userId;
    const userRole = req.user.roles?.[0];
    return await this.hourLogsService.findAll(userId, userRole, placementId);
  }

  @Get('stats/:placementId')
  async getStats(@Param('placementId') placementId: string, @Request() req: any) {
    const userId = req.user.userId;
    const userRole = req.user.roles?.[0];
    return await this.hourLogsService.getStatsByPlacement(placementId, userId, userRole);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req: any) {
    const userId = req.user.userId;
    const userRole = req.user.roles?.[0];
    return await this.hourLogsService.findOne(id, userId, userRole);
  }

  @Patch(':id')
  @Roles('student')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateHourLogDto,
    @Request() req: any,
  ) {
    const userId = req.user.userId;
    const userRole = req.user.roles?.[0];
    return await this.hourLogsService.update(id, dto, userId, userRole);
  }

  @Patch(':id/review')
  @Roles('professor', 'company', 'coordinator', 'admin')
  async review(
    @Param('id') id: string,
    @Body() dto: ReviewHourLogDto,
    @Request() req: any,
  ) {
    const reviewerId = req.user.userId;
    const userRole = req.user.roles?.[0];
    return await this.hourLogsService.review(id, dto, reviewerId, userRole);
  }

  @Delete(':id')
  @Roles('student')
  async remove(@Param('id') id: string, @Request() req: any) {
    const userId = req.user.userId;
    const userRole = req.user.roles?.[0];
    return await this.hourLogsService.remove(id, userId, userRole);
  }
}
