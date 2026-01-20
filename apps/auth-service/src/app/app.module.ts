import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { CacheModule } from './cache/cache.module';
import { HealthController } from './health/health.controller';
import { RootHealthController } from './health/root-health.controller';
import { SharedAuthModule, RolesGuard } from '@app/shared';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    CacheModule,
    SharedAuthModule,
    AuthModule,
  ],
  controllers: [HealthController, RootHealthController],
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
