import { Module } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { ApplicationsController } from './applications.controller';
import { DatabaseModule } from '../database/database.module';
import { PlacementsModule } from '../placements/placements.module';

@Module({
  imports: [DatabaseModule, PlacementsModule],
  providers: [ApplicationsService],
  controllers: [ApplicationsController],
})
export class ApplicationsModule {}
