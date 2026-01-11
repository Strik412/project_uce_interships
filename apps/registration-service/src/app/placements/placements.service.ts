import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlacementEntity, PlacementStatus, AssignmentStatus } from '../database/entities/placement.entity';
import { CreatePlacementDto, UpdatePlacementDto } from './dto/placement.dto';

@Injectable()
export class PlacementsService {
  constructor(
    @InjectRepository(PlacementEntity)
    private readonly placementRepository: Repository<PlacementEntity>,
  ) {}

  async create(dto: CreatePlacementDto): Promise<PlacementEntity> {
    const placement = this.placementRepository.create({
      ...dto,
      status: PlacementStatus.ACTIVE,
      completedHours: 0,
    });

    return await this.placementRepository.save(placement);
  }

  async findAll(userId: string, userRole: string): Promise<PlacementEntity[]> {
    // Students see only their own placements
    if (userRole === 'student') {
      return await this.placementRepository.find({
        where: { studentId: userId },
        relations: ['practice', 'application'],
      });
    }

    // Professors see only their assigned placements
    if (userRole === 'professor') {
      return await this.placementRepository.find({
        where: { professorId: userId },
        relations: ['practice', 'application'],
      });
    }

    // Companies see placements for practices they own OR where they are assigned as supervisor
    if (userRole === 'company') {
      return await this.placementRepository.createQueryBuilder('placement')
        .leftJoinAndSelect('placement.practice', 'practice')
        .leftJoinAndSelect('placement.application', 'application')
        .where('practice.userId = :userId', { userId })
        .orWhere('placement.companySupervisorId = :userId', { userId })
        .getMany();
    }

    // Coordinators/admins see all placements
    return await this.placementRepository.find({
      relations: ['practice', 'application'],
    });
  }

  async findOne(id: string, userId: string, userRole: string): Promise<PlacementEntity> {
    const placement = await this.placementRepository.findOne({
      where: { id },
      relations: ['practice', 'application'],
    });

    if (!placement) {
      throw new NotFoundException(`Placement with id ${id} not found`);
    }

    // Check access permissions
    if (userRole === 'student' && placement.studentId !== userId) {
      throw new ForbiddenException('You can only view your own placements');
    }

    if (userRole === 'professor' && placement.professorId !== userId) {
      throw new ForbiddenException('You can only view your assigned placements');
    }

    if (userRole === 'company' && placement.companySupervisorId !== userId) {
      throw new ForbiddenException('You can only view your assigned placements');
    }

    return placement;
  }

  async update(
    id: string,
    dto: UpdatePlacementDto,
    userId: string,
    userRole: string,
  ): Promise<PlacementEntity> {
    const placement = await this.findOne(id, userId, userRole);

    // Only professor, coordinator, or admin can update hours
    if (dto.completedHours !== undefined && !['professor', 'coordinator', 'admin'].includes(userRole)) {
      throw new ForbiddenException('Only assigned professor or coordinator can update hours');
    }

    // Only coordinator or admin can update status
    if (dto.status !== undefined && !['coordinator', 'admin'].includes(userRole)) {
      throw new ForbiddenException('Only coordinator or admin can update status');
    }

    Object.assign(placement, dto);
    return await this.placementRepository.save(placement);
  }

  async updateHours(
    id: string,
    completedHours: number,
    userId: string,
    userRole: string,
  ): Promise<PlacementEntity> {
    return await this.update(id, { completedHours }, userId, userRole);
  }

  async updateStatus(
    id: string,
    status: PlacementStatus,
    userId: string,
    userRole: string,
  ): Promise<PlacementEntity> {
    return await this.update(id, { status }, userId, userRole);
  }

  async findByPractice(practiceId: string): Promise<PlacementEntity | null> {
    return await this.placementRepository.findOne({
      where: { practiceId },
      relations: ['practice', 'application'],
    });
  }

  async assignProfessor(
    id: string,
    professorId: string,
    assignerId: string,
    userRole: string,
  ): Promise<PlacementEntity> {
    if (!['company', 'coordinator', 'admin'].includes(userRole)) {
      throw new ForbiddenException('Only company, coordinator or admin can assign a professor');
    }
    const placement = await this.placementRepository.findOne({ where: { id } });
    if (!placement) throw new NotFoundException('Placement not found');
    placement.professorId = professorId;
    placement.assignmentStatus = AssignmentStatus.INVITED;
    placement.assignedBy = assignerId;
    return await this.placementRepository.save(placement);
  }

  async respondAssignment(
    id: string,
    action: 'accept' | 'decline',
    professorId: string,
  ): Promise<PlacementEntity> {
    const placement = await this.placementRepository.findOne({ where: { id } });
    if (!placement) throw new NotFoundException('Placement not found');
    if (!placement.professorId || placement.professorId !== professorId) {
      throw new ForbiddenException('You are not the invited professor for this placement');
    }
    if (action === 'accept') {
      placement.assignmentStatus = AssignmentStatus.ACCEPTED;
      placement.supervisorAssignedAt = new Date();
    } else {
      placement.assignmentStatus = AssignmentStatus.DECLINED;
      placement.professorId = null as any; // clear professor assignment
    }
    return await this.placementRepository.save(placement);
  }
}
