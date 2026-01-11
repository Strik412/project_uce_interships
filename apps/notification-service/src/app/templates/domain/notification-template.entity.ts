import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum TemplateType {
  ASSIGNMENT_CREATED = 'assignment_created',
  PROGRESS_SUBMITTED = 'progress_submitted',
  PROGRESS_APPROVED = 'progress_approved',
  PROGRESS_REJECTED = 'progress_rejected',
  MILESTONE_OVERDUE = 'milestone_overdue',
  MESSAGE_RECEIVED = 'message_received',
  USER_REGISTERED = 'user_registered',
  PRACTICE_COMPLETED = 'practice_completed',
  CUSTOM = 'custom',
}

@Entity('notification_templates')
export class NotificationTemplate {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  name!: string;

  @Column({ type: 'varchar', length: 50 })
  type!: TemplateType;

  @Column({ type: 'varchar', length: 255 })
  subject!: string;

  @Column({ type: 'text' })
  content!: string;

  @Column({ type: 'text', nullable: true })
  htmlContent?: string;

  @Column({ type: 'jsonb', nullable: true })
  variables?: string[]; // {{userId}}, {{assignmentId}}, etc.

  @Column({ type: 'boolean', default: true })
  active!: boolean;

  @Column({ type: 'jsonb', nullable: true })
  defaultData?: Record<string, any>;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
