import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum DocumentType {
  CONTRACT = 'contract',
  EVALUATION = 'evaluation',
  REPORT = 'report',
  CERTIFICATE = 'certificate',
  OTHER = 'other',
}

export enum DocumentStatus {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  ARCHIVED = 'archived',
}

export enum DocumentAccessLevel {
  PRIVATE = 'private',
  INTERNAL = 'internal',
  PUBLIC = 'public',
}

@Entity('documents')
@Index(['userId'])
@Index(['practiceId'])
@Index(['type'])
@Index(['status'])
@Index(['createdAt'])
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  userId!: string;

  @Column({ type: 'uuid', nullable: true })
  practiceId?: string;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 20, default: DocumentType.OTHER })
  type!: DocumentType;

  @Column({ type: 'varchar', length: 255 })
  fileUrl!: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  mimeType?: string;

  @Column({ type: 'bigint', default: 0 })
  fileSize!: number;

  @Column({ type: 'varchar', length: 20, default: DocumentStatus.DRAFT })
  status!: DocumentStatus;

  @Column({ type: 'varchar', length: 20, default: DocumentAccessLevel.PRIVATE })
  accessLevel!: DocumentAccessLevel;

  @Column({ type: 'uuid', nullable: true })
  uploadedBy?: string;

  @Column({ type: 'uuid', array: true, default: () => 'ARRAY[]::uuid[]' })
  sharedWith!: string[];

  @Column({ type: 'integer', default: 1 })
  version!: number;

  @Column({ type: 'uuid', nullable: true })
  parentDocumentId?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt?: Date;

  @Column({ type: 'uuid', nullable: true })
  approvedBy?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  rejectionReason?: string;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt?: Date;

  @Column({ type: 'boolean', default: false })
  isTemplate!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
