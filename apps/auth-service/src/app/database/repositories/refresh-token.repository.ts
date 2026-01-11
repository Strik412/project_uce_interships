import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { RefreshTokenEntity } from '../entities/refresh-token.entity';

@Injectable()
export class RefreshTokenRepository {
  constructor(
    @InjectRepository(RefreshTokenEntity)
    private repository: Repository<RefreshTokenEntity>,
  ) {}

  /**
   * Crear un nuevo refresh token
   */
  async create(userId: string, token: string, expiresAt: Date): Promise<RefreshTokenEntity> {
    const refreshToken = this.repository.create({
      userId,
      token,
      expiresAt,
      isRevoked: false,
    });
    return this.repository.save(refreshToken);
  }

  /**
   * Buscar token por valor
   */
  async findByToken(token: string): Promise<RefreshTokenEntity | null> {
    return this.repository.findOne({
      where: { token, isRevoked: false },
      relations: ['user'],
    });
  }

  /**
   * Buscar tokens válidos de un usuario
   */
  async findValidTokensByUserId(userId: string): Promise<RefreshTokenEntity[]> {
    return this.repository.find({
      where: {
        userId,
        isRevoked: false,
        expiresAt: MoreThan(new Date()),
      },
    });
  }

  /**
   * Revocar un token específico
   */
  async revokeToken(token: string): Promise<void> {
    await this.repository.update(
      { token },
      { isRevoked: true },
    );
  }

  /**
   * Revocar todos los tokens de un usuario
   */
  async revokeAllUserTokens(userId: string): Promise<void> {
    await this.repository.update(
      { userId, isRevoked: false },
      { isRevoked: true },
    );
  }

  /**
   * Limpiar tokens expirados
   */
  async deleteExpiredTokens(): Promise<number> {
    const result = await this.repository.delete({
      expiresAt: LessThan(new Date()),
    });
    return result.affected || 0;
  }

  /**
   * Verificar si un token existe y es válido
   */
  async isTokenValid(token: string): Promise<boolean> {
    const refreshToken = await this.repository.findOne({
      where: {
        token,
        isRevoked: false,
        expiresAt: MoreThan(new Date()),
      },
    });
    return !!refreshToken;
  }
}

import { MoreThan } from 'typeorm';
