import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlacementEntity } from '../database/entities/placement.entity';
import { PlacementsController } from './placements.controller';
import { PlacementsService } from './placements.service';
import { CertificateIntegrationService } from '../services/certificate-integration.service';

@Module({
  imports: [TypeOrmModule.forFeature([PlacementEntity])],
  controllers: [PlacementsController],
  providers: [PlacementsService, CertificateIntegrationService],
  exports: [PlacementsService],
})
export class PlacementsModule {}

