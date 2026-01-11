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
    const application = this.applicationsRepository.create(dto);
    return this.applicationsRepository.save(application);
  }

  async findAll(practiceId?: string, userId?: string, page = 1, limit = 10) {
    if (page < 1 || limit < 1) {
      throw new BadRequestException('Page and limit must be positive');
    }

    const where: any = {};
    if (practiceId) {
      where.practiceId = practiceId;
    }
    if (userId) {
      where.userId = userId;
    }

    const [data, total] = await this.applicationsRepository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

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
      const practice = await this.practicesRepository.findOne({
        where: { id: application.practiceId },
      });

      if (!practice) {
        throw new NotFoundException('Practice not found');
      }

      // Check if placement already exists for this application
      const existingPlacement = await this.placementsService.findByPractice(practice.id);
      
      if (!existingPlacement) {
        // Create placement with default values
        // Note: professorId should be assigned by coordinator, initially null
        await this.placementsService.create({
          studentId: application.userId,
          practiceId: practice.id,
          applicationId: application.id,
          companySupervisorId: practice.supervisorId, // Use practice supervisor if available
          startDate: new Date().toISOString(), // Default to now, should be updated
          endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // Default 90 days
          expectedHours: practice.totalHours || 240, // Default to practice hours or 240
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
