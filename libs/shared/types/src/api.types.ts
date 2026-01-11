/**
 * @file api.types.ts
 * @description Tipos para respuestas y errores de API
 */

/**
 * Respuesta genérica de API
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
  timestamp: Date;
}

/**
 * Error de API
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  stack?: string;
}

/**
 * Respuesta paginada
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

/**
 * Parámetros de paginación
 */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Excepciones HTTP
 */
export class HttpException extends Error {
  constructor(
    public statusCode: number,
    override message: string,
    public code: string = 'HTTP_ERROR',
    public details?: Record<string, any>,
  ) {
    super(message);
    this.name = 'HttpException';
  }
}

/**
 * Excepciones de validación
 */
export class ValidationException extends HttpException {
  constructor(message: string, details?: Record<string, any>) {
    super(400, message, 'VALIDATION_ERROR', details);
    this.name = 'ValidationException';
  }
}

/**
 * Excepciones de autenticación
 */
export class AuthenticationException extends HttpException {
  constructor(message: string = 'Unauthorized') {
    super(401, message, 'AUTHENTICATION_ERROR');
    this.name = 'AuthenticationException';
  }
}

/**
 * Excepciones de autorización
 */
export class AuthorizationException extends HttpException {
  constructor(message: string = 'Forbidden') {
    super(403, message, 'AUTHORIZATION_ERROR');
    this.name = 'AuthorizationException';
  }
}

/**
 * Excepciones de recurso no encontrado
 */
export class NotFoundException extends HttpException {
  constructor(resource: string, id?: string) {
    const message = id ? `${resource} with id ${id} not found` : `${resource} not found`;
    super(404, message, 'NOT_FOUND');
    this.name = 'NotFoundException';
  }
}

/**
 * Excepciones de conflicto
 */
export class ConflictException extends HttpException {
  constructor(message: string) {
    super(409, message, 'CONFLICT');
    this.name = 'ConflictException';
  }
}

/**
 * Excepciones del servidor
 */
export class InternalServerException extends HttpException {
  constructor(message: string = 'Internal Server Error') {
    super(500, message, 'INTERNAL_SERVER_ERROR');
    this.name = 'InternalServerException';
  }
}
