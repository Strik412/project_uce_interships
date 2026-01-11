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

@Entity('practices')
export class PracticeEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  userId!: string;

  @Column({ type: 'varchar', nullable: true })
  companyName?: string;

  @Column({ type: 'varchar', nullable: true })
  companyLocation?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'date', nullable: true })
  startDate?: Date;

  @Column({ type: 'date', nullable: true })
  endDate?: Date;

  @Column({ type: 'int', default: 0 })
  hoursCompleted!: number;

  @Column({ type: 'int', default: 0 })
  totalHours!: number;

  @Column({ type: 'enum', enum: PracticeStatus, default: PracticeStatus.REGISTERED })
  status!: PracticeStatus;

  @Column({ type: 'enum', enum: ValidationStatus, default: ValidationStatus.PENDING })
  validationStatus!: ValidationStatus;

  @Column({ type: 'varchar', nullable: true })
  supervisorId?: string;

  @Column({ type: 'varchar', nullable: true })
  coordinatorNotes?: string;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;
}
