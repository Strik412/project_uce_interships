import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Milestone } from './domain/milestone.entity';
import { MilestoneRepository } from './repositories/milestone.repository';
import { MilestoneService } from './services/milestone.service';
import { MilestoneController } from './controllers/milestone.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Milestone])],
  providers: [MilestoneRepository, MilestoneService],
  controllers: [MilestoneController],
  exports: [MilestoneService, MilestoneRepository],
})
export class MilestoneModule {}
