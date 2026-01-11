import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationTemplate } from './domain/notification-template.entity';
import { TemplateRepository } from './repositories/template.repository';
import { TemplateService } from './services/template.service';
import { TemplateController } from './controllers/template.controller';

@Module({
  imports: [TypeOrmModule.forFeature([NotificationTemplate])],
  providers: [TemplateRepository, TemplateService],
  controllers: [TemplateController],
  exports: [TemplateService],
})
export class TemplateModule {}
