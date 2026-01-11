import { Injectable } from '@nestjs/common';
import { DataSource, Repository, Between, LessThan, MoreThan } from 'typeorm';
import { Analytics } from '../domain/analytics.entity';

@Injectable()
export class AnalyticsRepository extends Repository<Analytics> {
  constructor(private dataSource: DataSource) {
    super(Analytics, dataSource.createEntityManager());
  }

  async findByUserId(userId: string): Promise<Analytics[]> {
    return this.find({
      where: { userId },
      order: { startDate: 'DESC' },
    });
  }

  async findByPracticeId(practiceId: string): Promise<Analytics[]> {
    return this.find({
      where: { practiceId },
      order: { startDate: 'DESC' },
    });
  }

  async findByCompanyId(companyId: string): Promise<Analytics[]> {
    return this.find({
      where: { companyId },
      order: { startDate: 'DESC' },
    });
  }

  async findLatestByUser(userId: string): Promise<Analytics | null> {
    return this.findOne({
      where: { userId },
      order: { startDate: 'DESC' },
    });
  }

  async findByPeriod(period: string): Promise<Analytics[]> {
    return this.find({
      where: { period },
      order: { startDate: 'DESC' },
    });
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Analytics[]> {
    return this.find({
      where: {
        startDate: MoreThan(startDate),
        endDate: LessThan(endDate),
      },
      order: { startDate: 'DESC' },
    });
  }

  async findWithAnomalies(): Promise<Analytics[]> {
    return this.find({
      where: { hasAnomalies: true },
      order: { startDate: 'DESC' },
    });
  }

  async findWithWarnings(): Promise<Analytics[]> {
    return this.createQueryBuilder('analytics')
      .where("jsonb_array_length(analytics.warnings) > 0")
      .orderBy('analytics.startDate', 'DESC')
      .getMany();
  }

  async createAnalytics(analytics: Partial<Analytics>): Promise<Analytics> {
    return this.save(this.create(analytics));
  }

  async updateAnalytics(id: string, updates: Partial<Analytics>): Promise<Analytics | null> {
    const analytics = await this.findOne({ where: { id } });
    if (analytics) {
      Object.assign(analytics, updates);
      return this.save(analytics);
    }
    return null;
  }

  async addWarning(id: string, warning: string): Promise<Analytics | null> {
    const analytics = await this.findOne({ where: { id } });
    if (analytics) {
      if (!analytics.warnings) {
        analytics.warnings = [];
      }
      analytics.warnings.push(warning);
      return this.save(analytics);
    }
    return null;
  }

  async addRecommendation(id: string, recommendation: string): Promise<Analytics | null> {
    const analytics = await this.findOne({ where: { id } });
    if (analytics) {
      if (!analytics.recommendations) {
        analytics.recommendations = [];
      }
      analytics.recommendations.push(recommendation);
      return this.save(analytics);
    }
    return null;
  }

  async markHasAnomalies(id: string, anomalyCount: number): Promise<Analytics | null> {
    const analytics = await this.findOne({ where: { id } });
    if (analytics) {
      analytics.hasAnomalies = anomalyCount > 0;
      analytics.anomalyCount = anomalyCount;
      return this.save(analytics);
    }
    return null;
  }

  async countByUser(userId: string): Promise<number> {
    return this.count({
      where: { userId },
    });
  }

  async deleteOldAnalytics(beforeDate: Date): Promise<number> {
    const result = await this.delete({
      createdAt: LessThan(beforeDate),
    });
    return result.affected || 0;
  }
}
