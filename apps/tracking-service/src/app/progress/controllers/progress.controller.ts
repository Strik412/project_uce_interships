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

  @Get('assignment/:assignmentId')
  async getAssignmentProgress(@Param('assignmentId') assignmentId: string): Promise<ProgressReport[]> {
    return this.progressService.getAssignmentProgress(assignmentId);
  }

  @Get('assignment/:assignmentId/stats')
  async getProgressStats(@Param('assignmentId') assignmentId: string): Promise<ProgressStatsDto> {
    return this.progressService.getProgressStats(assignmentId);
  }

  @Get()
  async getPendingReviews(): Promise<ProgressReport[]> {
    return this.progressService.getPendingReviews();
  }

  @Get('assignment/:assignmentId/recent')
  async getRecentProgress(@Param('assignmentId') assignmentId: string): Promise<ProgressReport[]> {
    return this.progressService.getRecentProgress(assignmentId, 5);
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
