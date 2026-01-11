import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { PracticeEntity, ApplicationEntity, AssignmentEntity, PlacementEntity, HourLogEntity } from './entities';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 5432),
        username: configService.get('DB_USER', 'practicas_user'),
        password: configService.get('DB_PASSWORD', 'practicas_password'),
        database: configService.get('DB_NAME', 'practicas_db'),
        entities: [PracticeEntity, ApplicationEntity, AssignmentEntity, PlacementEntity, HourLogEntity],
        synchronize: configService.get('DB_SYNCHRONIZE') === 'true' || configService.get('NODE_ENV') !== 'production',
        logging: configService.get('DB_LOGGING', false),
        dropSchema: configService.get('NODE_ENV') !== 'production',
        ssl: configService.get('DB_SSL') === 'true' ? { rejectUnauthorized: false } : false,
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([PracticeEntity, ApplicationEntity, AssignmentEntity, PlacementEntity, HourLogEntity]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
