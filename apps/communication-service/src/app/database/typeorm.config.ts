import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Message } from '../messages/domain/message.entity';
import { Conversation } from '../conversations/domain/conversation.entity';

export const communicationDatabaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'practicas_user',
  password: process.env.DB_PASSWORD || 'practicas_password',
  database: process.env.DB_NAME || 'practicas_db',
  entities: [Message, Conversation],
  // Schema is managed via migrations only - never auto-sync
  synchronize: false,
  logging: process.env.NODE_ENV !== 'production',
    ssl: {
    rejectUnauthorized: false,
  },
  extra: {
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  },
  cache: false,
};
