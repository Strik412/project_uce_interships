import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentTemplate, TemplateType } from '../domain/document-template.entity';

@Injectable()
export class TemplateRepository {
  constructor(
    @InjectRepository(DocumentTemplate)
    private readonly repository: Repository<DocumentTemplate>,
  ) {}

  async create(template: Partial<DocumentTemplate>): Promise<DocumentTemplate> {
    const newTemplate = this.repository.create(template);
    return this.repository.save(newTemplate);
  }

  async findById(id: string): Promise<DocumentTemplate | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByName(name: string): Promise<DocumentTemplate | null> {
    return this.repository.findOne({ where: { name } });
  }

  async findByType(type: TemplateType): Promise<DocumentTemplate | null> {
    return this.repository.findOne({
      where: { type, active: true },
      order: { version: 'DESC' },
    });
  }

  async findAllByType(type: TemplateType): Promise<DocumentTemplate[]> {
    return this.repository.find({
      where: { type },
      order: { version: 'DESC' },
    });
  }

  async findActive(): Promise<DocumentTemplate[]> {
    return this.repository.find({
      where: { active: true },
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, template: Partial<DocumentTemplate>): Promise<DocumentTemplate | null> {
    await this.repository.update(id, template);
    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async findAll(): Promise<DocumentTemplate[]> {
    return this.repository.find({ order: { createdAt: 'DESC' } });
  }

  async deactivate(id: string): Promise<DocumentTemplate | null> {
    return this.update(id, { active: false });
  }

  async createNewVersion(
    existingId: string,
    updates: Partial<DocumentTemplate>,
  ): Promise<DocumentTemplate> {
    const existing = await this.findById(existingId);
    if (!existing) {
      throw new Error('Template not found');
    }

    return this.create({
      ...existing,
      ...updates,
      id: undefined,
      version: existing.version + 1,
    });
  }
}
