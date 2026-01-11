import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Analytics } from './domain/analytics.entity';
import { AnalyticsRepository } from './infrastructure/analytics.repository';
import { AnalyticsService } from './application/analytics.service';
import { AnalyticsController } from './presentation/analytics.controller';
import { MetricModule } from '../metrics/metric.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Analytics]),
    MetricModule,
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsRepository, AnalyticsService],
  exports: [AnalyticsService, AnalyticsRepository],
})
export class AnalyticsModule {}
