import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { UserRole } from '@shared/types';
import type { RefreshTokenEntity } from './refresh-token.entity';
import type { PasswordResetTokenEntity } from './password-reset-token.entity';

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

  @Column({ type: 'varchar' })
  passwordHash: string;

  @Column({ type: 'enum', enum: UserRole, array: true, default: [UserRole.STUDENT] })
  roles: UserRole[];

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  emailVerified: boolean;

  @Column({ type: 'varchar', nullable: true })
  emailVerificationToken: string | null;

  @Column({ type: 'timestamp', nullable: true })
  lastLogin: Date | null;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  // Relations
  @OneToMany('RefreshTokenEntity', (token: any) => token.user, { cascade: true })
  refreshTokens: RefreshTokenEntity[];

  @OneToMany('PasswordResetTokenEntity', (token: any) => token.user, { cascade: true })
  passwordResetTokens: PasswordResetTokenEntity[];
}
