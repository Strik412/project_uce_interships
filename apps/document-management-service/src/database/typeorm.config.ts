import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Document } from '../app/documents/domain/document.entity';
import { DocumentTemplate } from '../app/documents/domain/document-template.entity';
import { Certificate } from '../app/certificates/certificate.entity';

export const getTypeOrmConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: configService.get('DB_HOST', 'localhost'),
  port: configService.get<number>('DB_PORT', 5432),
  username: configService.get('DB_USERNAME', 'practicas_user'),
  password: configService.get('DB_PASSWORD', 'practicas_password'),
  database: configService.get('DB_NAME', 'practicas_db'),
  entities: [Document, DocumentTemplate, Certificate],
  synchronize: false,
  dropSchema: false,
  logging: configService.get('NODE_ENV') !== 'production',
  ssl:
    configService.get('DB_SSL') === 'true'
      ? { rejectUnauthorized: false }
      : false,
  extra: {
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  },
});

