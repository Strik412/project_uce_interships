/**
 * @file index.spec.ts
 * @description Tests para la librería de tipos compartidos
 */

import {
  UserRole,
  PracticeStatus,
  ValidationStatus,
  NotFoundException,
  AuthenticationException,
} from './index';

describe('@shared/types', () => {
  describe('Enumeraciones', () => {
    it('should export UserRole enum', () => {
      expect(UserRole.ADMIN).toBe('admin');
      expect(UserRole.STUDENT).toBe('student');
      expect(UserRole.SUPERVISOR).toBe('supervisor');
      expect(UserRole.COORDINATOR).toBe('coordinator');
      expect(UserRole.COMPANY).toBe('company');
    });

    it('should export PracticeStatus enum', () => {
      expect(PracticeStatus.ACTIVE).toBe('active');
      expect(PracticeStatus.COMPLETED).toBe('completed');
      expect(PracticeStatus.CANCELLED).toBe('cancelled');
    });

    it('should export ValidationStatus enum', () => {
      expect(ValidationStatus.PENDING).toBe('pending');
      expect(ValidationStatus.APPROVED).toBe('approved');
      expect(ValidationStatus.REJECTED).toBe('rejected');
    });
  });

  describe('Excepciones', () => {
    it('should create NotFoundException', () => {
      const error = new NotFoundException('Practice', '123');
      expect(error.statusCode).toBe(404);
      expect(error.code).toBe('NOT_FOUND');
      expect(error.message).toContain('Practice');
      expect(error.message).toContain('123');
    });

    it('should create AuthenticationException', () => {
      const error = new AuthenticationException('Invalid credentials');
      expect(error.statusCode).toBe(401);
      expect(error.code).toBe('AUTHENTICATION_ERROR');
      expect(error.message).toBe('Invalid credentials');
    });
  });
});
