/**
 * @file pagination.utils.ts
 * @description Utilidades para paginación
 */

import { PaginationParams, PaginatedResponse } from '@shared/types';

/**
 * Calcula parámetros de paginación
 */
export function calculatePagination(
  totalItems: number,
  page: number = 1,
  pageSize: number = 10,
): {
  skip: number;
  take: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
} {
  page = Math.max(1, page);
  pageSize = Math.max(1, Math.min(pageSize, 100)); // máximo 100 por página

  const totalPages = Math.ceil(totalItems / pageSize);
  const skip = (page - 1) * pageSize;
  const take = pageSize;

  return {
    skip,
    take,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}

/**
 * Crea una respuesta paginada
 */
export function createPaginatedResponse<T>(
  data: T[],
  totalItems: number,
  page: number = 1,
  pageSize: number = 10,
): PaginatedResponse<T> {
  const pagination = calculatePagination(totalItems, page, pageSize);

  return {
    data,
    pagination: {
      total: totalItems,
      page,
      pageSize,
      totalPages: pagination.totalPages,
      hasNextPage: pagination.hasNextPage,
      hasPreviousPage: pagination.hasPreviousPage,
    },
  };
}

/**
 * Pagina un array
 */
export function paginateArray<T>(arr: T[], page: number = 1, pageSize: number = 10): T[] {
  const pagination = calculatePagination(arr.length, page, pageSize);
  return arr.slice(pagination.skip, pagination.skip + pagination.take);
}
