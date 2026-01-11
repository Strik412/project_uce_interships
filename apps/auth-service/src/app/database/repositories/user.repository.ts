import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../entities/user.entity';
import { UserRole } from '@shared/types';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private repository: Repository<UserEntity>,
  ) {}

  /**
   * Crear un nuevo usuario
   */
  async create(userData: {
    email: string;
    firstName: string;
    lastName: string;
    passwordHash: string;
    roles?: UserRole[];
  }): Promise<UserEntity> {
    const user = this.repository.create({
      ...userData,
      roles: userData.roles || [UserRole.STUDENT],
      isActive: true,
      emailVerified: false,
    });
    return this.repository.save(user);
  }

  /**
   * Buscar usuario por email
   */
  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.repository.findOne({
      where: { email },
    });
  }

  /**
   * Buscar usuario por ID
   */
  async findById(id: string): Promise<UserEntity | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['refreshTokens', 'passwordResetTokens'],
    });
  }

  /**
   * Actualizar usuario
   */
  async update(
    id: string,
    userData: Partial<{
      firstName: string;
      lastName: string;
      isActive: boolean;
      emailVerified: boolean;
      lastLogin: Date;
    }>,
  ): Promise<UserEntity | null> {
    await this.repository.update(id, userData);
    return this.findById(id);
  }

  /**
   * Cambiar contraseña
   */
  async updatePassword(id: string, passwordHash: string): Promise<void> {
    await this.repository.update(id, { passwordHash });
  }

  /**
   * Actualizar token de verificación de email
   */
  async updateEmailVerificationToken(id: string, token: string | null): Promise<void> {
    await this.repository.update(id, { emailVerificationToken: token });
  }

  /**
   * Marcar email como verificado
   */
  async verifyEmail(id: string): Promise<void> {
    await this.repository.update(id, {
      emailVerified: true,
      emailVerificationToken: null,
    });
  }

  /**
   * Obtener todos los usuarios
   */
  async findAll(limit = 50, offset = 0): Promise<[UserEntity[], number]> {
    return this.repository.findAndCount({
      skip: offset,
      take: limit,
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Eliminar usuario
   */
  async delete(id: string): Promise<void> {
    await this.repository.softDelete(id);
  }

  /**
   * Actualizar último login
   */
  async updateLastLogin(id: string): Promise<void> {
    await this.repository.update(id, { lastLogin: new Date() });
  }

  /**
   * Verificar si email existe
   */
  async emailExists(email: string): Promise<boolean> {
    const count = await this.repository.countBy({ email });
    return count > 0;
  }
}
