import { Controller, Get, Post, Put, Delete, Param, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { MilestoneService } from '../services/milestone.service';
import { CreateMilestoneDto, UpdateMilestoneDto, CompleteMilestoneDto, UpdateProgressDto, MilestoneResponseDto, MilestoneStatsDto } from './dto/milestone.dto';
import { Milestone } from '../domain/milestone.entity';

@Controller('milestones')
export class MilestoneController {
  constructor(private readonly milestoneService: MilestoneService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createMilestone(@Body() createDto: CreateMilestoneDto): Promise<Milestone> {
    return this.milestoneService.createMilestone(createDto);
  }

  @Get(':id')
  async getMilestoneById(@Param('id') id: string): Promise<Milestone> {
    return this.milestoneService.getMilestoneById(id);
  }

  @Get('assignment/:assignmentId')
  async getAssignmentMilestones(@Param('assignmentId') assignmentId: string): Promise<Milestone[]> {
    return this.milestoneService.getAssignmentMilestones(assignmentId);
  }

  @Get('assignment/:assignmentId/stats')
  async getMilestoneStats(@Param('assignmentId') assignmentId: string): Promise<MilestoneStatsDto> {
    return this.milestoneService.getMilestoneStats(assignmentId);
  }

  @Get('assignment/:assignmentId/summary')
  async getMilestoneSummary(@Param('assignmentId') assignmentId: string): Promise<{
    milestones: Milestone[];
    stats: MilestoneStatsDto;
  }> {
    return this.milestoneService.getMilestoneSummary(assignmentId);
  }

  @Get('status/overdue')
  async getOverdueMilestones(): Promise<Milestone[]> {
    return this.milestoneService.getOverdueMilestones();
  }

  @Get('status/upcoming')
  async getUpcomingMilestones(): Promise<Milestone[]> {
    return this.milestoneService.getUpcomingMilestones();
  }

  @Put(':id')
  async updateMilestone(@Param('id') id: string, @Body() updateDto: UpdateMilestoneDto): Promise<Milestone> {
    return this.milestoneService.updateMilestone(id, updateDto);
  }

  @Put(':id/progress')
  async updateProgress(@Param('id') id: string, @Body() updateDto: UpdateProgressDto): Promise<Milestone> {
    return this.milestoneService.updateMilestoneProgress(id, updateDto.progress);
  }

  @Post(':id/complete')
  @HttpCode(HttpStatus.OK)
  async completeMilestone(@Param('id') id: string, @Body() completeDto: CompleteMilestoneDto): Promise<Milestone> {
    return this.milestoneService.completeMilestone(id, completeDto);
  }

  @Post(':id/check-overdue')
  @HttpCode(HttpStatus.OK)
  async checkOverdue(@Param('id') id: string): Promise<{ isOverdue: boolean }> {
    const isOverdue = await this.milestoneService.checkMilestoneOverdue(id);
    return { isOverdue };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteMilestone(@Param('id') id: string): Promise<void> {
    await this.milestoneService.deleteMilestone(id);
  }
}
