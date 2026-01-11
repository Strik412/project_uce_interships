import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Document } from '../app/documents/domain/document.entity';
import { DocumentTemplate } from '../app/documents/domain/document-template.entity';

export const getTypeOrmConfig = (configService: ConfigService): TypeOrmModuleOptions => {
  return {
    type: 'postgres',
    host: configService.get<string>('DB_HOST', 'localhost'),
    port: configService.get<number>('DB_PORT', 5432),
    username: configService.get<string>('DB_USERNAME', 'practicas_user'),
    password: configService.get<string>('DB_PASSWORD', 'practicas_password'),
    database: configService.get<string>('DB_NAME', 'practicas_db'),
    entities: [Document, DocumentTemplate],
    synchronize: true,
    logging: configService.get<boolean>('DB_LOGGING', true),
    dropSchema: false,
  };
};
