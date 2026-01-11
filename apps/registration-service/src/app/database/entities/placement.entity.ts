import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { PracticeEntity } from './practice.entity';
import { ApplicationEntity } from './application.entity';

export enum PlacementStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  TERMINATED = 'terminated',
  ON_HOLD = 'on_hold',
}

export enum AssignmentStatus {
  PENDING = 'pending',
  INVITED = 'invited',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
}

@Entity('placements')
export class PlacementEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // Student and offer link
  @Column({ type: 'uuid' })
  studentId!: string;

  @Column({ type: 'uuid' })
  practiceId!: string;

  @ManyToOne(() => PracticeEntity)
  @JoinColumn({ name: 'practiceId' })
  practice!: PracticeEntity;

  @Column({ type: 'uuid', nullable: true })
  applicationId?: string;

  @ManyToOne(() => ApplicationEntity, { nullable: true })
  @JoinColumn({ name: 'applicationId' })
  application?: ApplicationEntity;

  // Assignment: company supervisor + academic professor
  @Column({ type: 'uuid', nullable: true })
  companySupervisorId?: string;

  @Column({ type: 'uuid', nullable: true })
  professorId?: string;

  @Column({ type: 'enum', enum: AssignmentStatus, default: AssignmentStatus.PENDING })
  assignmentStatus!: AssignmentStatus;

  @Column({ type: 'timestamp', nullable: true })
  supervisorAssignedAt?: Date;

  @Column({ type: 'uuid', nullable: true })
  assignedBy?: string;

  // Dates & hours
  @Column({ type: 'date' })
  startDate!: Date;

  @Column({ type: 'date' })
  endDate!: Date;

  @Column({ type: 'int', default: 0 })
  expectedHours!: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  completedHours!: number;

  // Status
  @Column({ type: 'enum', enum: PlacementStatus, default: PlacementStatus.ACTIVE })
  status!: PlacementStatus;

  // Notes
  @Column({ type: 'text', nullable: true })
  coordinatorNotes?: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;
}
