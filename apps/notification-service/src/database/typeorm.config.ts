import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Notification } from '../app/notifications/domain/notification.entity';
import { NotificationTemplate } from '../app/templates/domain/notification-template.entity';

export const getTypeOrmConfig = (configService: ConfigService): TypeOrmModuleOptions => {
  return {
    type: 'postgres',
    host: configService.get<string>('DB_HOST', 'localhost'),
    port: configService.get<number>('DB_PORT', 5432),
    username: configService.get<string>('DB_USERNAME', 'practicas_user'),
    password: configService.get<string>('DB_PASSWORD', 'practicas_password'),
    database: configService.get<string>('DB_NAME', 'practicas_db'),
    entities: [Notification, NotificationTemplate],
    synchronize: true,
    logging: configService.get<boolean>('DB_LOGGING', true),
    dropSchema: false,
  };
};
