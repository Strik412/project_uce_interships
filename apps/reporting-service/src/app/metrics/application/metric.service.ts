import { Injectable, NotFoundException } from '@nestjs/common';
import { Metric, MetricType, MetricScope } from '../domain/metric.entity';
import { MetricRepository } from '../infrastructure/metric.repository';
import { CreateMetricDto } from '../dto/metric.dto';

@Injectable()
export class MetricService {
  constructor(private readonly metricRepository: MetricRepository) {}

  async createMetric(createMetricDto: CreateMetricDto): Promise<Metric> {
    const metric = this.metricRepository.create({
      userId: createMetricDto.userId,
      practiceId: createMetricDto.practiceId,
      companyId: createMetricDto.companyId,
      type: createMetricDto.type,
      scope: createMetricDto.scope,
      value: createMetricDto.value,
      unit: createMetricDto.unit,
      date: new Date(),
      metadata: createMetricDto.metadata,
      description: createMetricDto.description,
    });
    return this.metricRepository.save(metric);
  }

  async getMetricById(id: string): Promise<Metric> {
    const metric = await this.metricRepository.findOne({ where: { id } });
    if (!metric) {
      throw new NotFoundException(`Metric with ID ${id} not found`);
    }
    return metric;
  }

  async getMetricsByUserId(userId: string): Promise<Metric[]> {
    return this.metricRepository.findByUserId(userId);
  }

  async getMetricsByPracticeId(practiceId: string): Promise<Metric[]> {
    return this.metricRepository.findByPracticeId(practiceId);
  }

  async getMetricsByType(type: MetricType): Promise<Metric[]> {
    return this.metricRepository.findByType(type);
  }

  async getLatestMetricsByUser(userId: string, limit: number = 10): Promise<Metric[]> {
    return this.metricRepository.findLatestMetricsByUser(userId, limit);
  }

  async getMetricsByDateRange(startDate: Date, endDate: Date): Promise<Metric[]> {
    return this.metricRepository.findByDateRange(startDate, endDate);
  }

  async getUserMetricsByDateRange(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Metric[]> {
    return this.metricRepository.findUserMetricsByDateRange(userId, startDate, endDate);
  }

  async getAnomalousMetrics(): Promise<Metric[]> {
    return this.metricRepository.findAnomalousMetrics();
  }

  async getAnomalousMetricsByUser(userId: string): Promise<Metric[]> {
    return this.metricRepository.findAnomalousMetricsByUser(userId);
  }

  async getMetricsByScope(scope: MetricScope): Promise<Metric[]> {
    return this.metricRepository.findMetricsByScope(scope);
  }

  async calculateAverageMetric(type: MetricType, days?: number): Promise<number> {
    return this.metricRepository.calculateAverageMetric(type, days);
  }

  async calculateUserAverageMetric(
    userId: string,
    type: MetricType,
    days?: number,
  ): Promise<number> {
    return this.metricRepository.calculateUserAverageMetric(userId, type, days);
  }

  async getTrendData(userId: string, type: MetricType, days?: number): Promise<Metric[]> {
    return this.metricRepository.findTrendData(userId, type, days);
  }

  async updateMetricValue(id: string, value: number): Promise<Metric> {
    const metric = await this.metricRepository.updateMetricValue(id, value);
    if (!metric) {
      throw new NotFoundException(`Metric with ID ${id} not found`);
    }
    return metric;
  }

  async markAsAnomalous(id: string): Promise<Metric> {
    const metric = await this.metricRepository.markAnomalous(id);
    if (!metric) {
      throw new NotFoundException(`Metric with ID ${id} not found`);
    }
    return metric;
  }

  async deleteMetric(id: string): Promise<void> {
    const metric = await this.getMetricById(id);
    await this.metricRepository.delete(id);
  }

  async deleteMetricsByUserId(userId: string): Promise<number> {
    const result = await this.metricRepository.delete({ userId });
    return result.affected || 0;
  }

  async detectAnomalies(userId: string, type: MetricType): Promise<Metric[]> {
    const metrics = await this.getTrendData(userId, type, 30);
    if (metrics.length < 3) return [];

    const values = metrics.map((m) => parseFloat(m.value.toString()));
    const mean = values.reduce((a, b) => a + b) / values.length;
    const variance = values.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    const anomalies: Metric[] = [];
    for (const metric of metrics) {
      const value = parseFloat(metric.value.toString());
      if (Math.abs(value - mean) > 3 * stdDev) {
        metric.isAnomalous = true;
        anomalies.push(await this.metricRepository.save(metric));
      }
    }
    return anomalies;
  }
}
