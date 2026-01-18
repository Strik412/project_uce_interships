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

  @Column({ type: 'varchar', name: 'firstName' })
  firstName: string;

  @Column({ type: 'varchar', name: 'lastName' })
  lastName: string;

  @Column({ type: 'varchar', name: 'passwordHash' })
  passwordHash: string;

  @Column({
  type: 'simple-array',
  default: UserRole.STUDENT,
  })
  roles: UserRole[];


  @Column({ type: 'boolean', name: 'isActive', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', name: 'emailVerified', default: false })
  emailVerified: boolean;

  @Column({ type: 'varchar', name: 'emailVerificationToken', nullable: true })
  emailVerificationToken: string | null;

  @Column({ type: 'timestamp', name: 'lastLogin', nullable: true })
  lastLogin: Date | null;

  @CreateDateColumn({ type: 'timestamp', name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updatedAt' })
  updatedAt: Date;

  @OneToMany('RefreshTokenEntity', (token: any) => token.user, { cascade: true })
  refreshTokens: RefreshTokenEntity[];

  @OneToMany('PasswordResetTokenEntity', (token: any) => token.user, { cascade: true })
  passwordResetTokens: PasswordResetTokenEntity[];
}
