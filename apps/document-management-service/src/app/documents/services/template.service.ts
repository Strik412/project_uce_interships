import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { TemplateRepository } from '../repositories/template.repository';
import { DocumentTemplate, TemplateType } from '../domain/document-template.entity';

@Injectable()
export class TemplateService {
  constructor(private readonly templateRepository: TemplateRepository) {}

  async createTemplate(
    name: string,
    type: TemplateType,
    content: string,
    htmlContent?: string,
    variables?: string[],
  ): Promise<DocumentTemplate> {
    if (!name || !content) {
      throw new BadRequestException('Name and content are required');
    }

    return this.templateRepository.create({
      name,
      type,
      content,
      htmlContent,
      variables: variables || [],
    });
  }

  async getTemplateById(id: string): Promise<DocumentTemplate> {
    const template = await this.templateRepository.findById(id);
    if (!template) {
      throw new NotFoundException(`Template with ID ${id} not found`);
    }
    return template;
  }

  async getTemplateByName(name: string): Promise<DocumentTemplate> {
    const template = await this.templateRepository.findByName(name);
    if (!template) {
      throw new NotFoundException(`Template with name ${name} not found`);
    }
    return template;
  }

  async getTemplateByType(type: TemplateType): Promise<DocumentTemplate> {
    const template = await this.templateRepository.findByType(type);
    if (!template) {
      throw new NotFoundException(`Template for type ${type} not found`);
    }
    return template;
  }

  async getAllTemplatesByType(type: TemplateType): Promise<DocumentTemplate[]> {
    return this.templateRepository.findAllByType(type);
  }

  async getAllTemplates(): Promise<DocumentTemplate[]> {
    return this.templateRepository.findAll();
  }

  async getActiveTemplates(): Promise<DocumentTemplate[]> {
    return this.templateRepository.findActive();
  }

  async updateTemplate(
    id: string,
    updateData?: any,
  ): Promise<DocumentTemplate> {
    const updated = await this.templateRepository.update(id, {
      name: updateData?.name,
      content: updateData?.content,
      htmlContent: updateData?.htmlContent,
      variables: updateData?.variables,
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

  async deactivateTemplate(id: string): Promise<DocumentTemplate> {
    const updated = await this.templateRepository.deactivate(id);
    if (!updated) {
      throw new NotFoundException(`Template with ID ${id} not found`);
    }
    return updated;
  }

  async renderTemplate(template: DocumentTemplate, variables: Record<string, any>): Promise<string> {
    let content = template.content;
    if (template.variables && template.variables.length > 0) {
      template.variables.forEach((variable) => {
        const regex = new RegExp(`{{${variable}}}`, 'g');
        content = content.replace(regex, variables[variable] || '');
      });
    }
    return content;
  }

  async renderHtmlTemplate(template: DocumentTemplate, variables: Record<string, any>): Promise<string> {
    if (!template.htmlContent) {
      return this.renderTemplate(template, variables);
    }

    let content = template.htmlContent;
    if (template.variables && template.variables.length > 0) {
      template.variables.forEach((variable) => {
        const regex = new RegExp(`{{${variable}}}`, 'g');
        content = content.replace(regex, variables[variable] || '');
      });
    }
    return content;
  }

  async createNewVersion(existingId: string, updates: any): Promise<DocumentTemplate> {
    return this.templateRepository.createNewVersion(existingId, updates);
  }
}
