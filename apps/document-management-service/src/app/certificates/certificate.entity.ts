import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum CertificateStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  REVOKED = 'revoked',
}

@Entity('certificates')
@Index(['placementId'])
@Index(['status'])
@Index(['createdAt'])
export class Certificate {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // Reference to placement in Registration Service
  @Column({ type: 'uuid' })
  placementId!: string;

  @Column({ type: 'uuid' })
  studentId!: string;

  @Column({ type: 'uuid' })
  professorId!: string;

  // Certificate details
  @Column({ type: 'varchar', length: 255, unique: true })
  certificateNumber!: string;

  @Column({ type: 'date' })
  issueDate!: Date;

  @Column({ type: 'text', nullable: true })
  description?: string;

  // Hours and practice information
  @Column({ type: 'decimal', precision: 6, scale: 2 })
  totalHours!: number;

  @Column({ type: 'varchar', length: 255 })
  practiceName!: string;

  @Column({ type: 'varchar', length: 255 })
  studentName!: string;

  @Column({ type: 'varchar', length: 255 })
  professorName!: string;

  @Column({ type: 'date' })
  startDate!: Date;

  @Column({ type: 'date' })
  endDate!: Date;

  // Generated PDF reference
  @Column({ type: 'varchar', length: 500 })
  pdfUrl!: string;

  // Approval workflow
  @Column({
    type: 'enum',
    enum: CertificateStatus,
    default: CertificateStatus.PENDING,
  })
  status!: CertificateStatus;

  @Column({ type: 'uuid', nullable: true })
  approvedBy?: string;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt?: Date;

  @Column({ type: 'text', nullable: true })
  approvalComments?: string;

  @Column({ type: 'uuid', nullable: true })
  rejectedBy?: string;

  @Column({ type: 'timestamp', nullable: true })
  rejectedAt?: Date;

  @Column({ type: 'text', nullable: true })
  rejectionReason?: string;

  // Template information
  @Column({ type: 'varchar', length: 100, nullable: true })
  templateVersion?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
