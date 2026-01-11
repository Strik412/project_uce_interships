import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum MilestoneStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  OVERDUE = 'OVERDUE',
}

@Entity('milestones')
export class Milestone {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  assignmentId!: string;

  @Column('varchar')
  title!: string;

  @Column('text', { nullable: true })
  description?: string;

  @Column('date')
  dueDate!: Date;

  @Column({
    type: 'enum',
    enum: MilestoneStatus,
    default: MilestoneStatus.PENDING,
  })
  status: MilestoneStatus = MilestoneStatus.PENDING;

  @Column('integer', { default: 0 })
  progress: number = 0;

  @Column('text', { nullable: true })
  deliverable?: string;

  @Column('boolean', { default: false })
  isCompleted: boolean = false;

  @Column('timestamp', { nullable: true })
  completedAt?: Date;

  @Column('json', { nullable: true })
  attachments?: Record<string, any>;

  @Column('text', { nullable: true })
  feedback?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
