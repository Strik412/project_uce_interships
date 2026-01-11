import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationTemplate, TemplateType } from '../domain/notification-template.entity';

@Injectable()
export class TemplateRepository {
  constructor(
    @InjectRepository(NotificationTemplate)
    private readonly repository: Repository<NotificationTemplate>,
  ) {}

  async create(template: Partial<NotificationTemplate>): Promise<NotificationTemplate> {
    const newTemplate = this.repository.create(template);
    return this.repository.save(newTemplate);
  }

  async findById(id: string): Promise<NotificationTemplate | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByName(name: string): Promise<NotificationTemplate | null> {
    return this.repository.findOne({ where: { name } });
  }

  async findByType(type: TemplateType): Promise<NotificationTemplate | null> {
    return this.repository.findOne({ where: { type, active: true } });
  }

  async findAll(): Promise<NotificationTemplate[]> {
    return this.repository.find({ order: { createdAt: 'DESC' } });
  }

  async findActive(): Promise<NotificationTemplate[]> {
    return this.repository.find({
      where: { active: true },
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, template: Partial<NotificationTemplate>): Promise<NotificationTemplate | null> {
    await this.repository.update(id, template);
    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
