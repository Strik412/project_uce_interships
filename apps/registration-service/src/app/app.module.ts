import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { DatabaseModule } from './database/database.module';
import { PracticesModule } from './practices/practices.module';
import { ApplicationsModule } from './registrations/registrations.module';
import { PlacementsModule } from './placements/placements.module';
import { HourLogsModule } from './hour-logs/hour-logs.module';
import { HealthController } from './health/health.controller';
import { SharedAuthModule, RolesGuard } from '@app/shared';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    SharedAuthModule,
    DatabaseModule,
    PracticesModule,
    ApplicationsModule,
    PlacementsModule,
    HourLogsModule,
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
