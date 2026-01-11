import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { GatewayController } from './gateway.controller';
import { GatewayService } from './gateway.service';
import { SharedAuthModule } from '@app/shared';
import { GatewayLoggingMiddleware } from '../middleware/gateway-logging.middleware';

@Module({
  imports: [
    HttpModule,
    ConfigModule,
    SharedAuthModule,
  ],
  controllers: [GatewayController],
  providers: [GatewayService],
  exports: [GatewayService],
})
export class GatewayModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(GatewayLoggingMiddleware).forRoutes('*');
  }
}
