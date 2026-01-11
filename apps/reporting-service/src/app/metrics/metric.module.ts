import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Metric } from './domain/metric.entity';
import { MetricRepository } from './infrastructure/metric.repository';
import { MetricService } from './application/metric.service';
import { MetricController } from './presentation/metric.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Metric])],
  controllers: [MetricController],
  providers: [MetricRepository, MetricService],
  exports: [MetricService, MetricRepository],
})
export class MetricModule {}
