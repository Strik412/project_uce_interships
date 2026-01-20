import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Milestone, MilestoneStatus } from '../domain/milestone.entity';

@Injectable()
export class MilestoneRepository {
  constructor(
    @InjectRepository(Milestone)
    private readonly repository: Repository<Milestone>,
  ) {}

  async create(milestone: Partial<Milestone>): Promise<Milestone> {
    const newMilestone = this.repository.create(milestone);
    return this.repository.save(newMilestone);
  }

  async findById(id: string): Promise<Milestone | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByPlacementId(placementId: string): Promise<Milestone[]> {
    return this.repository.find({
      where: { placementId },
      order: { dueDate: 'ASC' },
    });
  }

  async findByStatus(status: MilestoneStatus): Promise<Milestone[]> {
    return this.repository.find({
      where: { status },
      order: { dueDate: 'ASC' },
    });
  }

  async findOverdue(): Promise<Milestone[]> {
    const today = new Date();
    return this.repository
      .createQueryBuilder('milestone')
      .where('milestone.dueDate < :today', { today })
      .andWhere('milestone.status != :completed', { completed: MilestoneStatus.COMPLETED })
      .orderBy('milestone.dueDate', 'ASC')
      .getMany();
  }

  async findUpcoming(days: number = 7): Promise<Milestone[]> {
    const today = new Date();
    const futureDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);
    return this.repository
      .createQueryBuilder('milestone')
      .where('milestone.dueDate BETWEEN :today AND :futureDate', { today, futureDate })
      .andWhere('milestone.status != :completed', { completed: MilestoneStatus.COMPLETED })
      .orderBy('milestone.dueDate', 'ASC')
      .getMany();
  }

  async findCompletedByPlacement(placementId: string): Promise<Milestone[]> {
    return this.repository.find({
      where: { placementId, isCompleted: true },
      order: { completedAt: 'DESC' },
    });
  }

  async update(id: string, milestone: Partial<Milestone>): Promise<Milestone | null> {
    await this.repository.update(id, milestone);
    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async findAll(): Promise<Milestone[]> {
    return this.repository.find({ order: { dueDate: 'ASC' } });
  }
}
