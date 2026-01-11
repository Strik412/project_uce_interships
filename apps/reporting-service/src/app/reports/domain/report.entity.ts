import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum ReportType {
  STUDENT_PROGRESS = 'student_progress',
  COMPANY_OVERVIEW = 'company_overview',
  SUPERVISOR_SUMMARY = 'supervisor_summary',
  PRACTICE_COMPLETION = 'practice_completion',
  PERFORMANCE_METRICS = 'performance_metrics',
  COMPLIANCE = 'compliance',
}

export enum ReportStatus {
  PENDING = 'pending',
  GENERATING = 'generating',
  READY = 'ready',
  FAILED = 'failed',
  EXPIRED = 'expired',
}

@Entity('reports')
@Index(['userId'])
@Index(['type'])
@Index(['status'])
@Index(['createdAt'])
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  userId!: string;

  @Column({ type: 'varchar', length: 20, default: ReportType.STUDENT_PROGRESS })
  type!: ReportType;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'varchar', length: 20, default: ReportStatus.PENDING })
  status!: ReportStatus;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'jsonb', nullable: true })
  filters?: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  data?: Record<string, any>;

  @Column({ type: 'varchar', length: 255, nullable: true })
  fileUrl?: string;

  @Column({ type: 'bigint', default: 0 })
  fileSize!: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  format?: string; // pdf, excel, json

  @Column({ type: 'integer', nullable: true })
  pageCount?: number;

  @Column({ type: 'text', nullable: true })
  errorMessage?: string;

  @Column({ type: 'timestamp', nullable: true })
  generatedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt?: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
