import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { PracticeStatus, ValidationStatus } from '@shared/types';
import { UserEntity } from './user.entity';

@Entity('practices')
export class PracticeEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => UserEntity, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;

  @Column({ type: 'varchar', nullable: true, name: 'company_name' })
  companyName?: string;

  @Column({ type: 'varchar', nullable: true, name: 'company_location' })
  companyLocation?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'date', nullable: true, name: 'start_date' })
  startDate?: Date;

  @Column({ type: 'date', nullable: true, name: 'end_date' })
  endDate?: Date;

  @Column({ type: 'int', default: 0, name: 'hours_completed' })
  hoursCompleted!: number;

  @Column({ type: 'int', default: 0, name: 'total_hours' })
  totalHours!: number;

  @Column({ type: 'varchar', length: 50, default: 'registered' })
  status!: string;

  @Column({ type: 'varchar', length: 50, default: 'pending', name: 'validation_status' })
  validationStatus!: string;

  @Column({ type: 'uuid', nullable: true, name: 'supervisor_id' })
  supervisorId?: string;

  @Column({ type: 'varchar', nullable: true, name: 'coordinator_notes' })
  coordinatorNotes?: string;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
