import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum TrendDirection {
  UP = 'up',
  DOWN = 'down',
  STABLE = 'stable',
}

@Entity('analytics')
@Index(['userId'])
@Index(['practiceId'])
@Index(['period'])
@Index(['createdAt'])
export class Analytics {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', nullable: true })
  userId?: string;

  @Column({ type: 'uuid', nullable: true })
  practiceId?: string;

  @Column({ type: 'uuid', nullable: true })
  companyId?: string;

  @Column({ type: 'varchar', length: 50 })
  period!: string; // weekly, monthly, quarterly

  @Column({ type: 'date' })
  startDate!: Date;

  @Column({ type: 'date' })
  endDate!: Date;

  @Column({ type: 'jsonb' })
  summary!: any;

  @Column({ type: 'jsonb' })
  trends!: any;

  @Column({ type: 'jsonb', nullable: true })
  comparisons?: any;

  @Column({ type: 'jsonb', nullable: true })
  recommendations?: any;

  @Column({ type: 'jsonb', nullable: true })
  warnings?: any;

  @Column({ type: 'boolean', default: false })
  hasAnomalies!: boolean;

  @Column({ type: 'integer', default: 0 })
  anomalyCount!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
