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
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { HourLogsService } from './hour-logs.service';
import { CreateHourLogDto, ReviewHourLogDto, UpdateHourLogDto } from './dto/hour-log.dto';
import { JwtAuthGuard } from '@app/shared';
import { Roles, RolesGuard } from '@app/shared';

@Controller('hour-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class HourLogsController {
  constructor(private readonly hourLogsService: HourLogsService) {}

  // Normalize values that sometimes arrive as single-element arrays
  private normalizeValue(value: any): string | undefined {
    if (Array.isArray(value)) {
      return value[0];
    }
    if (typeof value === 'string') {
      return value;
    }
    return undefined;
  }

  // Ensure value is a string or fail fast
  private requireString(value: string | undefined, message: string): string {
    if (!value) {
      throw new UnauthorizedException(message);
    }
    return value;
  }

  @Post()
  @Roles('student')
  async create(@Body() dto: CreateHourLogDto, @Request() req: any) {
    const studentId = this.requireString(
      this.normalizeValue(req.user?.userId),
      'User ID is required',
    );

    return this.hourLogsService.create(dto, studentId);
  }

  @Get()
  async findAll(
    @Query('placementId') placementId: string | string[] | undefined,
    @Request() req: any,
  ) {
    const userId = this.requireString(
      this.normalizeValue(req.user?.userId),
      'User ID is required',
    );

    const userRole = this.requireString(
      this.normalizeValue(req.user?.roles),
      'User role is required',
    );

    const normalizedPlacementId = this.normalizeValue(placementId);

    return this.hourLogsService.findAll(userId, userRole, normalizedPlacementId);
  }

  @Get('stats/:placementId')
  async getStats(@Param('placementId') placementId: string, @Request() req: any) {
    const userId = this.requireString(
      this.normalizeValue(req.user?.userId),
      'User ID is required',
    );

    const userRole = this.requireString(
      this.normalizeValue(req.user?.roles),
      'User role is required',
    );

    return this.hourLogsService.getStatsByPlacement(
      placementId,
      userId,
      userRole,
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req: any) {
    const userId = this.requireString(
      this.normalizeValue(req.user?.userId),
      'User ID is required',
    );

    const userRole = this.requireString(
      this.normalizeValue(req.user?.roles),
      'User role is required',
    );

    return this.hourLogsService.findOne(id, userId, userRole);
  }

  @Patch(':id')
  @Roles('student')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateHourLogDto,
    @Request() req: any,
  ) {
    const userId = this.requireString(
      this.normalizeValue(req.user?.userId),
      'User ID is required',
    );

    const userRole = this.requireString(
      this.normalizeValue(req.user?.roles),
      'User role is required',
    );

    return this.hourLogsService.update(id, dto, userId, userRole);
  }

  @Patch(':id/review')
  @Roles('professor', 'company', 'coordinator', 'admin')
  async review(
    @Param('id') id: string,
    @Body() dto: ReviewHourLogDto,
    @Request() req: any,
  ) {
    const reviewerId = this.requireString(
      this.normalizeValue(req.user?.userId),
      'Reviewer ID is required',
    );

    const userRole = this.requireString(
      this.normalizeValue(req.user?.roles),
      'User role is required',
    );

    return this.hourLogsService.review(id, dto, reviewerId, userRole);
  }

  @Delete(':id')
  @Roles('student')
  async remove(@Param('id') id: string, @Request() req: any) {
    const userId = this.requireString(
      this.normalizeValue(req.user?.userId),
      'User ID is required',
    );

    const userRole = this.requireString(
      this.normalizeValue(req.user?.roles),
      'User role is required',
    );

    return this.hourLogsService.remove(id, userId, userRole);
  }
}
