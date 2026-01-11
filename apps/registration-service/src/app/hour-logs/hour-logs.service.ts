import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HourLogEntity, HourLogStatus } from '../database/entities/hour-log.entity';
import { PlacementEntity } from '../database/entities/placement.entity';
import { CreateHourLogDto, ReviewHourLogDto, UpdateHourLogDto } from './dto/hour-log.dto';

@Injectable()
export class HourLogsService {
  constructor(
    @InjectRepository(HourLogEntity)
    private readonly hourLogRepository: Repository<HourLogEntity>,
    @InjectRepository(PlacementEntity)
    private readonly placementRepository: Repository<PlacementEntity>,
  ) {}

  async create(dto: CreateHourLogDto, studentId: string): Promise<HourLogEntity> {
    // Verify the placement belongs to the student
    const placement = await this.placementRepository.findOne({
      where: { id: dto.placementId },
    });

    if (!placement) {
      throw new NotFoundException('Placement not found');
    }

    if (placement.studentId !== studentId) {
      throw new ForbiddenException('You can only log hours for your own placement');
    }

    // Check if adding these hours would exceed expected hours
    const totalLogged = await this.getTotalHoursByPlacement(dto.placementId);
    if (totalLogged + dto.hours > placement.expectedHours) {
      throw new BadRequestException(
        `Adding ${dto.hours} hours would exceed expected hours (${placement.expectedHours}). Current: ${totalLogged}`
      );
    }

    const hourLog = this.hourLogRepository.create({
      ...dto,
      studentId,
      status: HourLogStatus.PENDING,
    });

    return await this.hourLogRepository.save(hourLog);
  }

  async findAll(userId: string, userRole: string, placementId?: string): Promise<HourLogEntity[]> {
    const query = this.hourLogRepository.createQueryBuilder('log')
      .leftJoinAndSelect('log.placement', 'placement')
      .leftJoin('placement.practice', 'practice')
      .orderBy('log.date', 'DESC');

    if (placementId) {
      query.andWhere('log.placementId = :placementId', { placementId });
    }

    // Students see only their own logs
    if (userRole === 'student') {
      query.andWhere('log.studentId = :userId', { userId });
    }

    // Professors see logs for their assigned placements
    if (userRole === 'professor') {
      query.andWhere('placement.professorId = :userId', { userId });
    }

    // Company users see logs where they are supervisor OR practice owner
    if (userRole === 'company') {
      query.andWhere('(placement.companySupervisorId = :userId OR practice.userId = :userId)', { userId });
    }

    // Coordinators and admins see all logs (no additional filter)

    return await query.getMany();
  }

  async findOne(id: string, userId: string, userRole: string): Promise<HourLogEntity> {
    const log = await this.hourLogRepository.findOne({
      where: { id },
      relations: ['placement', 'placement.practice'],
    });

    if (!log) {
      throw new NotFoundException('Hour log not found');
    }

    // Check access permissions
    if (userRole === 'student' && log.studentId !== userId) {
      throw new ForbiddenException('You can only view your own hour logs');
    }

    if (userRole === 'professor' && log.placement?.professorId !== userId) {
      throw new ForbiddenException('You can only view hour logs for your assigned placements');
    }

    if (userRole === 'company' && log.placement?.companySupervisorId !== userId && log.placement?.practice?.userId !== userId) {
      throw new ForbiddenException('You can only view hour logs for your assigned placements');
    }

    return log;
  }

  async update(
    id: string,
    dto: UpdateHourLogDto,
    userId: string,
    userRole: string,
  ): Promise<HourLogEntity> {
    const log = await this.findOne(id, userId, userRole);

    // Only students can update their own pending logs
    if (log.studentId !== userId || userRole !== 'student') {
      throw new ForbiddenException('You can only update your own hour logs');
    }

    if (log.status !== HourLogStatus.PENDING) {
      throw new BadRequestException('You can only update pending hour logs');
    }

    Object.assign(log, dto);
    return await this.hourLogRepository.save(log);
  }

