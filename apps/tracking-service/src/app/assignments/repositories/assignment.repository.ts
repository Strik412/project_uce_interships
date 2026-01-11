import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PracticeAssignment, AssignmentStatus } from '../domain/assignment.entity';

@Injectable()
export class AssignmentRepository {
  constructor(
    @InjectRepository(PracticeAssignment)
    private readonly repository: Repository<PracticeAssignment>,
  ) {}

  async create(assignment: Partial<PracticeAssignment>): Promise<PracticeAssignment> {
    const newAssignment = this.repository.create(assignment);
    return this.repository.save(newAssignment);
  }

  async findById(id: string): Promise<PracticeAssignment | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByStudentId(studentId: string): Promise<PracticeAssignment[]> {
    return this.repository.find({
      where: { studentId },
      order: { createdAt: 'DESC' },
    });
  }

  async findByCompanyId(companyId: string): Promise<PracticeAssignment[]> {
    return this.repository.find({
      where: { companyId },
      order: { createdAt: 'DESC' },
    });
  }

  async findBySupervisorId(supervisorId: string): Promise<PracticeAssignment[]> {
    return this.repository.find({
      where: { supervisorId },
      order: { createdAt: 'DESC' },
    });
  }

  async findByStatus(status: AssignmentStatus): Promise<PracticeAssignment[]> {
    return this.repository.find({
      where: { status },
      order: { createdAt: 'DESC' },
    });
  }

  async findActive(): Promise<PracticeAssignment[]> {
    return this.repository.find({
      where: { status: AssignmentStatus.ACTIVE },
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, assignment: Partial<PracticeAssignment>): Promise<PracticeAssignment | null> {
    await this.repository.update(id, assignment);
    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async findAll(): Promise<PracticeAssignment[]> {
    return this.repository.find({ order: { createdAt: 'DESC' } });
  }
}
