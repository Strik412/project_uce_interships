import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserRepository } from '../database/repositories/user.repository';
import { RefreshTokenRepository } from '../database/repositories/refresh-token.repository';
import { DatabaseModule } from '../database/database.module';
import { CacheModule, REDIS_CLIENT } from '../cache/cache.module';
import { CacheService } from '../cache/cache.service';
import { UserEntity } from '../database/entities/user.entity';
import { RefreshTokenEntity } from '../database/entities/refresh-token.entity';

@Module({
  imports: [
    ConfigModule.forRoot(),
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET', 'secret-key'),
        signOptions: { expiresIn: '1h' },
      }),
      inject: [ConfigService],
    }),
    DatabaseModule,
    CacheModule,
    TypeOrmModule.forFeature([UserEntity, RefreshTokenEntity]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    UserRepository,
    RefreshTokenRepository,
    CacheService,
  ],
  exports: [AuthService, JwtModule, DatabaseModule, CacheModule],
})
export class AuthModule {}
