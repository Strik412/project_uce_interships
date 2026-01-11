import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PlacementsService } from './placements.service';
import { CreatePlacementDto, UpdatePlacementDto } from './dto/placement.dto';
import { JwtAuthGuard } from '@app/shared';
import { Roles, RolesGuard } from '@app/shared';

@Controller('placements')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PlacementsController {
  constructor(private readonly placementsService: PlacementsService) {}

  @Post()
  @Roles('coordinator', 'admin')
  async create(@Body() dto: CreatePlacementDto) {
    return await this.placementsService.create(dto);
  }

  @Get()
  async findAll(@Request() req: any) {
    const userId = req.user.userId;
    const userRole = req.user.roles?.[0];
    return await this.placementsService.findAll(userId, userRole);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req: any) {
    const userId = req.user.userId;
    const userRole = req.user.roles?.[0];
    return await this.placementsService.findOne(id, userId, userRole);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePlacementDto,
    @Request() req: any,
  ) {
    const userId = req.user.userId;
    const userRole = req.user.roles?.[0];
    return await this.placementsService.update(id, dto, userId, userRole);
  }

  @Patch(':id/hours')
  @Roles('professor', 'coordinator', 'admin')
  async updateHours(
    @Param('id') id: string,
    @Body('completedHours') completedHours: number,
    @Request() req: any,
  ) {
    const userId = req.user.userId;
    const userRole = req.user.roles?.[0];
    return await this.placementsService.updateHours(id, completedHours, userId, userRole);
  }

  @Patch(':id/status')
  @Roles('coordinator', 'admin')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @Request() req: any,
  ) {
    const userId = req.user.userId;
    const userRole = req.user.roles?.[0];
    return await this.placementsService.updateStatus(id, status as any, userId, userRole);
  }

  @Patch(':id/assign-professor')
  @Roles('company', 'coordinator', 'admin')
  async assignProfessor(
    @Param('id') id: string,
    @Body('professorId') professorId: string,
    @Request() req: any,
  ) {
    const userId = req.user.userId;
    const userRole = req.user.roles?.[0];
    return await this.placementsService.assignProfessor(id, professorId, userId, userRole);
  }

  @Patch(':id/assignment')
  @Roles('professor')
  async respondAssignment(
    @Param('id') id: string,
    @Body('action') action: 'accept' | 'decline',
    @Request() req: any,
  ) {
    const professorId = req.user.userId;
    return await this.placementsService.respondAssignment(id, action, professorId);
  }
}
