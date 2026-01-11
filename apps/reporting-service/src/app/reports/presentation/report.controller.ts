import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Roles, CurrentUser, CurrentUserData } from '@app/shared';
import { ReportService } from '../application/report.service';
import { CreateReportDto, UpdateReportDto, ReportResponseDto, GenerateReportDto } from '../dto/report.dto';
import { ReportStatus } from '../domain/report.entity';

@ApiTags('Reports')
@ApiBearerAuth()
@Controller('reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new report' })
  @ApiResponse({ status: 201, description: 'Report created', type: ReportResponseDto })
  async createReport(@Body() createReportDto: CreateReportDto, @CurrentUser() user: CurrentUserData) {
    console.log('User creating report:', user);
    return this.reportService.createReport(createReportDto);
  }

  @Post('generate')
  @ApiOperation({ summary: 'Generate a new report (async)' })
  @ApiResponse({ status: 201, description: 'Report generation started' })
  async generateReport(@Body() generateReportDto: GenerateReportDto) {
    const report = await this.reportService.createReport({
      userId: generateReportDto.userId,
      type: generateReportDto.type,
      title: `${generateReportDto.type} Report ${new Date().toLocaleDateString()}`,
      description: `Auto-generated ${generateReportDto.type} report`,
      filters: generateReportDto.filters,
    });

    // Start generating report asynchronously
    await this.reportService.startGeneratingReport(report.id);

    return {
      id: report.id,
      status: 'generating',
      message: 'Report generation started. You can check status with the report ID.',
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get report by ID' })
  @ApiResponse({ status: 200, description: 'Report details', type: ReportResponseDto })
  async getReportById(@Param('id') id: string) {
    return this.reportService.getReportById(id);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get all reports for a user' })
  @ApiResponse({ status: 200, description: 'List of reports', type: [ReportResponseDto] })
  async getReportsByUserId(@Param('userId') userId: string) {
    return this.reportService.getReportsByUserId(userId);
  }

  @Get('user/:userId/active')
  @ApiOperation({ summary: 'Get active reports for a user' })
  @ApiResponse({ status: 200, description: 'List of active reports' })
  async getActiveReports(@Param('userId') userId: string) {
    return this.reportService.getActiveReports(userId);
  }

  @Get('user/:userId/paginated')
  @ApiOperation({ summary: 'Get paginated reports for a user' })
  @ApiResponse({ status: 200, description: 'Paginated list of reports' })
  async getPaginatedReports(
    @Param('userId') userId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.reportService.getPaginatedReports(userId, page, limit);
  }

  @Get('status/:status')
  @ApiOperation({ summary: 'Get reports by status' })
  @ApiResponse({ status: 200, description: 'List of reports with given status' })
  async getReportsByStatus(@Param('status') status: ReportStatus) {
    return this.reportService.getReportsByUserIdAndStatus('', status);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a report' })
  @ApiResponse({ status: 200, description: 'Report updated', type: ReportResponseDto })
  async updateReport(@Param('id') id: string, @Body() updateReportDto: UpdateReportDto) {
    return this.reportService.updateReport(id, updateReportDto);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Mark report as complete with generated data' })
  @ApiResponse({ status: 200, description: 'Report completed' })
  async completeReport(
    @Param('id') id: string,
    @Body() body: { data: Record<string, any>; fileUrl?: string; fileSize?: number },
  ) {
    return this.reportService.completeReport(id, body.data, body.fileUrl, body.fileSize);
  }

  @Post(':id/fail')
  @ApiOperation({ summary: 'Mark report as failed' })
  @ApiResponse({ status: 200, description: 'Report marked as failed' })
  async failReport(@Param('id') id: string, @Body() body: { errorMessage: string }) {
    return this.reportService.failReport(id, body.errorMessage);
  }

  @Get(':id/metadata')
  @ApiOperation({ summary: 'Get report metadata' })
  @ApiResponse({ status: 200, description: 'Report metadata' })
  async getReportMetadata(@Param('id') id: string) {
    return this.reportService.getReportMetadata(id);
  }

  @Delete(':id')
  @Roles('admin', 'supervisor')
  @ApiOperation({ summary: 'Delete a report' })
  @ApiResponse({ status: 204, description: 'Report deleted' })
  async deleteReport(@Param('id') id: string) {
    await this.reportService.deleteReport(id);
    return { statusCode: HttpStatus.NO_CONTENT };
  }

  @Delete('user/:userId')
  @Roles('admin')
  @ApiOperation({ summary: 'Delete all reports for a user (Admin only)' })
  @ApiResponse({ status: 200, description: 'Reports deleted' })
  async deleteReportsByUserId(@Param('userId') userId: string) {
    const count = await this.reportService.deleteReportsByUserId(userId);
    return { deleted: count };
  }
}
