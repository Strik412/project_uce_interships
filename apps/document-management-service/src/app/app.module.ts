import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { DocumentModule } from './documents/document.module';
import { TemplateModule } from './documents/template.module';
import { getTypeOrmConfig } from '../database/typeorm.config';
import { SharedAuthModule, JwtAuthGuard, RolesGuard } from '@app/shared';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env.document',
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => getTypeOrmConfig(configService),
    }),
    SharedAuthModule,
    DocumentModule,
    TemplateModule,
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
  ],
})
export class AppModule {}
