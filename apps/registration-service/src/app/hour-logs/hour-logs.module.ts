import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HourLogEntity } from '../database/entities/hour-log.entity';
import { PlacementEntity } from '../database/entities/placement.entity';
import { HourLogsController } from './hour-logs.controller';
import { HourLogsService } from './hour-logs.service';

@Module({
  imports: [TypeOrmModule.forFeature([HourLogEntity, PlacementEntity])],
  controllers: [HourLogsController],
  providers: [HourLogsService],
  exports: [HourLogsService],
})
export class HourLogsModule {}
