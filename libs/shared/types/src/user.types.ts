/**
 * @file user.types.ts
 * @description Tipos relacionados con usuarios y autenticación
 */

import { UserRole } from './enum.types';

/**
 * Interfaz para JWT payload
 */
export interface JwtPayload {
  sub: string; // userId
  email: string;
  iat: number;
  exp: number;
  roles: UserRole[];
}

/**
 * Interfaz para credenciales de login
 */
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * Interfaz para respuesta de autenticación
 */
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: UserProfile;
}

/**
 * Interfaz para perfil de usuario
 */
export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: UserRole[];
  profileImage?: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

/**
 * Interfaz para datos de registro
 */
export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  institutionId?: string;
}

/**
 * Interfaz para cambio de contraseña
 */
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Interfaz para reset de contraseña
 */
export interface PasswordResetRequest {
  email: string;
}

/**
 * Interfaz para confirmación de reset
 */
export interface PasswordResetConfirm {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Interfaz para actualización de perfil
 */
export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  profileImage?: string;
  phoneNumber?: string;
}

/**
 * Interfaz para 2FA setup
 */
export interface TwoFactorSetup {
  qrCode: string;
  secret: string;
  backupCodes: string[];
}

/**
 * Interfaz para verificación de 2FA
 */
export interface TwoFactorVerify {
  code: string;
  backupCode?: string;
}
