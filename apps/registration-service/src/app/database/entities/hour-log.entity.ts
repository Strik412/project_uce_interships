import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { PlacementEntity } from './placement.entity';

export const HourLogStatus = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;

@Entity('hour_logs')
export class HourLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'placement_id' })
  placementId!: string;

  @Column({ type: 'uuid', name: 'student_id' })
  studentId!: string;

  @Column({ type: 'date' })
  date!: string;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  hours!: number;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'text', nullable: true })
  activities?: string;

  @Column({ type: 'varchar', nullable: true, name: 'evidence_url' })
  evidenceUrl?: string;

  @Column({
    type: 'varchar',
    length: 50,
    default: 'pending',
  })
  status!: string;

  @Column({ type: 'uuid', nullable: true, name: 'reviewed_by' })
  reviewedBy?: string;

  @Column({ type: 'timestamp', nullable: true, name: 'reviewed_at' })
  reviewedAt?: Date;

  @Column({ type: 'text', nullable: true, name: 'reviewer_comments' })
  reviewerComments?: string;

  // Company supervisor approval fields
  @Column({ type: 'uuid', nullable: true, name: 'company_approved_by' })
  companyApprovedBy?: string;

  @Column({ type: 'timestamp', nullable: true, name: 'company_approved_at' })
  companyApprovedAt?: Date;

  @Column({ type: 'text', nullable: true, name: 'company_approval_comments' })
  companyApprovalComments?: string;

  // Professor/Teacher approval fields (rename for clarity)
  @Column({ type: 'uuid', nullable: true, name: 'teacher_approved_by' })
  teacherApprovedBy?: string;

  @Column({ type: 'timestamp', nullable: true, name: 'teacher_approved_at' })
  teacherApprovedAt?: Date;

  @Column({ type: 'text', nullable: true, name: 'teacher_approval_comments' })
  teacherApprovalComments?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @ManyToOne(() => PlacementEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'placement_id' })
  placement?: PlacementEntity;
}
