import { Controller, Get, Post, Put, Delete, Param, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ProgressService } from '../services/progress.service';
import { CreateProgressDto, UpdateProgressDto, ApproveProgressDto, ProgressResponseDto, ProgressStatsDto } from './dto/progress.dto';
import { ProgressReport } from '../domain/progress.entity';

@Controller('progress')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async submitProgress(@Body() createDto: CreateProgressDto): Promise<ProgressReport> {
    return this.progressService.submitProgress(createDto);
  }

  @Get(':id')
  async getProgressById(@Param('id') id: string): Promise<ProgressReport> {
    return this.progressService.getProgressById(id);
  }

  @Get('placement/:placementId')
  async getPlacementProgress(@Param('placementId') placementId: string): Promise<ProgressReport[]> {
    return this.progressService.getPlacementProgress(placementId);
  }

  @Get('placement/:placementId/stats')
  async getProgressStats(@Param('placementId') placementId: string): Promise<ProgressStatsDto> {
    return this.progressService.getProgressStats(placementId);
  }

  @Get()
  async getPendingReviews(): Promise<ProgressReport[]> {
    return this.progressService.getPendingReviews();
  }

  @Get('placement/:placementId/recent')
  async getRecentProgress(@Param('placementId') placementId: string): Promise<ProgressReport[]> {
    return this.progressService.getRecentProgress(placementId, 5);
  }

  @Put(':id')
  async updateProgress(@Param('id') id: string, @Body() updateDto: UpdateProgressDto): Promise<ProgressReport> {
    return this.progressService.updateProgress(id, updateDto);
  }

  @Post(':id/approve')
  @HttpCode(HttpStatus.OK)
  async approveProgress(@Param('id') id: string, @Body() approveDto: ApproveProgressDto): Promise<ProgressReport> {
    return this.progressService.approveProgress(id, approveDto);
  }

  @Post(':id/reject')
  @HttpCode(HttpStatus.OK)
  async rejectProgress(@Param('id') id: string, @Body() approveDto: ApproveProgressDto): Promise<ProgressReport> {
    return this.progressService.rejectProgress(id, approveDto);
  }

  @Post(':id/request-revision')
  @HttpCode(HttpStatus.OK)
  async requestRevision(@Param('id') id: string, @Body() approveDto: ApproveProgressDto): Promise<ProgressReport> {
    return this.progressService.requestRevision(id, approveDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteProgress(@Param('id') id: string): Promise<void> {
    await this.progressService.deleteProgress(id);
  }
}
