import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan } from 'typeorm';
import { RefreshTokenEntity } from '../entities/refresh-token.entity';
import { UserEntity } from '../entities/user.entity';

@Injectable()
export class RefreshTokenRepository {
  constructor(
    @InjectRepository(RefreshTokenEntity)
    private readonly repository: Repository<RefreshTokenEntity>,
  ) {}

  /**
   * Crear un nuevo refresh token
   */
  async create(
    user: UserEntity,
    token: string,
    expiresAt: Date,
  ): Promise<RefreshTokenEntity> {
    const refreshToken = this.repository.create({
      user,
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
      where: {
        token,
        isRevoked: false,
      },
      relations: ['user'],
    });
  }

  /**
   * Buscar tokens válidos de un usuario
   */
  async findValidTokensByUserId(userId: string): Promise<RefreshTokenEntity[]> {
    return this.repository.find({
      where: {
        user: { id: userId },
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
      {
        user: { id: userId },
        isRevoked: false,
      },
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
    return result.affected ?? 0;
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
