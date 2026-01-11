import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssignmentModule } from './assignments/assignment.module';
import { ProgressModule } from './progress/progress.module';
import { MilestoneModule } from './milestones/milestone.module';
import { PracticeAssignment } from './assignments/domain/assignment.entity';
import { ProgressReport } from './progress/domain/progress.entity';
import { Milestone } from './milestones/domain/milestone.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PracticeAssignment, ProgressReport, Milestone]),
    AssignmentModule,
    ProgressModule,
    MilestoneModule,
  ],
})
export class TrackingModule {}
