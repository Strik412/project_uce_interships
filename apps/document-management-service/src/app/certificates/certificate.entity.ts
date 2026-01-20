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
  @Column({ type: 'uuid', name: 'placement_id' })
  placementId!: string;

  @Column({ type: 'uuid', name: 'student_id' })
  studentId!: string;

  @Column({ type: 'uuid', nullable: true, name: 'professor_id' })
  professorId?: string;

  // Certificate details
  @Column({ type: 'varchar', length: 255, unique: true, name: 'certificate_number' })
  certificateNumber!: string;

  @Column({ type: 'date', name: 'issue_date' })
  issueDate!: Date;

  @Column({ type: 'text', nullable: true })
  description?: string;

  // Hours and practice information
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'total_hours' })
  totalHours?: number;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'practice_name' })
  practiceName?: string;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'student_name' })
  studentName?: string;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'professor_name' })
  professorName?: string;

  @Column({ type: 'date', nullable: true, name: 'start_date' })
  startDate?: Date;

  @Column({ type: 'date', nullable: true, name: 'end_date' })
  endDate?: Date;

  // Generated PDF reference
  @Column({ type: 'varchar', length: 500, nullable: true, name: 'pdf_url' })
  pdfUrl?: string;

  // Approval workflow
  @Column({
    type: 'enum',
    enum: CertificateStatus,
    default: CertificateStatus.PENDING,
  })
  status!: CertificateStatus;

  @Column({ type: 'uuid', nullable: true, name: 'approved_by' })
  approvedBy?: string;

  @Column({ type: 'timestamp', nullable: true, name: 'approved_at' })
  approvedAt?: Date;

  @Column({ type: 'text', nullable: true, name: 'approval_comments' })
  approvalComments?: string;

  @Column({ type: 'uuid', nullable: true, name: 'rejected_by' })
  rejectedBy?: string;

  @Column({ type: 'timestamp', nullable: true, name: 'rejected_at' })
  rejectedAt?: Date;

  @Column({ type: 'text', nullable: true, name: 'rejection_reason' })
  rejectionReason?: string;

  // Template information
  @Column({ type: 'integer', nullable: true, name: 'template_version', default: 1 })
  templateVersion?: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
