import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum ProgressStatus {
  PENDING = 'PENDING',
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  REVISED = 'REVISED',
}

@Entity('progress_reports')
export class ProgressReport {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  assignmentId!: string;

  @Column('integer')
  weekNumber!: number;

  @Column('date')
  reportDate!: Date;

  @Column('integer')
  hoursWorked!: number;

  @Column('text')
  activitiesDescription!: string;

  @Column('text', { nullable: true })
  accomplishments?: string;

  @Column('text', { nullable: true })
  challenges?: string;

  @Column('text', { nullable: true })
  learnings?: string;

  @Column({
    type: 'enum',
    enum: ProgressStatus,
    default: ProgressStatus.PENDING,
  })
  status: ProgressStatus = ProgressStatus.PENDING;

  @Column('uuid', { nullable: true })
  reviewedBy?: string;

  @Column('text', { nullable: true })
  reviewComments?: string;

  @Column('timestamp', { nullable: true })
  reviewedAt?: Date;

  @Column('json', { nullable: true })
  attachments?: Record<string, any>;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
