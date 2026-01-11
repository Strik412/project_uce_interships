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

@Entity('applications')
export class ApplicationEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  practiceId!: string;

  @ManyToOne(() => PracticeEntity)
  @JoinColumn({ name: 'practiceId' })
  practice!: PracticeEntity;

  @Column({ type: 'uuid' })
  userId!: string;

  @Column({ type: 'text', nullable: true })
  motivation?: string;

  @Column({ type: 'varchar', nullable: true })
  resume?: string;

  @Column({ type: 'varchar', default: 'pending' })
  status!: string;

  @Column({ type: 'varchar', nullable: true })
  rejectionReason?: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;
}
