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

export enum HourLogStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Entity('hour_logs')
export class HourLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  placementId!: string;

  @Column({ type: 'uuid' })
  studentId!: string;

  @Column({ type: 'date' })
  date!: string;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  hours!: number;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'text', nullable: true })
  activities?: string;

  @Column({ type: 'text', nullable: true })
  evidenceUrl?: string;

  @Column({
    type: 'enum',
    enum: HourLogStatus,
    default: HourLogStatus.PENDING,
  })
  status!: HourLogStatus;

  @Column({ type: 'uuid', nullable: true })
  reviewedBy?: string;

  @Column({ type: 'timestamp', nullable: true })
  reviewedAt?: Date;

  @Column({ type: 'text', nullable: true })
  reviewerComments?: string;

  // Company supervisor approval fields
  @Column({ type: 'uuid', nullable: true })
  companyApprovedBy?: string;

  @Column({ type: 'timestamp', nullable: true })
  companyApprovedAt?: Date;

  @Column({ type: 'text', nullable: true })
  companyApprovalComments?: string;

  // Professor/Teacher approval fields (rename for clarity)
  @Column({ type: 'uuid', nullable: true })
  teacherApprovedBy?: string;

  @Column({ type: 'timestamp', nullable: true })
  teacherApprovedAt?: Date;

  @Column({ type: 'text', nullable: true })
  teacherApprovalComments?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(() => PlacementEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'placementId' })
  placement?: PlacementEntity;
}
