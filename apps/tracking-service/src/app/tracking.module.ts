import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProgressModule } from './progress/progress.module';
import { MilestoneModule } from './milestones/milestone.module';
import { ProgressReport } from './progress/domain/progress.entity';
import { Milestone } from './milestones/domain/milestone.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProgressReport, Milestone]),
    ProgressModule,
    MilestoneModule,
  ],
})
export class TrackingModule {}
