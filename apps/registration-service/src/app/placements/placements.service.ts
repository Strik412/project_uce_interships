import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlacementEntity, PlacementStatus, AssignmentStatus } from '../database/entities/placement.entity';
import { CreatePlacementDto, UpdatePlacementDto } from './dto/placement.dto';
import { CertificateIntegrationService } from '../services/certificate-integration.service';

@Injectable()
export class PlacementsService {
  private readonly logger = new Logger(PlacementsService.name);

  constructor(
    @InjectRepository(PlacementEntity)
    private readonly placementRepository: Repository<PlacementEntity>,
    private readonly certificateIntegrationService: CertificateIntegrationService,
  ) {}

  async create(dto: CreatePlacementDto): Promise<PlacementEntity> {
    const placement = this.placementRepository.create({
      status: PlacementStatus.ACTIVE,
      completedHours: 0,
      expectedHours: dto.expectedHours,
      startDate: dto.startDate as any,
      endDate: dto.endDate as any,
      coordinatorNotes: dto.coordinatorNotes,
      companySupervisorId: dto.companySupervisorId,
      professorId: dto.professorId,
      assignmentStatus: AssignmentStatus.PENDING,
      // Set relations explicitly to populate FK columns
      student: { id: dto.studentId } as any,
      practice: { id: dto.practiceId } as any,
      application: dto.applicationId ? ({ id: dto.applicationId } as any) : undefined,
    });

    return await this.placementRepository.save(placement);
  }

  async findAll(userId: string, userRole: string): Promise<PlacementEntity[]> {
    // Students see only their own placements
    if (userRole === 'student') {
      return await this.placementRepository.createQueryBuilder('placement')
        .leftJoinAndSelect('placement.student', 'student')
        .leftJoinAndSelect('placement.practice', 'practice')
        .leftJoinAndSelect('placement.application', 'application')
        .where('student.id = :userId', { userId })
        .getMany();
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
        .leftJoinAndSelect('practice.user', 'user')
        .leftJoinAndSelect('placement.application', 'application')
        .where('user.id = :userId', { userId })
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
    if (userRole === 'student' && placement.student?.id !== userId) {
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

    // Check if placement is transitioning to COMPLETED status
    const isCompletionTransition = dto.status === PlacementStatus.COMPLETED && placement.status !== PlacementStatus.COMPLETED;

    Object.assign(placement, dto);
    const updatedPlacement = await this.placementRepository.save(placement);

    // Trigger certificate generation when placement is marked as COMPLETED
    if (isCompletionTransition) {
      await this.triggerCertificateGeneration(updatedPlacement);
    }

    return updatedPlacement;
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
    status: typeof PlacementStatus[keyof typeof PlacementStatus],
    userId: string,
    userRole: string,
  ): Promise<PlacementEntity> {
    return await this.update(id, { status }, userId, userRole);
  }

  async findByPractice(practiceId: string): Promise<PlacementEntity | null> {
    return await this.placementRepository.createQueryBuilder('placement')
      .leftJoinAndSelect('placement.practice', 'practice')
      .leftJoinAndSelect('placement.application', 'application')
      .where('practice.id = :practiceId', { practiceId })
      .getOne();
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

  private async triggerCertificateGeneration(placement: PlacementEntity): Promise<void> {
    try {
      this.logger.log(`Triggering certificate generation for placement ${placement.id}`);

      // Get the practice details to retrieve practice name
      const placementWithRelations = await this.placementRepository.findOne({
        where: { id: placement.id },
        relations: ['practice'],
      });

      if (!placementWithRelations?.practice) {
        this.logger.warn(`Could not find practice details for placement ${placement.id}`);
        return;
      }

      // For now, use placeholder values - in a production system, you'd fetch actual user names from user service
      // This is a simplified implementation. In real scenario, you'd call User Management Service to get full names
      const payload = {
        placementId: placement.id,
        studentId: placement.student?.id || '',
        studentName: `Student ${placement.student?.id}`, // TODO: Fetch from User Management Service
        professorId: placement.professorId || '',
        professorName: placement.professorId ? `Professor ${placement.professorId}` : 'Unassigned', // TODO: Fetch from User Management Service
        practiceName: placementWithRelations.practice.companyName || 'Professional Practice',
        totalHours: Number(placement.completedHours) || 0,
        startDate: placement.startDate,
        endDate: placement.endDate,
      };

      await this.certificateIntegrationService.generateCertificate(payload);
    } catch (error) {
      this.logger.error(
        `Error triggering certificate generation for placement ${placement.id}: ${error instanceof Error ? error.message : String(error)}`,
      );
      // Don't throw - certificate generation failure shouldn't block the placement completion
    }
  }
}
