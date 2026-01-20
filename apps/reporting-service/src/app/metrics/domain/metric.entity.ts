import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum MetricType {
  COMPLETION_RATE = 'completion_rate',
  ENGAGEMENT_LEVEL = 'engagement_level',
  PROGRESS_PERCENTAGE = 'progress_percentage',
  DOCUMENT_COUNT = 'document_count',
  MESSAGE_COUNT = 'message_count',
  RESPONSE_TIME = 'response_time_hours',
  TASK_COMPLETION = 'task_completion',
  ATTENDANCE_RATE = 'attendance_rate',
}

export enum MetricScope {
  STUDENT = 'student',
  COMPANY = 'company',
  PRACTICE = 'practice',
  SUPERVISOR = 'supervisor',
}

@Entity('metrics')
@Index(['userId'])
@Index(['practiceId'])
@Index(['type'])
@Index(['date'])
@Index(['createdAt'])
export class Metric {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', nullable: true })
  userId?: string;

  @Column({ type: 'uuid', nullable: true })
  practiceId?: string;

  @Column({ type: 'uuid', nullable: true })
  companyId?: string;

  @Column({ type: 'varchar', length: 30 })
  type!: MetricType;

  @Column({ type: 'varchar', length: 20 })
  scope!: MetricScope;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  value!: number;

  @Column({ type: 'varchar', length: 20, nullable: true })
  unit?: string; // %, hours, count, etc.

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @Column({ type: 'date' })
  date!: Date;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'boolean', default: false })
  isAnomalous!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
