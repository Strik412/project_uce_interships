/**
 * @file string.utils.ts
 * @description Utilidades para manejo de strings
 */

/**
 * Convierte a mayúsculas (respeta caracteres especiales)
 */
export function toUpperCase(str: string): string {
  return str.toUpperCase();
}

/**
 * Convierte a minúsculas
 */
export function toLowerCase(str: string): string {
  return str.toLowerCase();
}

/**
 * Capitaliza la primera letra
 */
export function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Capitaliza cada palabra
 */
export function titleCase(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => capitalize(word))
    .join(' ');
}

/**
 * Genera un slug desde un string
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Trunca un string a una longitud máxima
 */
export function truncate(str: string, maxLength: number, suffix: string = '...'): string {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * Repite un string n veces
 */
export function repeat(str: string, times: number): string {
  return str.repeat(times);
}

/**
 * Invierte un string
 */
export function reverseString(str: string): string {
  return str.split('').reverse().join('');
}

/**
 * Remueve espacios en blanco al inicio y final
 */
export function trim(str: string): string {
  return str.trim();
}

/**
 * Remueve todos los espacios en blanco
 */
export function removeWhitespace(str: string): string {
  return str.replace(/\s/g, '');
}

/**
 * Reemplaza múltiples espacios con uno
 */
export function normalizeSpaces(str: string): string {
  return str.replace(/\s+/g, ' ').trim();
}

/**
 * Divide un string en chunks
 */
export function chunkString(str: string, size: number): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < str.length; i += size) {
    chunks.push(str.substring(i, i + size));
  }
  return chunks;
}

/**
 * Verifica si contiene substring
 */
export function includes(str: string, substring: string, caseInsensitive: boolean = false): boolean {
  if (caseInsensitive) {
    return str.toLowerCase().includes(substring.toLowerCase());
  }
  return str.includes(substring);
}

/**
 * Convierte a camelCase
 */
export function camelCase(str: string): string {
  return str
    .replace(/[-_\s]/g, ' ')
    .split(' ')
    .map((word, index) => (index === 0 ? word.toLowerCase() : capitalize(word)))
    .join('');
}

/**
 * Convierte a snake_case
 */
export function snakeCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[-\s]+/g, '_')
    .toLowerCase();
}

/**
 * Convierte a kebab-case
 */
export function kebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[-_\s]+/g, '-')
    .toLowerCase();
}
