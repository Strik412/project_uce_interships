import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TemplateService } from '../services/template.service';
import { TemplateType } from '../domain/document-template.entity';
import { CreateTemplateDto, UpdateTemplateDto, TemplateResponseDto } from './dto/template.dto';

@Controller('templates')
@ApiTags('Templates')
export class TemplateController {
  constructor(private readonly templateService: TemplateService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new document template' })
  @ApiResponse({
    status: 201,
    description: 'Template created successfully',
    type: TemplateResponseDto,
  })
  async createTemplate(@Body() createTemplateDto: CreateTemplateDto) {
    const template = await this.templateService.createTemplate(
      createTemplateDto.name,
      createTemplateDto.type,
      createTemplateDto.content,
      createTemplateDto.htmlContent,
      createTemplateDto.variables,
    );
    return this.toResponseDto(template);
  }

  @Get()
  @ApiOperation({ summary: 'Get all document templates' })
  @ApiResponse({
    status: 200,
    description: 'List of all templates',
    type: [TemplateResponseDto],
  })
  async getAllTemplates() {
    const templates = await this.templateService.getAllTemplates();
    return templates.map((t: any) => this.toResponseDto(t));
  }

  @Get('active')
  @ApiOperation({ summary: 'Get active templates' })
  @ApiResponse({
    status: 200,
    description: 'List of active templates',
    type: [TemplateResponseDto],
  })
  async getActiveTemplates() {
    const templates = await this.templateService.getActiveTemplates();
    return templates.map((t: any) => this.toResponseDto(t));
  }

  @Get('by-type/:type')
  @ApiOperation({ summary: 'Get templates by type' })
  @ApiResponse({
    status: 200,
    description: 'List of templates of specified type',
    type: [TemplateResponseDto],
  })
  async getTemplatesByType(@Param('type') type: TemplateType) {
    const templates = await this.templateService.getAllTemplatesByType(type);
    return templates.map((t: any) => this.toResponseDto(t));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get template by ID' })
  @ApiResponse({
    status: 200,
    description: 'Template details',
    type: TemplateResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Template not found' })
  async getTemplateById(@Param('id') id: string) {
    const template = await this.templateService.getTemplateById(id);
    return this.toResponseDto(template);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a document template' })
  @ApiResponse({
    status: 200,
    description: 'Template updated successfully',
    type: TemplateResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Template not found' })
  async updateTemplate(
    @Param('id') id: string,
    @Body() updateTemplateDto: UpdateTemplateDto,
  ) {
    const template = await this.templateService.updateTemplate(id, updateTemplateDto);
    return this.toResponseDto(template);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a document template' })
  @ApiResponse({ status: 204, description: 'Template deleted successfully' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  async deleteTemplate(@Param('id') id: string) {
    await this.templateService.deleteTemplate(id);
  }

  private toResponseDto(template: any): TemplateResponseDto {
    return {
      id: template.id,
      name: template.name,
      type: template.type,
      content: template.content,
      htmlContent: template.htmlContent,
      variables: template.variables,
      active: template.active,
      version: template.version,
      createdAt: template.createdAt,
      updatedAt: template.updatedAt,
    };
  }
}
