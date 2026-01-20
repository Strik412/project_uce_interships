import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AnalyticsService } from '../application/analytics.service';
import { CreateAnalyticsDto, AnalyticsResponseDto, AnalyticsQueryDto } from '../dto/analytics.dto';

@ApiTags('Analytics')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post()
  @ApiOperation({ summary: 'Create analytics record' })
  @ApiResponse({ status: 201, description: 'Analytics created', type: AnalyticsResponseDto })
  async createAnalytics(@Body() createAnalyticsDto: CreateAnalyticsDto) {
    return this.analyticsService.createAnalytics(createAnalyticsDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get analytics by ID' })
  @ApiResponse({ status: 200, description: 'Analytics details', type: AnalyticsResponseDto })
  async getAnalyticsById(@Param('id') id: string) {
    return this.analyticsService.getAnalyticsById(id);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get all analytics for a user' })
  @ApiResponse({ status: 200, description: 'List of analytics', type: [AnalyticsResponseDto] })
  async getAnalyticsByUserId(@Param('userId') userId: string) {
    return this.analyticsService.getAnalyticsByUserId(userId);
  }

  @Get('user/:userId/latest')
  @ApiOperation({ summary: 'Get latest analytics for a user' })
  @ApiResponse({ status: 200, description: 'Latest analytics', type: AnalyticsResponseDto })
  async getLatestAnalyticsByUser(@Param('userId') userId: string) {
    const analytics = await this.analyticsService.getLatestAnalyticsByUser(userId);
    if (!analytics) {
      return { message: 'No analytics found' };
    }
    return analytics;
  }

  @Post('user/:userId/recommendations')
  @ApiOperation({ summary: 'Generate recommendations for a user' })
  @ApiResponse({ status: 200, description: 'Recommendations generated' })
  async generateRecommendations(@Param('userId') userId: string) {
    const recommendations = await this.analyticsService.generateRecommendations(userId);
    return { userId, recommendations };
  }

  @Post('user/:userId/detect-anomalies')
  @ApiOperation({ summary: 'Detect anomalies for a user' })
  @ApiResponse({ status: 200, description: 'Anomalies detected' })
  async detectAnomalies(@Param('userId') userId: string) {
    const anomalies = await this.analyticsService.detectAnomalies(userId);
    return { userId, anomalyCount: anomalies.length, anomalies };
  }

  @Get('practice/:practiceId')
  @ApiOperation({ summary: 'Get analytics for a practice' })
  @ApiResponse({ status: 200, description: 'Practice analytics', type: [AnalyticsResponseDto] })
  async getAnalyticsByPracticeId(@Param('practiceId') practiceId: string) {
    return this.analyticsService.getAnalyticsByPracticeId(practiceId);
  }

  @Get('company/:companyId')
  @ApiOperation({ summary: 'Get analytics for a company' })
  @ApiResponse({ status: 200, description: 'Company analytics', type: [AnalyticsResponseDto] })
  async getAnalyticsByCompanyId(@Param('companyId') companyId: string) {
    return this.analyticsService.getAnalyticsByCompanyId(companyId);
  }

  @Get('period/:period')
  @ApiOperation({ summary: 'Get analytics by period' })
  @ApiResponse({ status: 200, description: 'Period analytics', type: [AnalyticsResponseDto] })
  async getAnalyticsByPeriod(@Param('period') period: string) {
    return this.analyticsService.getAnalyticsByPeriod(period);
  }

  @Get('anomalies')
  @ApiOperation({ summary: 'Get all analytics with anomalies' })
  @ApiResponse({ status: 200, description: 'Analytics with anomalies', type: [AnalyticsResponseDto] })
  async getAnalyticsWithAnomalies() {
    return this.analyticsService.getAnalyticsWithAnomalies();
  }

  @Get('warnings')
  @ApiOperation({ summary: 'Get all analytics with warnings' })
  @ApiResponse({ status: 200, description: 'Analytics with warnings', type: [AnalyticsResponseDto] })
  async getAnalyticsWithWarnings() {
    return this.analyticsService.getAnalyticsWithWarnings();
  }

  @Post(':id/warning')
  @ApiOperation({ summary: 'Add warning to analytics' })
  @ApiResponse({ status: 200, description: 'Warning added' })
  async addWarning(@Param('id') id: string, @Body() body: { warning: string }) {
    return this.analyticsService.addWarning(id, body.warning);
  }

  @Post(':id/recommendation')
  @ApiOperation({ summary: 'Add recommendation to analytics' })
  @ApiResponse({ status: 200, description: 'Recommendation added' })
  async addRecommendation(@Param('id') id: string, @Body() body: { recommendation: string }) {
    return this.analyticsService.addRecommendation(id, body.recommendation);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete analytics' })
  @ApiResponse({ status: 204, description: 'Analytics deleted' })
  async deleteAnalytics(@Param('id') id: string) {
    await this.analyticsService.deleteAnalytics(id);
    return { statusCode: HttpStatus.NO_CONTENT };
  }

  @Delete('user/:userId')
  @ApiOperation({ summary: 'Delete all analytics for a user' })
  @ApiResponse({ status: 200, description: 'Analytics deleted' })
  async deleteAnalyticsByUserId(@Param('userId') userId: string) {
    const count = await this.analyticsService.deleteAnalyticsByUserId(userId);
    return { deleted: count };
  }
}
