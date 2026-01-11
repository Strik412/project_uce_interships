import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dashboard } from './domain/dashboard.entity';
import { DashboardRepository } from './infrastructure/dashboard.repository';
import { DashboardService } from './application/dashboard.service';
import { DashboardController } from './presentation/dashboard.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Dashboard])],
  controllers: [DashboardController],
  providers: [DashboardRepository, DashboardService],
  exports: [DashboardService, DashboardRepository],
})
export class DashboardModule {}
