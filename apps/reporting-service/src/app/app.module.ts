import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { SharedAuthModule, JwtAuthGuard, RolesGuard } from '@app/shared';
import { ReportModule } from './reports/report.module';
import { MetricModule } from './metrics/metric.module';
import { DashboardModule } from './dashboards/dashboard.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { HealthController } from './health/health.controller';
import { Report } from './reports/domain/report.entity';
import { Metric } from './metrics/domain/metric.entity';
import { Dashboard } from './dashboards/domain/dashboard.entity';
import { Analytics } from './analytics/domain/analytics.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        '.env',
        'apps/reporting-service/.env',
        '.env.local',
      ],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres' as const,
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USERNAME', 'practicas_user'),
        password: configService.get<string>('DB_PASSWORD', 'practicas_password'),
        database: configService.get<string>('DB_NAME', 'practicas_db'),
        entities: [Report, Metric, Dashboard, Analytics],
        synchronize: configService.get<string>('DB_SYNCHRONIZE', 'true') !== 'false',
        logging: configService.get<string>('DB_LOGGING', 'true') === 'true',
        ssl: configService.get<string>('DB_SSL', 'false') === 'true' ? { rejectUnauthorized: false } : false,
      }),
    }),
    SharedAuthModule,
    ReportModule,
    MetricModule,
    DashboardModule,
    AnalyticsModule,
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
