import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Report, ReportStatus, ReportType } from '../domain/report.entity';
import { ReportRepository } from '../infrastructure/report.repository';
import { CreateReportDto, UpdateReportDto } from '../dto/report.dto';

@Injectable()
export class ReportService {
  constructor(private readonly reportRepository: ReportRepository) {}

  async createReport(createReportDto: CreateReportDto): Promise<Report> {
    const report = this.reportRepository.create({
      userId: createReportDto.userId,
      type: createReportDto.type,
      title: createReportDto.title,
      description: createReportDto.description,
      filters: createReportDto.filters,
      status: ReportStatus.PENDING,
    });
    return this.reportRepository.save(report);
  }

  async getReportById(id: string): Promise<Report> {
    const report = await this.reportRepository.findOne({ where: { id } });
    if (!report) {
      throw new NotFoundException(`Report with ID ${id} not found`);
    }
    return report;
  }

  async getReportsByUserId(userId: string): Promise<Report[]> {
    return this.reportRepository.findByUserId(userId);
  }

  async getReportsByUserIdAndStatus(userId: string, status: ReportStatus): Promise<Report[]> {
    return this.reportRepository.findByUserIdAndStatus(userId, status);
  }

  async getActiveReports(userId: string): Promise<Report[]> {
    return this.reportRepository.findActiveReports(userId);
  }

  async getReportsByType(userId: string, type: ReportType): Promise<Report[]> {
    return this.reportRepository.findByUserIdAndType(userId, type);
  }

  async getPaginatedReports(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: Report[]; total: number }> {
    if (page < 1 || limit < 1) {
      throw new BadRequestException('Page and limit must be greater than 0');
    }
    return this.reportRepository.findPaginatedReports(userId, page, limit);
  }

  async updateReport(id: string, updateReportDto: UpdateReportDto): Promise<Report> {
    const report = await this.getReportById(id);
    Object.assign(report, updateReportDto);
    return this.reportRepository.save(report);
  }

  async startGeneratingReport(id: string): Promise<Report> {
    const report = await this.getReportById(id);
    if (report.status === ReportStatus.GENERATING) {
      throw new BadRequestException('Report is already being generated');
    }
    report.status = ReportStatus.GENERATING;
    return this.reportRepository.save(report);
  }

  async completeReport(
    id: string,
    data: Record<string, any>,
    fileUrl?: string,
    fileSize?: number,
  ): Promise<Report> {
    const report = await this.getReportById(id);
    report.data = data;
    report.status = ReportStatus.READY;
    report.generatedAt = new Date();
    if (fileUrl) {
      report.fileUrl = fileUrl;
    }
    if (fileSize) {
      report.fileSize = fileSize;
    }
    report.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    return this.reportRepository.save(report);
  }

  async failReport(id: string, errorMessage: string): Promise<Report> {
    const report = await this.getReportById(id);
    report.status = ReportStatus.FAILED;
    report.errorMessage = errorMessage;
    return this.reportRepository.save(report);
  }

  async deleteReport(id: string): Promise<void> {
    const report = await this.getReportById(id);
    await this.reportRepository.delete(id);
  }

  async deleteReportsByUserId(userId: string): Promise<number> {
    const result = await this.reportRepository.delete({ userId });
    return result.affected || 0;
  }

  async markExpiredReports(): Promise<void> {
    await this.reportRepository.markExpiredReports();
  }

  async getReportMetadata(id: string): Promise<Partial<Report>> {
    const report = await this.getReportById(id);
    return {
      id: report.id,
      title: report.title,
      type: report.type,
      status: report.status,
      generatedAt: report.generatedAt,
      expiresAt: report.expiresAt,
      fileSize: report.fileSize,
    };
  }
}
