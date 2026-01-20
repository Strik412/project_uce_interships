import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { ProgressRepository } from '../repositories/progress.repository';
import { ProgressReport, ProgressStatus } from '../domain/progress.entity';
import { CreateProgressDto, UpdateProgressDto, ApproveProgressDto } from '../controllers/dto/progress.dto';

@Injectable()
export class ProgressService {
  constructor(private readonly progressRepository: ProgressRepository) {}

  async submitProgress(createDto: CreateProgressDto): Promise<ProgressReport> {
    // Validar que no exista un reporte para la misma semana
    const existingReport = await this.progressRepository.findByPlacementAndWeek(
      createDto.placementId,
      createDto.weekNumber,
    );

    if (existingReport) {
      throw new BadRequestException(`Progress report already exists for week ${createDto.weekNumber}`);
    }

    return this.progressRepository.create({
      ...createDto,
      status: ProgressStatus.PENDING,
      reportDate: new Date(),
    });
  }

  async getProgressById(id: string): Promise<ProgressReport> {
    const report = await this.progressRepository.findById(id);
    if (!report) {
      throw new NotFoundException(`Progress report with id ${id} not found`);
    }
    return report;
  }

  async getPlacementProgress(placementId: string): Promise<ProgressReport[]> {
    return this.progressRepository.findByPlacementId(placementId);
  }

  async getProgressStats(placementId: string): Promise<{
    totalReports: number;
    approvedReports: number;
    totalHours: number;
    averageHoursPerWeek: number;
    approvalRate: number;
  }> {
    const reports = await this.progressRepository.findByPlacementId(placementId);

    const totalReports = reports.length;
    const approvedReports = reports.filter((r: ProgressReport) => r.status === ProgressStatus.APPROVED).length;
    const totalHours = reports.reduce((sum: number, r: ProgressReport) => sum + r.hoursWorked, 0);
    const averageHoursPerWeek = totalReports > 0 ? totalHours / totalReports : 0;
    const approvalRate = totalReports > 0 ? (approvedReports / totalReports) * 100 : 0;

    return {
      totalReports,
      approvedReports,
      totalHours,
      averageHoursPerWeek: Math.round(averageHoursPerWeek * 100) / 100,
      approvalRate: Math.round(approvalRate * 100) / 100,
    };
  }

  async getPendingReviews(): Promise<ProgressReport[]> {
    return this.progressRepository.findPendingReviews();
  }

  async updateProgress(id: string, updateDto: UpdateProgressDto): Promise<ProgressReport> {
    const report = await this.getProgressById(id);

    if (report.status !== ProgressStatus.PENDING) {
      throw new BadRequestException(`Can only update reports in PENDING status, current status: ${report.status}`);
    }

    const updated = await this.progressRepository.update(id, updateDto);
    if (!updated) {
      throw new NotFoundException(`Progress report with id ${id} not found after update`);
    }
    return updated;
  }

  async approveProgress(id: string, approveDto: ApproveProgressDto): Promise<ProgressReport> {
    const report = await this.getProgressById(id);

    if (report.status !== ProgressStatus.PENDING && report.status !== ProgressStatus.REVISED) {
      throw new BadRequestException(`Can only approve reports in PENDING or REVISED status, current status: ${report.status}`);
    }

    const updated = await this.progressRepository.update(id, {
      status: ProgressStatus.APPROVED,
      reviewedBy: approveDto.reviewedBy,
      reviewComments: approveDto.comments,
      reviewedAt: new Date(),
    });
    if (!updated) {
      throw new NotFoundException(`Progress report with id ${id} not found after approval`);
    }
    return updated;
  }

  async rejectProgress(id: string, approveDto: ApproveProgressDto): Promise<ProgressReport> {
    const report = await this.getProgressById(id);

    if (report.status !== ProgressStatus.PENDING) {
      throw new BadRequestException(`Can only reject reports in PENDING status, current status: ${report.status}`);
    }

    const updated = await this.progressRepository.update(id, {
      status: ProgressStatus.REJECTED,
      reviewedBy: approveDto.reviewedBy,
      reviewComments: approveDto.comments,
      reviewedAt: new Date(),
    });
    if (!updated) {
      throw new NotFoundException(`Progress report with id ${id} not found after rejection`);
    }
    return updated;
  }

  async requestRevision(id: string, approveDto: ApproveProgressDto): Promise<ProgressReport> {
    const report = await this.getProgressById(id);

    if (report.status !== ProgressStatus.PENDING) {
      throw new BadRequestException(`Can only request revisions for reports in PENDING status`);
    }

    const updated = await this.progressRepository.update(id, {
      status: ProgressStatus.REVISED,
      reviewedBy: approveDto.reviewedBy,
      reviewComments: approveDto.comments,
      reviewedAt: new Date(),
    });
    if (!updated) {
      throw new NotFoundException(`Progress report with id ${id} not found after revision request`);
    }
    return updated;
  }

  async deleteProgress(id: string): Promise<boolean> {
    const report = await this.getProgressById(id);

    if (report.status === ProgressStatus.APPROVED) {
      throw new BadRequestException('Cannot delete an approved progress report');
    }

    return this.progressRepository.delete(id);
  }

  async getRecentProgress(placementId: string, limit: number = 5): Promise<ProgressReport[]> {
    return this.progressRepository.findRecentByPlacement(placementId, limit);
  }
}
