import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum DashboardType {
  STUDENT = 'student',
  COMPANY = 'company',
  SUPERVISOR = 'supervisor',
  ADMIN = 'admin',
}

export interface DashboardWidget {
  id: string;
  type: string; // chart, metric, table, timeline
  title: string;
  metricType?: string;
  chartType?: string; // line, bar, pie, area
  order: number;
  size?: string; // small, medium, large
  refreshInterval?: number; // minutes
  filters?: Record<string, any>;
}

@Entity('dashboards')
@Index(['userId'])
@Index(['type'])
@Index(['createdAt'])
export class Dashboard {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  userId!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 20 })
  type!: DashboardType;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'jsonb', default: () => '\'[]\'::jsonb' })
  widgets!: any;

  @Column({ type: 'boolean', default: false })
  isDefault!: boolean;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ type: 'integer', default: 15 })
  refreshInterval!: number; // minutes

  @Column({ type: 'varchar', length: 50, nullable: true })
  theme?: string; // dark, light

  @Column({ type: 'jsonb', nullable: true })
  displaySettings?: Record<string, any>;

  @Column({ type: 'timestamp', nullable: true })
  lastViewedAt?: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
