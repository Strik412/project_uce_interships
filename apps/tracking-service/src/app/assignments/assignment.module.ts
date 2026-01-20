import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PracticeAssignment } from './domain/assignment.entity';
import { AssignmentRepository } from './repositories/assignment.repository';
import { AssignmentService } from './services/assignment.service';
import { AssignmentController } from './controllers/assignment.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PracticeAssignment])],
  providers: [AssignmentRepository, AssignmentService],
  controllers: [AssignmentController],
  exports: [AssignmentService, AssignmentRepository],
})
export class AssignmentModule {}
