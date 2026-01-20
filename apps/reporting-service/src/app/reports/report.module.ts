import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Report } from './domain/report.entity';
import { ReportRepository } from './infrastructure/report.repository';
import { ReportService } from './application/report.service';
import { ReportController } from './presentation/report.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Report])],
  controllers: [ReportController],
  providers: [ReportRepository, ReportService],
  exports: [ReportService, ReportRepository],
})
export class ReportModule {}
