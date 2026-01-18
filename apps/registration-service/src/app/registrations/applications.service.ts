import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplicationEntity } from '../database/entities/application.entity';
import { PracticeEntity } from '../database/entities/practice.entity';
import { CreateApplicationDto, UpdateApplicationStatusDto } from './dto/application.dto';
import { PlacementsService } from '../placements/placements.service';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(ApplicationEntity)
    private readonly applicationsRepository: Repository<ApplicationEntity>,
    @InjectRepository(PracticeEntity)
    private readonly practicesRepository: Repository<PracticeEntity>,
    private readonly placementsService: PlacementsService,
  ) {}

  async create(dto: CreateApplicationDto): Promise<ApplicationEntity> {
    const application = this.applicationsRepository.create({
      practice: { id: dto.practiceId },
      user: { id: dto.userId },
    } as any) as any;
    return this.applicationsRepository.save(application);
  }

  async findAll(practiceId?: string, userId?: string, page = 1, limit = 10) {
    if (page < 1 || limit < 1) {
      throw new BadRequestException('Page and limit must be positive');
    }

    let query = this.applicationsRepository
      .createQueryBuilder('application')
      .leftJoinAndSelect('application.practice', 'practice')
      .leftJoinAndSelect('application.user', 'user');

    if (practiceId) {
      query = query.andWhere('practice.id = :practiceId', { practiceId });
    }
    if (userId) {
      query = query.andWhere('user.id = :userId', { userId });
    }

    const [rawData, total] = await query
      .orderBy('application.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    // Normalize shape for frontend expectations
    const data = rawData.map((app) => ({
      ...app,
      practiceId: app.practice?.id,
      userId: app.user?.id,
    }));

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async findOne(id: string): Promise<ApplicationEntity> {
    const application = await this.applicationsRepository.findOne({ where: { id } });
    if (!application) {
      throw new NotFoundException('Application not found');
    }
    return application;
  }

  async updateStatus(id: string, dto: UpdateApplicationStatusDto): Promise<ApplicationEntity> {
    const application = await this.findOne(id);
    application.status = dto.status;
    if (dto.rejectionReason) {
      application.rejectionReason = dto.rejectionReason;
    }

    const updatedApplication = await this.applicationsRepository.save(application);

    // When application is accepted, automatically create a placement
    if (dto.status === 'accepted') {
      const application_with_relations = await this.applicationsRepository.findOne({
        where: { id },
        relations: ['practice', 'user'],
      });

      if (!application_with_relations?.practice || !application_with_relations?.user) {
        throw new NotFoundException('Application practice or user not found');
      }

      // Check if placement already exists for this application
      const existingPlacement = await this.placementsService.findByPractice(application_with_relations.practice.id);
      
      if (!existingPlacement) {
        // Create placement with default values
        // Note: professorId should be assigned by coordinator, initially null
        await this.placementsService.create({
          studentId: application_with_relations.user.id,
          practiceId: application_with_relations.practice.id,
          applicationId: application_with_relations.id,
          companySupervisorId: application_with_relations.practice.supervisorId, // Use practice supervisor if available
          startDate: new Date().toISOString(), // Default to now, should be updated
          endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // Default 90 days
          expectedHours: application_with_relations.practice.totalHours || 240, // Default to practice hours or 240
        });
      }
    }

    return updatedApplication;
  }

  async remove(id: string): Promise<{ id: string }> {
    const application = await this.findOne(id);
    await this.applicationsRepository.remove(application);
    return { id };
  }
}
