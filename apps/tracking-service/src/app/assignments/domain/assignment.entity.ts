import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum AssignmentStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  PAUSED = 'PAUSED',
  CANCELLED = 'CANCELLED',
}

@Entity('practice_assignments')
export class PracticeAssignment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  practiceId!: string;

  @Column('uuid')
  studentId!: string;

  @Column('uuid')
  companyId!: string;

  @Column('uuid', { nullable: true })
  supervisorId?: string;

  @Column({
    type: 'enum',
    enum: AssignmentStatus,
    default: AssignmentStatus.PENDING,
  })
  status: AssignmentStatus = AssignmentStatus.PENDING;

  @Column('date')
  startDate!: Date;

  @Column('date')
  endDate!: Date;

  @Column('integer')
  totalHours!: number;

  @Column('integer', { default: 0 })
  completedHours: number = 0;

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  completionPercentage: number = 0;

  @Column('text', { nullable: true })
  description?: string;

  @Column('json', { nullable: true })
  requirements?: Record<string, any>;

  @Column('json', { nullable: true })
  schedule?: Record<string, any>;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column('timestamp', { nullable: true })
  lastActivityAt?: Date;
}
