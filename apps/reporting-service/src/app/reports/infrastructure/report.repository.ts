import { Injectable } from '@nestjs/common';
import { DataSource, Repository, Between, LessThan } from 'typeorm';
import { Report, ReportStatus, ReportType } from '../domain/report.entity';

@Injectable()
export class ReportRepository extends Repository<Report> {
  constructor(private dataSource: DataSource) {
    super(Report, dataSource.createEntityManager());
  }

  async findByUserId(userId: string): Promise<Report[]> {
    return this.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findByUserIdAndStatus(userId: string, status: ReportStatus): Promise<Report[]> {
    return this.find({
      where: { userId, status },
      order: { createdAt: 'DESC' },
    });
  }

  async findByUserIdAndType(userId: string, type: ReportType): Promise<Report[]> {
    return this.find({
      where: { userId, type },
      order: { createdAt: 'DESC' },
    });
  }

  async findActiveReports(userId: string): Promise<Report[]> {
    return this.find({
      where: {
        userId,
        status: ReportStatus.READY,
      },
      order: { createdAt: 'DESC' },
    });
  }

  async findExpiredReports(): Promise<Report[]> {
    return this.find({
      where: {
        expiresAt: LessThan(new Date()),
        status: ReportStatus.READY,
      },
    });
  }

  async findReportsByDateRange(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Report[]> {
    return this.find({
      where: {
        userId,
        createdAt: Between(startDate, endDate),
      },
      order: { createdAt: 'DESC' },
    });
  }

  async findPaginatedReports(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: Report[]; total: number }> {
    const [data, total] = await this.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total };
  }

  async findReportsByStatus(status: ReportStatus): Promise<Report[]> {
    return this.find({
      where: { status },
      order: { createdAt: 'DESC' },
    });
  }

  async updateReportStatus(reportId: string, status: ReportStatus): Promise<Report | null> {
    const report = await this.findOne({ where: { id: reportId } });
    if (report) {
      report.status = status;
      return this.save(report);
    }
    return null;
  }

  async updateReportData(
    reportId: string,
    data: Record<string, any>,
    fileUrl?: string,
  ): Promise<Report | null> {
    const report = await this.findOne({ where: { id: reportId } });
    if (report) {
      report.data = data;
      report.status = ReportStatus.READY;
      report.generatedAt = new Date();
      if (fileUrl) {
        report.fileUrl = fileUrl;
      }
      return this.save(report);
    }
    return null;
  }

  async updateReportError(reportId: string, errorMessage: string): Promise<Report | null> {
    const report = await this.findOne({ where: { id: reportId } });
    if (report) {
      report.status = ReportStatus.FAILED;
      report.errorMessage = errorMessage;
      return this.save(report);
    }
    return null;
  }

  async markExpiredReports(): Promise<void> {
    const expiredReports = await this.findExpiredReports();
    for (const report of expiredReports) {
      report.status = ReportStatus.EXPIRED;
      await this.save(report);
    }
  }

  async deleteOldReports(beforeDate: Date): Promise<number> {
    const result = await this.delete({
      createdAt: LessThan(beforeDate),
    });
    return result.affected || 0;
  }
}
