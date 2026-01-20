import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { UserEntity } from './entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'postgres'),
        port: configService.get<number>('DB_PORT', 5432),

        // ✅ MISMAS credenciales que docker-compose
        username: configService.get('DB_USERNAME', 'practicas_user'),
        password: configService.get('DB_PASSWORD', 'practicas_password'),
        database: configService.get('DB_NAME', 'practicas_db'),

        // ✅ SOLO sus entidades
        entities: [UserEntity],

        // 🔒 BLOQUEO TOTAL
        synchronize: false,
        dropSchema: false,

        logging: false,
        ssl:
          configService.get('DB_SSL') === 'true'
            ? { rejectUnauthorized: false }
            : false,
      }),
    }),
    TypeOrmModule.forFeature([UserEntity]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
