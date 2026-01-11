import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProgressReport } from './domain/progress.entity';
import { ProgressRepository } from './repositories/progress.repository';
import { ProgressService } from './services/progress.service';
import { ProgressController } from './controllers/progress.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ProgressReport])],
  providers: [ProgressRepository, ProgressService],
  controllers: [ProgressController],
  exports: [ProgressService, ProgressRepository],
})
export class ProgressModule {}
