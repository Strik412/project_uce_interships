import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { PracticeEntity, ApplicationEntity, AssignmentEntity, PlacementEntity, HourLogEntity, UserEntity } from './entities';

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
        entities: [UserEntity, PracticeEntity, ApplicationEntity, AssignmentEntity, PlacementEntity, HourLogEntity],
        // Schema is managed via migrations only - never auto-sync
        synchronize: false,
        logging: configService.get('DB_LOGGING', false),
        dropSchema: false,
                ssl:{
         rejectUnauthorized: false,
        },
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([UserEntity, PracticeEntity, ApplicationEntity, AssignmentEntity, PlacementEntity, HourLogEntity]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
