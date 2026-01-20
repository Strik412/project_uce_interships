import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { AssignmentRepository } from '../repositories/assignment.repository';
import { PracticeAssignment, AssignmentStatus } from '../domain/assignment.entity';
import { CreateAssignmentDto, UpdateAssignmentDto } from '../controllers/dto/assignment.dto';

@Injectable()
export class AssignmentService {
  constructor(private readonly assignmentRepository: AssignmentRepository) {}

  async createAssignment(createDto: CreateAssignmentDto): Promise<PracticeAssignment> {
    // Validar que las fechas sean válidas
    const startDate = new Date(createDto.startDate);
    const endDate = new Date(createDto.endDate);

    if (startDate >= endDate) {
      throw new BadRequestException('Start date must be before end date');
    }

    // Calcular días de la práctica
    const practiceLength = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (practiceLength < 30) {
      throw new BadRequestException('Practice duration must be at least 30 days');
    }

    return this.assignmentRepository.create({
      ...createDto,
      status: AssignmentStatus.PENDING,
      completedHours: 0,
      completionPercentage: 0,
      lastActivityAt: new Date(),
    });
  }

  async getAssignmentById(id: string): Promise<PracticeAssignment> {
    const assignment = await this.assignmentRepository.findById(id);
    if (!assignment) {
      throw new NotFoundException(`Assignment with id ${id} not found`);
    }
    return assignment;
  }

  async getStudentAssignments(studentId: string): Promise<PracticeAssignment[]> {
    return this.assignmentRepository.findByStudentId(studentId);
  }

  async getCompanyAssignments(companyId: string): Promise<PracticeAssignment[]> {
    return this.assignmentRepository.findByCompanyId(companyId);
  }

  async getSupervisorAssignments(supervisorId: string): Promise<PracticeAssignment[]> {
    return this.assignmentRepository.findBySupervisorId(supervisorId);
  }

  async getActiveAssignments(): Promise<PracticeAssignment[]> {
    return this.assignmentRepository.findActive();
  }

  async updateAssignment(id: string, updateDto: UpdateAssignmentDto): Promise<PracticeAssignment> {
    const assignment = await this.getAssignmentById(id);

    // Si se actualiza el estado, validar transiciones válidas
    if (updateDto.status && updateDto.status !== assignment.status) {
      this.validateStatusTransition(assignment.status, updateDto.status);
    }

    const updated = await this.assignmentRepository.update(id, updateDto);
    if (!updated) {
      throw new NotFoundException(`Assignment with id ${id} not found after update`);
    }
    return updated;
  }

  async activateAssignment(id: string): Promise<PracticeAssignment> {
    const assignment = await this.getAssignmentById(id);
    
    if (assignment.status !== AssignmentStatus.PENDING) {
      throw new BadRequestException(`Cannot activate assignment in ${assignment.status} status`);
    }

    const updated = await this.assignmentRepository.update(id, {
      status: AssignmentStatus.ACTIVE,
      lastActivityAt: new Date(),
    });
    if (!updated) {
      throw new NotFoundException(`Assignment with id ${id} not found after activation`);
    }
    return updated;
  }

  async completeAssignment(id: string): Promise<PracticeAssignment> {
    const assignment = await this.getAssignmentById(id);

    if (assignment.status !== AssignmentStatus.ACTIVE) {
      throw new BadRequestException(`Cannot complete assignment in ${assignment.status} status`);
    }

    const updated = await this.assignmentRepository.update(id, {
      status: AssignmentStatus.COMPLETED,
      completionPercentage: 100,
      completedHours: assignment.totalHours,
      lastActivityAt: new Date(),
    });
    if (!updated) {
      throw new NotFoundException(`Assignment with id ${id} not found after completion`);
    }
    return updated;
  }

  async pauseAssignment(id: string): Promise<PracticeAssignment> {
    const assignment = await this.getAssignmentById(id);

    if (assignment.status !== AssignmentStatus.ACTIVE) {
      throw new BadRequestException(`Cannot pause assignment in ${assignment.status} status`);
    }

    const updated = await this.assignmentRepository.update(id, {
      status: AssignmentStatus.PAUSED,
      lastActivityAt: new Date(),
    });
    if (!updated) {
      throw new NotFoundException(`Assignment with id ${id} not found after pause`);
    }
    return updated;
  }

  async resumeAssignment(id: string): Promise<PracticeAssignment> {
    const assignment = await this.getAssignmentById(id);

    if (assignment.status !== AssignmentStatus.PAUSED) {
      throw new BadRequestException(`Cannot resume assignment in ${assignment.status} status`);
    }

    const updated = await this.assignmentRepository.update(id, {
      status: AssignmentStatus.ACTIVE,
      lastActivityAt: new Date(),
    });
    if (!updated) {
      throw new NotFoundException(`Assignment with id ${id} not found after resume`);
    }
    return updated;
  }

  async updateProgress(id: string, completedHours: number): Promise<PracticeAssignment> {
    const assignment = await this.getAssignmentById(id);

    if (completedHours > assignment.totalHours) {
      throw new BadRequestException(`Completed hours cannot exceed total hours (${assignment.totalHours})`);
    }

    const completionPercentage = (completedHours / assignment.totalHours) * 100;

    const updated = await this.assignmentRepository.update(id, {
      completedHours,
      completionPercentage: Math.round(completionPercentage * 100) / 100,
      lastActivityAt: new Date(),
    });
    if (!updated) {
      throw new NotFoundException(`Assignment with id ${id} not found after progress update`);
    }
    return updated;
  }

  async deleteAssignment(id: string): Promise<boolean> {
    const assignment = await this.getAssignmentById(id);

    if (assignment.status === AssignmentStatus.ACTIVE) {
      throw new BadRequestException('Cannot delete an active assignment');
    }

    return this.assignmentRepository.delete(id);
  }

  private validateStatusTransition(currentStatus: AssignmentStatus, newStatus: AssignmentStatus): void {
    const validTransitions: Record<AssignmentStatus, AssignmentStatus[]> = {
      [AssignmentStatus.PENDING]: [AssignmentStatus.ACTIVE, AssignmentStatus.CANCELLED],
      [AssignmentStatus.ACTIVE]: [AssignmentStatus.PAUSED, AssignmentStatus.COMPLETED, AssignmentStatus.CANCELLED],
      [AssignmentStatus.PAUSED]: [AssignmentStatus.ACTIVE, AssignmentStatus.CANCELLED],
      [AssignmentStatus.COMPLETED]: [],
      [AssignmentStatus.CANCELLED]: [],
    };

    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      throw new BadRequestException(
        `Invalid status transition from ${currentStatus} to ${newStatus}`,
      );
    }
  }
}
