import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { MetricService } from '../application/metric.service';
import { CreateMetricDto, MetricResponseDto, CreateMetricsDto, MetricsTrendDto } from '../dto/metric.dto';

@ApiTags('Metrics')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('metrics')
export class MetricController {
  constructor(private readonly metricService: MetricService) {}

  @Post()
  @ApiOperation({ summary: 'Create a single metric' })
  @ApiResponse({ status: 201, description: 'Metric created', type: MetricResponseDto })
  async createMetric(@Body() createMetricDto: CreateMetricDto) {
    return this.metricService.createMetric(createMetricDto);
  }

  @Post('batch')
  @ApiOperation({ summary: 'Create multiple metrics at once' })
  @ApiResponse({ status: 201, description: 'Metrics created', type: [MetricResponseDto] })
  async createMetrics(@Body() createMetricsDto: CreateMetricsDto) {
    const results = [];
    for (const metric of createMetricsDto.metrics) {
      const created = await this.metricService.createMetric(metric);
      results.push(created);
    }
    return results;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get metric by ID' })
  @ApiResponse({ status: 200, description: 'Metric details', type: MetricResponseDto })
  async getMetricById(@Param('id') id: string) {
    return this.metricService.getMetricById(id);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get all metrics for a user' })
  @ApiResponse({ status: 200, description: 'List of metrics', type: [MetricResponseDto] })
  async getMetricsByUserId(@Param('userId') userId: string) {
    return this.metricService.getMetricsByUserId(userId);
  }

  @Get('user/:userId/latest')
  @ApiOperation({ summary: 'Get latest metrics for a user' })
  @ApiResponse({ status: 200, description: 'Latest metrics', type: [MetricResponseDto] })
  async getLatestMetricsByUser(
    @Param('userId') userId: string,
    @Query('limit') limit: number = 10,
  ) {
    return this.metricService.getLatestMetricsByUser(userId, limit);
  }

  @Get('user/:userId/anomalies')
  @ApiOperation({ summary: 'Get anomalous metrics for a user' })
  @ApiResponse({ status: 200, description: 'Anomalous metrics' })
  async getAnomalousMetricsByUser(@Param('userId') userId: string) {
    return this.metricService.getAnomalousMetricsByUser(userId);
  }

  @Get('user/:userId/trend')
  @ApiOperation({ summary: 'Get trend data for a metric' })
  @ApiResponse({ status: 200, description: 'Trend data', type: [MetricResponseDto] })
  async getTrendData(
    @Param('userId') userId: string,
    @Query('type') type: string,
    @Query('days') days: number = 30,
  ) {
    return this.metricService.getTrendData(userId, type as any, days);
  }

  @Get('user/:userId/average')
  @ApiOperation({ summary: 'Calculate average metric value for a user' })
  @ApiResponse({ status: 200, description: 'Average value' })
  async calculateUserAverageMetric(
    @Param('userId') userId: string,
    @Query('type') type: string,
    @Query('days') days: number = 7,
  ) {
    const average = await this.metricService.calculateUserAverageMetric(userId, type as any, days);
    return { average, type, days };
  }

  @Get('practice/:practiceId')
  @ApiOperation({ summary: 'Get all metrics for a practice' })
  @ApiResponse({ status: 200, description: 'List of metrics', type: [MetricResponseDto] })
  async getMetricsByPracticeId(@Param('practiceId') practiceId: string) {
    return this.metricService.getMetricsByPracticeId(practiceId);
  }

  @Post(':id/mark-anomalous')
  @ApiOperation({ summary: 'Mark a metric as anomalous' })
  @ApiResponse({ status: 200, description: 'Metric marked as anomalous' })
  async markAsAnomalous(@Param('id') id: string) {
    return this.metricService.markAsAnomalous(id);
  }

  @Post(':id/update-value')
  @ApiOperation({ summary: 'Update metric value' })
  @ApiResponse({ status: 200, description: 'Metric value updated' })
  async updateMetricValue(@Param('id') id: string, @Body() body: { value: number }) {
    return this.metricService.updateMetricValue(id, body.value);
  }

  @Post('user/:userId/detect-anomalies')
  @ApiOperation({ summary: 'Detect anomalies in user metrics' })
  @ApiResponse({ status: 200, description: 'Anomalies detected' })
  async detectAnomalies(
    @Param('userId') userId: string,
    @Query('type') type: string,
  ) {
    return this.metricService.detectAnomalies(userId, type as any);
  }

  @Get('all/anomalous')
  @ApiOperation({ summary: 'Get all anomalous metrics' })
  @ApiResponse({ status: 200, description: 'List of anomalous metrics' })
  async getAnomalousMetrics() {
    return this.metricService.getAnomalousMetrics();
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a metric' })
  @ApiResponse({ status: 204, description: 'Metric deleted' })
  async deleteMetric(@Param('id') id: string) {
    await this.metricService.deleteMetric(id);
    return { statusCode: HttpStatus.NO_CONTENT };
  }

  @Delete('user/:userId')
  @ApiOperation({ summary: 'Delete all metrics for a user' })
  @ApiResponse({ status: 200, description: 'Metrics deleted' })
  async deleteMetricsByUserId(@Param('userId') userId: string) {
    const count = await this.metricService.deleteMetricsByUserId(userId);
    return { deleted: count };
  }
}