  async review(
    id: string,
    dto: ReviewHourLogDto,
    reviewerId: string,
    userRole: string,
  ): Promise<HourLogEntity> {
    const log = await this.hourLogRepository.findOne({
      where: { id },
      relations: ['placement', 'placement.practice'],
    });

    if (!log) {
      throw new NotFoundException('Hour log not found');
    }

    // Check permissions and identify who is reviewing
    let isTeacher = false;
    let isCompany = false;

    if (userRole === 'professor' && log.placement?.professorId === reviewerId) {
      isTeacher = true;
    } else if (
      userRole === 'company' &&
      (log.placement?.companySupervisorId === reviewerId || log.placement?.practice?.userId === reviewerId)
    ) {
      isCompany = true;
    } else if (!['coordinator', 'admin'].includes(userRole)) {
      throw new ForbiddenException('You do not have permission to review this hour log');
    }

    if (log.status !== HourLogStatus.PENDING) {
      throw new BadRequestException('This hour log has already been reviewed');
    }

    // Update with the appropriate approval fields
    if (isTeacher) {
      log.teacherApprovedBy = reviewerId;
      log.teacherApprovedAt = new Date();
      log.teacherApprovalComments = dto.reviewerComments;
    } else if (isCompany) {
      log.companyApprovedBy = reviewerId;
      log.companyApprovedAt = new Date();
      log.companyApprovalComments = dto.reviewerComments;
    } else {
      // For coordinators/admins, treat as teacher approval
      log.teacherApprovedBy = reviewerId;
      log.teacherApprovedAt = new Date();
      log.teacherApprovalComments = dto.reviewerComments;
    }

    // Set overall status based on approval logic
    if (dto.status === HourLogStatus.APPROVED) {
      // Check if both teacher and company have approved
      if (log.teacherApprovedBy && log.companyApprovedBy) {
        log.status = HourLogStatus.APPROVED;
      } else {
        // Keep as pending if waiting for other party's approval
        log.status = HourLogStatus.PENDING;
      }
    } else if (dto.status === HourLogStatus.REJECTED) {
      // Either party can reject
      log.status = HourLogStatus.REJECTED;
      log.reviewedBy = reviewerId;
      log.reviewedAt = new Date();
      log.reviewerComments = dto.reviewerComments;
    }

    const savedLog = await this.hourLogRepository.save(log);

    // If now fully approved, update the placement's completed hours
    if (savedLog.status === HourLogStatus.APPROVED && log.placement) {
      await this.updatePlacementHours(log.placementId);
    }

    return savedLog;
  }

  async remove(id: string, userId: string, userRole: string): Promise<{ id: string }> {
    const log = await this.findOne(id, userId, userRole);

    // Only students can delete their own pending logs
    if (log.studentId !== userId || userRole !== 'student') {
      throw new ForbiddenException('You can only delete your own hour logs');
    }

    if (log.status !== HourLogStatus.PENDING) {
      throw new BadRequestException('You can only delete pending hour logs');
    }

    await this.hourLogRepository.remove(log);
    return { id };
  }

  private async getTotalHoursByPlacement(placementId: string): Promise<number> {
    const result = await this.hourLogRepository
      .createQueryBuilder('log')
      .select('SUM(log.hours)', 'total')
      .where('log.placementId = :placementId', { placementId })
      .andWhere('log.status IN (:...statuses)', {
        statuses: [HourLogStatus.APPROVED, HourLogStatus.PENDING],
      })
      .getRawOne();

    return parseFloat(result?.total || '0');
  }

  private async updatePlacementHours(placementId: string): Promise<void> {
    const result = await this.hourLogRepository
      .createQueryBuilder('log')
      .select('SUM(log.hours)', 'total')
      .where('log.placementId = :placementId', { placementId })
      .andWhere('log.status = :status', { status: HourLogStatus.APPROVED })
      .getRawOne();

    const completedHours = parseFloat(result?.total || '0');

    await this.placementRepository.update(
      { id: placementId },
      { completedHours }
    );
  }

  async getStatsByPlacement(placementId: string, userId: string, userRole: string): Promise<any> {
    // Verify access
    const placement = await this.placementRepository.findOne({
      where: { id: placementId },
    });

    if (!placement) {
      throw new NotFoundException('Placement not found');
    }

    if (userRole === 'student' && placement.studentId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    if (userRole === 'professor' && placement.professorId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    const [pending, approved, rejected, total] = await Promise.all([
      this.hourLogRepository.count({
        where: { placementId, status: HourLogStatus.PENDING },
      }),
      this.hourLogRepository.count({
        where: { placementId, status: HourLogStatus.APPROVED },
      }),
      this.hourLogRepository.count({
        where: { placementId, status: HourLogStatus.REJECTED },
      }),
      this.getTotalHoursByPlacement(placementId),
    ]);

    const approvedHours = await this.hourLogRepository
      .createQueryBuilder('log')
      .select('SUM(log.hours)', 'total')
      .where('log.placementId = :placementId', { placementId })
      .andWhere('log.status = :status', { status: HourLogStatus.APPROVED })
      .getRawOne();

    return {
      placementId,
      expectedHours: placement.expectedHours,
      completedHours: placement.completedHours,
      approvedHours: parseFloat(approvedHours?.total || '0'),
      pendingLogs: pending,
      approvedLogs: approved,
      rejectedLogs: rejected,
      totalLogs: pending + approved + rejected,
      progress: placement.expectedHours > 0
        ? Math.round((placement.completedHours / placement.expectedHours) * 100)
        : 0,
    };
  }
}
