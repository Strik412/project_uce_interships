/**
 * @file validation.utils.ts
 * @description Utilidades de validación
 */

/**
 * Valida si es un email válido
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valida si es una contraseña fuerte
 * Requisitos: mínimo 8 caracteres, mayúscula, minúscula, número, carácter especial
 */
export function isStrongPassword(password: string): boolean {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
}

/**
 * Valida si es un teléfono válido (formato internacional)
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s\-()]{7,}$/;
  return phoneRegex.test(phone);
}

/**
 * Valida si es una URL válida
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Valida si es un UUID válido
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Valida si es un número válido
 */
export function isValidNumber(value: any): boolean {
  return !isNaN(parseFloat(value)) && isFinite(value);
}

/**
 * Valida si un string no está vacío
 */
export function isNotEmpty(value: string | null | undefined): boolean {
  return value != null && value.trim().length > 0;
}

/**
 * Valida si un objeto tiene las propiedades requeridas
 */
export function hasRequiredFields<T>(obj: any, fields: (keyof T)[]): obj is T {
  return fields.every(field => field in obj && obj[field] != null);
}

/**
 * Valida rango de números
 */
export function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

/**
 * Valida si es un ISO date válido
 */
export function isValidISODate(dateString: string): boolean {
  try {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  } catch {
    return false;
  }
}

/**
 * Valida si cumple con patrón personalizado
 */
export function matchesPattern(value: string, pattern: RegExp): boolean {
  return pattern.test(value);
}
