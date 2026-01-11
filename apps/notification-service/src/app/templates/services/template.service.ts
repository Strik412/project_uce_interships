import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { TemplateRepository } from '../repositories/template.repository';
import { NotificationTemplate, TemplateType } from '../domain/notification-template.entity';

@Injectable()
export class TemplateService {
  constructor(private readonly templateRepository: TemplateRepository) {}

  async createTemplate(
    name: string,
    type: TemplateType,
    subject: string,
    content: string,
    htmlContent?: string,
    variables?: string[],
  ): Promise<NotificationTemplate> {
    if (!name || !subject || !content) {
      throw new BadRequestException('Name, subject, and content are required');
    }

    return this.templateRepository.create({
      name,
      type,
      subject,
      content,
      htmlContent,
      variables,
    });
  }

  async getTemplateById(id: string): Promise<NotificationTemplate> {
    const template = await this.templateRepository.findById(id);
    if (!template) {
      throw new NotFoundException(`Template with ID ${id} not found`);
    }
    return template;
  }

  async getTemplateByName(name: string): Promise<NotificationTemplate> {
    const template = await this.templateRepository.findByName(name);
    if (!template) {
      throw new NotFoundException(`Template with name ${name} not found`);
    }
    return template;
  }

  async getTemplateByType(type: TemplateType): Promise<NotificationTemplate> {
    const template = await this.templateRepository.findByType(type);
    if (!template) {
      throw new NotFoundException(`Template for type ${type} not found`);
    }
    return template;
  }

  async getAllTemplates(): Promise<NotificationTemplate[]> {
    return this.templateRepository.findAll();
  }

  async getActiveTemplates(): Promise<NotificationTemplate[]> {
    return this.templateRepository.findActive();
  }

  async updateTemplate(
    id: string,
    updateData?: any,
  ): Promise<NotificationTemplate> {
    const updated = await this.templateRepository.update(id, {
      name: updateData?.name,
      subject: updateData?.subject,
      content: updateData?.content,
      htmlContent: updateData?.htmlContent,
      active: updateData?.active,
    });

    if (!updated) {
      throw new NotFoundException(`Template with ID ${id} not found`);
    }

    return updated;
  }

  async deleteTemplate(id: string): Promise<void> {
    const success = await this.templateRepository.delete(id);
    if (!success) {
      throw new NotFoundException(`Template with ID ${id} not found`);
    }
  }

  async renderTemplate(template: NotificationTemplate, variables: Record<string, any>): Promise<string> {
    let content = template.content;
    if (template.variables) {
      template.variables.forEach((variable) => {
        const regex = new RegExp(`{{${variable}}}`, 'g');
        content = content.replace(regex, variables[variable] || '');
      });
    }
    return content;
  }
}
