import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { MilestoneRepository } from '../repositories/milestone.repository';
import { Milestone, MilestoneStatus } from '../domain/milestone.entity';
import { CreateMilestoneDto, UpdateMilestoneDto, CompleteMilestoneDto } from '../controllers/dto/milestone.dto';

@Injectable()
export class MilestoneService {
  constructor(private readonly milestoneRepository: MilestoneRepository) {}

  async createMilestone(createDto: CreateMilestoneDto): Promise<Milestone> {
    // Validar que la fecha de vencimiento sea en el futuro
    if (new Date(createDto.dueDate) <= new Date()) {
      throw new BadRequestException('Due date must be in the future');
    }

    return this.milestoneRepository.create({
      ...createDto,
      status: MilestoneStatus.PENDING,
      progress: 0,
      isCompleted: false,
    });
  }

  async getMilestoneById(id: string): Promise<Milestone> {
    const milestone = await this.milestoneRepository.findById(id);
    if (!milestone) {
      throw new NotFoundException(`Milestone with id ${id} not found`);
    }
    return milestone;
  }

  async getPlacementMilestones(placementId: string): Promise<Milestone[]> {
    return this.milestoneRepository.findByPlacementId(placementId);
  }

  async getMilestonesByStatus(status: MilestoneStatus): Promise<Milestone[]> {
    return this.milestoneRepository.findByStatus(status);
  }

  async getOverdueMilestones(): Promise<Milestone[]> {
    return this.milestoneRepository.findOverdue();
  }

  async getUpcomingMilestones(): Promise<Milestone[]> {
    return this.milestoneRepository.findUpcoming();
  }

  async updateMilestoneProgress(id: string, progress: number): Promise<Milestone> {
    const milestone = await this.getMilestoneById(id);

    if (progress < 0 || progress > 100) {
      throw new BadRequestException('Progress must be between 0 and 100');
    }

    // Determinar estado basado en progreso
    let newStatus = milestone.status;
    if (progress === 0 && milestone.status !== MilestoneStatus.PENDING) {
      newStatus = MilestoneStatus.PENDING;
    } else if (progress > 0 && progress < 100 && milestone.status === MilestoneStatus.PENDING) {
      newStatus = MilestoneStatus.IN_PROGRESS;
    } else if (progress === 100 && milestone.status !== MilestoneStatus.COMPLETED) {
      newStatus = MilestoneStatus.COMPLETED;
    }

    const updated = await this.milestoneRepository.update(id, {
      progress,
      status: newStatus,
    });
    if (!updated) {
      throw new NotFoundException(`Milestone with id ${id} not found after progress update`);
    }
    return updated;
  }

  async completeMilestone(id: string, completeDto: CompleteMilestoneDto): Promise<Milestone> {
    const milestone = await this.getMilestoneById(id);

    if (milestone.status === MilestoneStatus.COMPLETED) {
      throw new BadRequestException('Milestone is already completed');
    }

    const updated = await this.milestoneRepository.update(id, {
      status: MilestoneStatus.COMPLETED,
      progress: 100,
      isCompleted: true,
      completedAt: new Date(),
      feedback: completeDto.feedback,
    });
    if (!updated) {
      throw new NotFoundException(`Milestone with id ${id} not found after completion`);
    }
    return updated;
  }

  async updateMilestone(id: string, updateDto: UpdateMilestoneDto): Promise<Milestone> {
    const milestone = await this.getMilestoneById(id);

    if (milestone.isCompleted) {
      throw new BadRequestException('Cannot update a completed milestone');
    }

    // Validar nueva fecha si es proporcionada
    if (updateDto.dueDate && new Date(updateDto.dueDate) <= new Date()) {
      throw new BadRequestException('Due date must be in the future');
    }

    const updated = await this.milestoneRepository.update(id, updateDto);
    if (!updated) {
      throw new NotFoundException(`Milestone with id ${id} not found after update`);
    }
    return updated;
  }

  async checkMilestoneOverdue(id: string): Promise<boolean> {
    const milestone = await this.getMilestoneById(id);
    const now = new Date();
    const dueDate = new Date(milestone.dueDate);

    if (dueDate < now && !milestone.isCompleted) {
      // Actualizar estado a OVERDUE
      await this.milestoneRepository.update(id, {
        status: MilestoneStatus.OVERDUE,
      });
      return true;
    }

    return false;
  }

  async getMilestoneStats(placementId: string): Promise<{
    totalMilestones: number;
    completedMilestones: number;
    overdueMilestones: number;
    averageProgress: number;
    completionRate: number;
  }> {
    const milestones = await this.milestoneRepository.findByPlacementId(placementId);

    const totalMilestones = milestones.length;
    const completedMilestones = milestones.filter((m: Milestone) => m.isCompleted).length;
    const overdueMilestones = milestones.filter((m: Milestone) => new Date(m.dueDate) < new Date() && !m.isCompleted).length;
    const averageProgress = totalMilestones > 0 ? milestones.reduce((sum: number, m: Milestone) => sum + m.progress, 0) / totalMilestones : 0;
    const completionRate = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;

    return {
      totalMilestones,
      completedMilestones,
      overdueMilestones,
      averageProgress: Math.round(averageProgress * 100) / 100,
      completionRate: Math.round(completionRate * 100) / 100,
    };
  }

  async deleteMilestone(id: string): Promise<boolean> {
    const milestone = await this.getMilestoneById(id);

    if (milestone.isCompleted) {
      throw new BadRequestException('Cannot delete a completed milestone');
    }

    return this.milestoneRepository.delete(id);
  }

  async getMilestoneSummary(placementId: string): Promise<{
    milestones: Milestone[];
    stats: {
      totalMilestones: number;
      completedMilestones: number;
      overdueMilestones: number;
      averageProgress: number;
      completionRate: number;
    };
  }> {
    const milestones = await this.getPlacementMilestones(placementId);
    const stats = await this.getMilestoneStats(placementId);

    return {
      milestones,
      stats,
    };
  }
}
