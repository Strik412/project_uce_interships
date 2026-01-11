import { Injectable, ConflictException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { hashPassword, comparePassword, generateRandomToken } from '@shared/utils';
import {
  AuthResponse,
  JwtPayload,
  LoginCredentials,
  UserProfile,
  NotFoundException,
  AuthenticationException,
  UserRole,
} from '@shared/types';
import { UserRepository } from '../database/repositories/user.repository';
import { RefreshTokenRepository } from '../database/repositories/refresh-token.repository';
import { CacheService } from '../cache/cache.service';
import { UserEntity } from '../database/entities/user.entity';

@Injectable()
export class AuthService {
  private readonly accessTokenTtl: number;
  private readonly refreshTokenTtl: number;

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private userRepository: UserRepository,
    private refreshTokenRepository: RefreshTokenRepository,
    private cacheService: CacheService,
  ) {
    this.accessTokenTtl = this.configService.get('JWT_EXPIRATION', 3600); // 1 hora
    this.refreshTokenTtl = this.configService.get('JWT_REFRESH_EXPIRATION', 2592000); // 30 días
  }

  /**
   * Registra un nuevo usuario
   */
  async register(email: string, password: string, firstName: string, lastName: string, role?: string): Promise<UserProfile> {
    // Verificar si el email ya existe
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await hashPassword(password);

    // Determinar el rol del usuario (validar si es un rol válido)
    let userRole = UserRole.STUDENT; // Default
    if (role) {
      const validRoles = Object.values(UserRole);
      if (validRoles.includes(role as UserRole)) {
        userRole = role as UserRole;
      }
    }

    // Guardar el usuario en PostgreSQL
    const user = await this.userRepository.create({
      email,
      firstName,
      lastName,
      passwordHash,
      roles: [userRole],
    });

    return this.mapUserToProfile(user);
  }

  /**
   * Login del usuario
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { email, password } = credentials;

    // Buscar usuario en PostgreSQL
    const user = await this.userRepository.findByEmail(email);
    if (!user || !user.isActive) {
      throw new AuthenticationException('Invalid credentials');
    }

    // Verificar contraseña
    const isPasswordValid = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new AuthenticationException('Invalid credentials');
    }

    // Actualizar último login
    await this.userRepository.updateLastLogin(user.id);

    // Generar tokens
    const accessToken = await this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user);

    // Guardar refresh token en PostgreSQL
    const refreshTokenExpiry = new Date(Date.now() + this.refreshTokenTtl * 1000);
    await this.refreshTokenRepository.create(user.id, refreshToken, refreshTokenExpiry);

    // Cache de sesión en Redis con TTL
    await this.cacheService.set(
      `session:${user.id}`,
      { accessToken, refreshToken, loginAt: new Date() },
      this.accessTokenTtl,
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: this.accessTokenTtl,
      user: this.mapUserToProfile(user),
    };
  }

  /**
   * Verifica y refresca el token de acceso
   */
  async refreshToken(refreshTokenValue: string): Promise<AuthResponse> {
    try {
      // Verificar que el token sea válido en PostgreSQL
      const isValid = await this.refreshTokenRepository.isTokenValid(refreshTokenValue);
      if (!isValid) {
        throw new AuthenticationException('Invalid or expired refresh token');
      }

      const payload = await this.jwtService.verifyAsync(refreshTokenValue, {
        secret: this.configService.get('JWT_REFRESH_SECRET', 'refresh-secret-key'),
      });

      // Buscar usuario en PostgreSQL
      const user = await this.userRepository.findById(payload.sub);
      if (!user || !user.isActive) {
        throw new NotFoundException('User', payload.sub);
      }

      // Generar nuevos tokens
      const newAccessToken = await this.generateAccessToken(user);
      const newRefreshToken = await this.generateRefreshToken(user);

      // Revocar token anterior y guardar el nuevo
      await this.refreshTokenRepository.revokeToken(refreshTokenValue);
      const refreshTokenExpiry = new Date(Date.now() + this.refreshTokenTtl * 1000);
      await this.refreshTokenRepository.create(user.id, newRefreshToken, refreshTokenExpiry);

      // Actualizar sesión en Redis
      await this.cacheService.set(
        `session:${user.id}`,
        { accessToken: newAccessToken, refreshToken: newRefreshToken, loginAt: new Date() },
        this.accessTokenTtl,
      );

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresIn: this.accessTokenTtl,
        user: this.mapUserToProfile(user),
      };
    } catch (error) {
      throw new AuthenticationException('Invalid or expired refresh token');
    }
  }

  /**
   * Valida un token de acceso y verifica si está en blacklist
   */
  async validateToken(token: string): Promise<JwtPayload> {
    try {
      // Verificar si el token está en la blacklist de Redis
      const isBlacklisted = await this.cacheService.exists(`blacklist:${token}`);
      if (isBlacklisted) {
        throw new AuthenticationException('Token has been revoked');
      }

      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('JWT_SECRET', 'secret-key'),
      });
      return payload;
    } catch (error) {
      throw new AuthenticationException('Invalid token');
    }
  }

  /**
   * Logout - revoca el token actual
   */
  async logout(userId: string, token: string): Promise<void> {
    // Agregar token a blacklist en Redis con TTL igual al tiempo de expiración del token
    await this.cacheService.set(`blacklist:${token}`, true, this.accessTokenTtl);

    // Revocar todos los refresh tokens
    await this.refreshTokenRepository.revokeAllUserTokens(userId);

    // Eliminar sesión del cache
    await this.cacheService.delete(`session:${userId}`);
  }

  /**
   * Genera un token de acceso
   */
  private async generateAccessToken(user: UserEntity): Promise<string> {
    const payload: Omit<JwtPayload, 'iat' | 'exp'> = {
      sub: user.id,
      email: user.email,
      roles: user.roles,
    };

    return this.jwtService.signAsync(payload, {
      secret: this.configService.get('JWT_SECRET', 'secret-key'),
      expiresIn: `${this.accessTokenTtl}s`,
    });
  }

  /**
   * Genera un token de refresco
   */
  private async generateRefreshToken(user: UserEntity): Promise<string> {
    const payload: Omit<JwtPayload, 'iat' | 'exp'> = {
      sub: user.id,
      email: user.email,
      roles: user.roles,
    };

    return this.jwtService.signAsync(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET', 'refresh-secret-key'),
      expiresIn: `${this.refreshTokenTtl}s`,
    });
  }

  /**
   * Mapea UserEntity a UserProfile
   */
  private mapUserToProfile(user: UserEntity): UserProfile {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roles: user.roles,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  /**
   * Genera un token de reseteo de contraseña
   */
  async generatePasswordResetToken(email: string): Promise<string> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      // Por seguridad, no revelar si el email existe o no
      throw new NotFoundException('User');
    }

    const resetToken = generateRandomToken(32);

    // Guardar token con expiración en Redis (válido por 1 hora)
    await this.cacheService.set(`reset-token:${resetToken}`, user.id, 3600);

    return resetToken;
  }

  /**
   * Valida y resetea la contraseña
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    // Buscar el token en Redis
    const userId = await this.cacheService.get<string>(`reset-token:${token}`);
    if (!userId) {
      throw new AuthenticationException('Invalid or expired reset token');
    }

    const newPasswordHash = await hashPassword(newPassword);

    // Actualizar contraseña en PostgreSQL
    await this.userRepository.updatePassword(userId, newPasswordHash);

    // Eliminar token de reset del cache
    await this.cacheService.delete(`reset-token:${token}`);

    // Revocar todos los refresh tokens existentes por seguridad
    await this.refreshTokenRepository.revokeAllUserTokens(userId);
  }
}
