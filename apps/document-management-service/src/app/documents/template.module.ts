import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentTemplate } from './domain/document-template.entity';
import { TemplateRepository } from './repositories/template.repository';
import { TemplateService } from './services/template.service';
import { TemplateController } from './controllers/template.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DocumentTemplate])],
  providers: [TemplateRepository, TemplateService],
  controllers: [TemplateController],
  exports: [TemplateService],
})
export class TemplateModule {}
