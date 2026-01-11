import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProgressReport, ProgressStatus } from '../domain/progress.entity';

@Injectable()
export class ProgressRepository {
  constructor(
    @InjectRepository(ProgressReport)
    private readonly repository: Repository<ProgressReport>,
  ) {}

  async create(report: Partial<ProgressReport>): Promise<ProgressReport> {
    const newReport = this.repository.create(report);
    return this.repository.save(newReport);
  }

  async findById(id: string): Promise<ProgressReport | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByAssignmentId(assignmentId: string): Promise<ProgressReport[]> {
    return this.repository.find({
      where: { assignmentId },
      order: { weekNumber: 'ASC' },
    });
  }

  async findByAssignmentAndWeek(assignmentId: string, weekNumber: number): Promise<ProgressReport | null> {
    return this.repository.findOne({
      where: { assignmentId, weekNumber },
    });
  }

  async findByStatus(status: ProgressStatus): Promise<ProgressReport[]> {
    return this.repository.find({
      where: { status },
      order: { reportDate: 'DESC' },
    });
  }

  async findPendingReviews(): Promise<ProgressReport[]> {
    return this.repository.find({
      where: { status: ProgressStatus.PENDING },
      order: { reportDate: 'ASC' },
    });
  }

  async findRecentByAssignment(assignmentId: string, limit: number = 5): Promise<ProgressReport[]> {
    return this.repository.find({
      where: { assignmentId },
      order: { reportDate: 'DESC' },
      take: limit,
    });
  }

  async update(id: string, report: Partial<ProgressReport>): Promise<ProgressReport | null> {
    await this.repository.update(id, report);
    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async findAll(): Promise<ProgressReport[]> {
    return this.repository.find({ order: { reportDate: 'DESC' } });
  }
}
