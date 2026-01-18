import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { PracticeAssignment } from '../assignments/domain/assignment.entity';
import { ProgressReport } from '../progress/domain/progress.entity';
import { Milestone } from '../milestones/domain/milestone.entity';

export const trackingDatabaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'practicas_user',
  password: process.env.DB_PASSWORD || 'practicas_password',
  database: process.env.DB_NAME || 'practicas_db',
  entities: [PracticeAssignment, ProgressReport, Milestone],
  synchronize: false,
  logging: process.env.NODE_ENV !== 'production',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  extra: {
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  },
  cache: false,
};

