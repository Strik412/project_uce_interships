import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Document } from './domain/document.entity';
import { DocumentRepository } from './repositories/document.repository';
import { DocumentService } from './services/document.service';
import { DocumentController } from './controllers/document.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Document])],
  providers: [DocumentRepository, DocumentService],
  controllers: [DocumentController],
  exports: [DocumentService],
})
export class DocumentModule {}
