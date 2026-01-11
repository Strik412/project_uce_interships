import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserRole } from '@shared/types';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'varchar' })
  firstName: string;

  @Column({ type: 'varchar' })
  lastName: string;

  @Column({ type: 'enum', enum: UserRole, array: true, default: [UserRole.STUDENT] })
  roles: UserRole[];

  @Column({ type: 'varchar', nullable: true })
  phoneNumber?: string;

  @Column({ type: 'varchar', nullable: true })
  altEmail?: string;

  @Column({ type: 'varchar', nullable: true })
  profileImage?: string;

  @Column({ type: 'varchar', nullable: true })
  organization?: string;

  @Column({ type: 'varchar', nullable: true })
  title?: string;

  @Column({ type: 'text', nullable: true })
  about?: string;

  // Student specific
  @Column({ type: 'varchar', nullable: true })
  faculty?: string;

  @Column({ type: 'varchar', nullable: true })
  career?: string;

  @Column({ type: 'varchar', nullable: true })
  semester?: string;

  // Professor specific
  @Column({ type: 'varchar', nullable: true })
  officeHours?: string;

  @Column({ type: 'varchar', nullable: true })
  officeLocation?: string;

  @Column({ type: 'text', nullable: true })
  officeNotes?: string;

  // Company specific
  @Column({ type: 'text', nullable: true })
  companyDescription?: string;

  @Column({ type: 'varchar', nullable: true })
  companyWebsite?: string;

  @Column({ type: 'varchar', nullable: true })
  companyContact?: string;

  // Auth compatibility (kept optional, not exposed in profile flows)
  @Column({ type: 'varchar', nullable: true, select: false })
  passwordHash?: string;

  @Column({ type: 'varchar', nullable: true })
  emailVerificationToken?: string | null;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  emailVerified: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastLogin?: Date;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
