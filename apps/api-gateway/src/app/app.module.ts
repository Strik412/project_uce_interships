import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { GatewayModule } from './gateway/gateway.module';
import { SharedAuthModule, RolesGuard } from '@app/shared';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthContextInterceptor } from './interceptors/auth-context.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    SharedAuthModule,
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000, // 1 segundo
        limit: 3,
      },
      {
        name: 'medium',
        ttl: 10000, // 10 segundos
        limit: 20,
      },
      {
        name: 'long',
        ttl: 60000, // 1 minuto
        limit: 100,
      },
    ]),
    GatewayModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AuthContextInterceptor,
    },
  ],
})
export class AppModule {}
