import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { PracticeEntity } from '../database/entities/practice.entity';
import { CreatePracticeDto, UpdatePracticeDto, QueryPracticesDto } from './dto/practice.dto';

@Injectable()
export class PracticesService {
  constructor(
    @InjectRepository(PracticeEntity)
    private readonly practicesRepository: Repository<PracticeEntity>,
  ) {}

  async create(dto: CreatePracticeDto): Promise<PracticeEntity> {
    const practice = this.practicesRepository.create(dto);
    return this.practicesRepository.save(practice);
  }

  async findAll(query: QueryPracticesDto) {
    const { page = 1, limit = 10, status, userId } = query;

    if (page < 1 || limit < 1) {
      throw new BadRequestException('Page and limit must be positive');
    }

    const where: any = { isActive: true };

    if (status) {
      where.status = status;
    }

    if (userId) {
      where.userId = userId;
    }

    const [data, total] = await this.practicesRepository.findAndCount({
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

  async findOne(id: string): Promise<PracticeEntity> {
    const practice = await this.practicesRepository.findOne({ where: { id, isActive: true } });
    if (!practice) {
      throw new NotFoundException('Practice not found');
    }
    return practice;
  }

  async update(id: string, dto: UpdatePracticeDto): Promise<PracticeEntity> {
    const practice = await this.findOne(id);
    const updated = this.practicesRepository.merge(practice, dto);
    return this.practicesRepository.save(updated);
  }

  async remove(id: string): Promise<{ id: string; isActive: boolean }> {
    const practice = await this.findOne(id);
    practice.isActive = false;
    await this.practicesRepository.save(practice);
    return { id, isActive: practice.isActive };
  }
}
