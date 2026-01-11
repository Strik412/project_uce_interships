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

@Entity('assignments')
export class AssignmentEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  practiceId!: string;

  @ManyToOne(() => PracticeEntity)
  @JoinColumn({ name: 'practiceId' })
  practice!: PracticeEntity;

  @Column({ type: 'varchar' })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'date', nullable: true })
  dueDate?: Date;

  @Column({ type: 'varchar', nullable: true })
  fileUrl?: string;

  @Column({ type: 'boolean', default: false })
  isCompleted!: boolean;

  @Column({ type: 'varchar', nullable: true })
  submissionUrl?: string;

  @Column({ type: 'varchar', nullable: true })
  feedback?: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;
}
