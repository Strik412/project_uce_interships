/**
 * @file practice.types.ts
 * @description Tipos relacionados con prácticas profesionales
 */

import { PracticeStatus, ValidationStatus } from './enum.types';

/**
 * Interfaz para prácticas profesionales
 */
export interface Practice {
  id: string;
  studentId: string;
  companyId: string;
  supervisorId?: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  status: PracticeStatus;
  hoursPerWeek: number;
  totalHours: number;
  credits: number;
  semester: string;
  academicYear: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interfaz para creación de práctica
 */
export interface CreatePracticeRequest {
  studentId: string;
  companyId: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  hoursPerWeek: number;
  totalHours: number;
  credits: number;
  semester: string;
  academicYear: string;
}

/**
 * Interfaz para actualización de práctica
 */
export interface UpdatePracticeRequest {
  title?: string;
  description?: string;
  endDate?: Date;
  hoursPerWeek?: number;
  status?: PracticeStatus;
}

/**
 * Interfaz para documento de práctica
 */
export interface PracticeDocument {
  id: string;
  practiceId: string;
  name: string;
  type: string; // PDF, DOC, etc
  url: string;
  uploadedBy: string;
  uploadedAt: Date;
  validationStatus: ValidationStatus;
  validatedBy?: string;
  validatedAt?: Date;
  comments?: string;
}

/**
 * Interfaz para evaluación de práctica
 */
export interface PracticeEvaluation {
  id: string;
  practiceId: string;
  evaluatorId: string;
  evaluationType: 'student' | 'supervisor' | 'company';
  rating: number; // 1-5
  comments: string;
  timestamp: Date;
}

/**
 * Interfaz para progreso de práctica
 */
export interface PracticeProgress {
  practiceId: string;
  hoursCompleted: number;
  percentage: number;
  lastUpdated: Date;
  milestones: {
    name: string;
    completed: boolean;
    completedDate?: Date;
  }[];
}

/**
 * Interfaz para reporte de práctica
 */
export interface PracticeReport {
  id: string;
  practiceId: string;
  reportType: 'weekly' | 'monthly' | 'final';
  period: {
    startDate: Date;
    endDate: Date;
  };
  activities: string[];
  hoursWorked: number;
  achievements: string[];
  challenges: string[];
  nextSteps: string[];
  submittedAt: Date;
  submittedBy: string;
}
