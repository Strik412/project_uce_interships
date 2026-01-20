import { Injectable } from '@nestjs/common';
import { DataSource, Repository, Between, LessThan, MoreThan } from 'typeorm';
import { Metric, MetricType, MetricScope } from '../domain/metric.entity';

@Injectable()
export class MetricRepository extends Repository<Metric> {
  constructor(private dataSource: DataSource) {
    super(Metric, dataSource.createEntityManager());
  }

  async findByUserId(userId: string): Promise<Metric[]> {
    return this.find({
      where: { userId },
      order: { date: 'DESC' },
    });
  }

  async findByPracticeId(practiceId: string): Promise<Metric[]> {
    return this.find({
      where: { practiceId },
      order: { date: 'DESC' },
    });
  }

  async findByType(type: MetricType): Promise<Metric[]> {
    return this.find({
      where: { type },
      order: { date: 'DESC' },
    });
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Metric[]> {
    return this.find({
      where: {
        date: Between(startDate, endDate),
      },
      order: { date: 'DESC' },
    });
  }

  async findUserMetricsByDateRange(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Metric[]> {
    return this.find({
      where: {
        userId,
        date: Between(startDate, endDate),
      },
      order: { date: 'DESC' },
    });
  }

  async findLatestMetricsByUser(userId: string, limit: number = 10): Promise<Metric[]> {
    return this.find({
      where: { userId },
      order: { date: 'DESC' },
      take: limit,
    });
  }

  async findMetricsByScope(scope: MetricScope): Promise<Metric[]> {
    return this.find({
      where: { scope },
      order: { date: 'DESC' },
    });
  }

  async findAnomalousMetrics(): Promise<Metric[]> {
    return this.find({
      where: { isAnomalous: true },
      order: { date: 'DESC' },
    });
  }

  async findAnomalousMetricsByUser(userId: string): Promise<Metric[]> {
    return this.find({
      where: { userId, isAnomalous: true },
      order: { date: 'DESC' },
    });
  }

  async calculateAverageMetric(type: MetricType, days: number = 7): Promise<number> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const metrics = await this.find({
      where: {
        type,
        date: MoreThan(startDate),
      },
    });

    if (metrics.length === 0) return 0;
    const sum = metrics.reduce((acc, m) => acc + parseFloat(m.value.toString()), 0);
    return sum / metrics.length;
  }

  async calculateUserAverageMetric(userId: string, type: MetricType, days: number = 7): Promise<number> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const metrics = await this.find({
      where: {
        userId,
        type,
        date: MoreThan(startDate),
      },
    });

    if (metrics.length === 0) return 0;
    const sum = metrics.reduce((acc, m) => acc + parseFloat(m.value.toString()), 0);
    return sum / metrics.length;
  }

  async findTrendData(
    userId: string,
    type: MetricType,
    days: number = 30,
  ): Promise<Metric[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return this.find({
      where: {
        userId,
        type,
        date: MoreThan(startDate),
      },
      order: { date: 'ASC' },
    });
  }

  async findMetricsByTypeAndScope(type: MetricType, scope: MetricScope): Promise<Metric[]> {
    return this.find({
      where: { type, scope },
      order: { date: 'DESC' },
    });
  }

  async createMetric(metric: Partial<Metric>): Promise<Metric> {
    return this.save(this.create(metric));
  }

  async updateMetricValue(id: string, value: number): Promise<Metric | null> {
    const metric = await this.findOne({ where: { id } });
    if (metric) {
      metric.value = value;
      return this.save(metric);
    }
    return null;
  }

  async markAnomalous(id: string): Promise<Metric | null> {
    const metric = await this.findOne({ where: { id } });
    if (metric) {
      metric.isAnomalous = true;
      return this.save(metric);
    }
    return null;
  }

  async deleteOldMetrics(beforeDate: Date): Promise<number> {
    const result = await this.delete({
      date: LessThan(beforeDate),
    });
    return result.affected || 0;
  }
}
