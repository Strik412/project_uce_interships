/**
 * @file enum.types.ts
 * @description Enumeraciones compartidas en toda la plataforma
 */

/**
 * Roles de usuario en el sistema
 */
export enum UserRole {
  ADMIN = 'admin',
  COORDINATOR = 'coordinator',
  SUPERVISOR = 'supervisor',
  STUDENT = 'student',
  COMPANY = 'company',
  PROFESSOR = 'professor',
}

/**
 * Estados de una práctica profesional
 */
export enum PracticeStatus {
  REGISTERED = 'registered',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

/**
 * Estados de validación de documentos
 */
export enum ValidationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  REVISION_REQUIRED = 'revision_required',
}

/**
 * Tipos de comunicación
 */
export enum CommunicationType {
  MESSAGE = 'message',
  NOTIFICATION = 'notification',
  ALERT = 'alert',
  REPORT = 'report',
}

/**
 * Canales de notificación
 */
export enum NotificationChannel {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
  IN_APP = 'in_app',
}

/**
 * Prioridades
 */
export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}
