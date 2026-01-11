import { Injectable, NotFoundException } from '@nestjs/common';
import { Analytics } from '../domain/analytics.entity';
import { AnalyticsRepository } from '../infrastructure/analytics.repository';
import { CreateAnalyticsDto } from '../dto/analytics.dto';
import { MetricService } from '../../metrics/application/metric.service';
import { Metric } from '../../metrics/domain/metric.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly analyticsRepository: AnalyticsRepository,
    private readonly metricService: MetricService,
  ) {}

  async createAnalytics(createAnalyticsDto: CreateAnalyticsDto): Promise<Analytics> {
    const analytics = this.analyticsRepository.create({
      userId: createAnalyticsDto.userId,
      practiceId: createAnalyticsDto.practiceId,
      companyId: createAnalyticsDto.companyId,
      period: createAnalyticsDto.period,
      startDate: createAnalyticsDto.startDate,
      endDate: createAnalyticsDto.endDate,
      summary: createAnalyticsDto.summary,
      trends: createAnalyticsDto.trends,
      comparisons: createAnalyticsDto.comparisons,
      recommendations: createAnalyticsDto.recommendations,
      warnings: createAnalyticsDto.warnings,
      hasAnomalies: false,
      anomalyCount: 0,
    });
    return this.analyticsRepository.save(analytics);
  }

  async getAnalyticsById(id: string): Promise<Analytics> {
    const analytics = await this.analyticsRepository.findOne({ where: { id } });
    if (!analytics) {
      throw new NotFoundException(`Analytics with ID ${id} not found`);
    }
    return analytics;
  }

  async getAnalyticsByUserId(userId: string): Promise<Analytics[]> {
    return this.analyticsRepository.findByUserId(userId);
  }

  async getAnalyticsByPracticeId(practiceId: string): Promise<Analytics[]> {
    return this.analyticsRepository.findByPracticeId(practiceId);
  }

  async getAnalyticsByCompanyId(companyId: string): Promise<Analytics[]> {
    return this.analyticsRepository.findByCompanyId(companyId);
  }

  async getLatestAnalyticsByUser(userId: string): Promise<Analytics | null> {
    return this.analyticsRepository.findLatestByUser(userId);
  }

  async getAnalyticsByPeriod(period: string): Promise<Analytics[]> {
    return this.analyticsRepository.findByPeriod(period);
  }

  async getAnalyticsWithAnomalies(): Promise<Analytics[]> {
    return this.analyticsRepository.findWithAnomalies();
  }

  async getAnalyticsWithWarnings(): Promise<Analytics[]> {
    return this.analyticsRepository.findWithWarnings();
  }

  async updateAnalytics(id: string, updates: Partial<Analytics>): Promise<Analytics> {
    const analytics = await this.analyticsRepository.updateAnalytics(id, updates);
    if (!analytics) {
      throw new NotFoundException(`Analytics with ID ${id} not found`);
    }
    return analytics;
  }

  async addWarning(id: string, warning: string): Promise<Analytics> {
    const analytics = await this.analyticsRepository.addWarning(id, warning);
    if (!analytics) {
      throw new NotFoundException(`Analytics with ID ${id} not found`);
    }
    return analytics;
  }

  async addRecommendation(id: string, recommendation: string): Promise<Analytics> {
    const analytics = await this.analyticsRepository.addRecommendation(id, recommendation);
    if (!analytics) {
      throw new NotFoundException(`Analytics with ID ${id} not found`);
    }
    return analytics;
  }

  async markHasAnomalies(id: string, anomalyCount: number): Promise<Analytics> {
    const analytics = await this.analyticsRepository.markHasAnomalies(id, anomalyCount);
    if (!analytics) {
      throw new NotFoundException(`Analytics with ID ${id} not found`);
    }
    return analytics;
  }

  async deleteAnalytics(id: string): Promise<void> {
    const analytics = await this.getAnalyticsById(id);
    await this.analyticsRepository.delete(id);
  }

  async deleteAnalyticsByUserId(userId: string): Promise<number> {
    const result = await this.analyticsRepository.delete({ userId });
    return result.affected || 0;
  }

  // Advanced analytics methods
  async calculateTrendForMetric(
    userId: string,
    metricType: string,
    days: number = 30,
  ): Promise<{ direction: string; percentage: number }> {
    const metrics = await this.metricService.getTrendData(userId, metricType as any, days);
    if (metrics.length < 2) {
      return { direction: 'stable', percentage: 0 };
    }

    const firstValue = parseFloat(metrics[0].value.toString());
    const lastValue = parseFloat(metrics[metrics.length - 1].value.toString());
    const percentage = ((lastValue - firstValue) / firstValue) * 100;

    let direction = 'stable';
    if (percentage > 5) direction = 'up';
    else if (percentage < -5) direction = 'down';

    return { direction, percentage: Math.round(percentage * 100) / 100 };
  }

  async generateSummary(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Record<string, any>> {
    // This would aggregate data from other services
    // For now, returning a template
    return {
      totalTasks: 0,
      completedTasks: 0,
      avgCompletionTime: 0,
      documentCount: 0,
      messageCount: 0,
      engagementScore: 0,
    };
  }

  async detectAnomalies(userId: string): Promise<Metric[]> {
    // Detect anomalies across all metric types
    const anomalies: any[] = [];
    const metricTypes = Object.values({
      COMPLETION_RATE: 'completion_rate',
      ENGAGEMENT_LEVEL: 'engagement_level',
      PROGRESS_PERCENTAGE: 'progress_percentage',
    });

    for (const type of metricTypes) {
      const anomaly = await this.metricService.detectAnomalies(userId, type as any);
      anomalies.push(...anomaly);
    }

    return anomalies;
  }

  async generateRecommendations(userId: string): Promise<string[]> {
    const analytics = await this.getLatestAnalyticsByUser(userId);
    if (!analytics) return [];

    const recommendations: string[] = [];

    // Generate recommendations based on trends
    for (const trend of analytics.trends || []) {
      if (trend.direction === 'down' && Math.abs(trend.percentage) > 10) {
        recommendations.push(
          `Consider improving ${trend.metric} - it has decreased by ${Math.abs(trend.percentage)}%`,
        );
      }
    }

    return recommendations;
  }
}
