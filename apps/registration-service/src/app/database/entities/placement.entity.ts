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
import { UserEntity } from './user.entity';

export const PlacementStatus = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  TERMINATED: 'terminated',
  ON_HOLD: 'on_hold',
} as const;

export const AssignmentStatus = {
  PENDING: 'pending',
  INVITED: 'invited',
  ACCEPTED: 'accepted',
  DECLINED: 'declined',
} as const;

@Entity('placements')
export class PlacementEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => UserEntity, { nullable: false })
  @JoinColumn({ name: 'student_id' })
  student!: UserEntity;

  @ManyToOne(() => PracticeEntity, { nullable: false })
  @JoinColumn({ name: 'practice_id' })
  practice!: PracticeEntity;

  @ManyToOne(() => ApplicationEntity, { nullable: true })
  @JoinColumn({ name: 'application_id' })
  application?: ApplicationEntity;

  @Column({ type: 'uuid', nullable: true, name: 'company_supervisor_id' })
  companySupervisorId?: string;

  @Column({ type: 'uuid', nullable: true, name: 'professor_id' })
  professorId?: string;

  @Column({ type: 'varchar', length: 50, default: 'pending', name: 'assignment_status' })
  assignmentStatus!: string;

  @Column({ type: 'timestamp', nullable: true, name: 'supervisor_assigned_at' })
  supervisorAssignedAt?: Date;

  @Column({ type: 'uuid', nullable: true, name: 'assigned_by' })
  assignedBy?: string;

  @Column({ type: 'date', name: 'start_date' })
  startDate!: Date;

  @Column({ type: 'date', name: 'end_date' })
  endDate!: Date;

  @Column({ type: 'int', default: 0, name: 'expected_hours' })
  expectedHours!: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0, name: 'completed_hours' })
  completedHours!: number;

  @Column({ type: 'varchar', length: 50, default: 'active' })
  status!: string;

  @Column({ type: 'text', nullable: true, name: 'coordinator_notes' })
  coordinatorNotes?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
