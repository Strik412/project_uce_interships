import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { UserEntity } from './entities/user.entity';
import { RefreshTokenEntity } from './entities/refresh-token.entity';
import { PasswordResetTokenEntity } from './entities/password-reset-token.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'practicas_user'),
        password: configService.get('DB_PASSWORD', 'practicas_password'),
        database: configService.get('DB_NAME', 'practicas_db'),
        entities: [UserEntity, RefreshTokenEntity, PasswordResetTokenEntity],
        // Schema is managed via migrations only - never auto-sync
        synchronize: false,
        logging: configService.get('DB_LOGGING', false),
        dropSchema: false,
        ssl: configService.get('DB_SSL') === 'true' ? { rejectUnauthorized: false } : false,
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([UserEntity, RefreshTokenEntity, PasswordResetTokenEntity]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
