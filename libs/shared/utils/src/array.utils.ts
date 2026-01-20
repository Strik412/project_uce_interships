/**
 * @file array.utils.ts
 * @description Utilidades para manejo de arrays
 */

/**
 * Verifica si es un array
 */
export function isArray(value: any): value is any[] {
  return Array.isArray(value);
}

/**
 * Obtiene el primer elemento
 */
export function first<T>(arr: T[]): T | undefined {
  return arr[0];
}

/**
 * Obtiene el último elemento
 */
export function last<T>(arr: T[]): T | undefined {
  return arr[arr.length - 1];
}

/**
 * Obtiene elementos únicos
 */
export function unique<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}

/**
 * Filtra elementos duplicados por una propiedad
 */
export function uniqueBy<T>(arr: T[], key: (item: T) => any): T[] {
  const seen = new Set();
  return arr.filter(item => {
    const k = key(item);
    if (seen.has(k)) {
      return false;
    }
    seen.add(k);
    return true;
  });
}

/**
 * Flatten un array anidado
 */
export function flattenArray<T>(arr: any[]): T[] {
  return arr.reduce((flat, item) => {
    return flat.concat(Array.isArray(item) ? flattenArray(item) : item);
  }, []);
}

/**
 * Divide un array en chunks
 */
export function chunk<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

/**
 * Barajea un array (Fisher-Yates)
 */
export function shuffle<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Invierte un array
 */
export function reverse<T>(arr: T[]): T[] {
  return [...arr].reverse();
}

/**
 * Obtiene elementos en común entre arrays
 */
export function intersection<T>(arr1: T[], arr2: T[]): T[] {
  return arr1.filter(item => arr2.includes(item));
}

/**
 * Obtiene diferencia entre arrays
 */
export function difference<T>(arr1: T[], arr2: T[]): T[] {
  return arr1.filter(item => !arr2.includes(item));
}

/**
 * Agrupa elementos por una propiedad
 */
export function groupBy<T>(arr: T[], key: (item: T) => string | number): Record<string, T[]> {
  return arr.reduce((grouped, item) => {
    const k = key(item).toString();
    if (!grouped[k]) {
      grouped[k] = [];
    }
    grouped[k].push(item);
    return grouped;
  }, {} as Record<string, T[]>);
}

/**
 * Ordena un array de objetos por una propiedad
 */
export function sortBy<T>(arr: T[], key: (item: T) => any, descending: boolean = false): T[] {
  const sorted = [...arr];
  sorted.sort((a, b) => {
    const aVal = key(a);
    const bVal = key(b);

    if (aVal < bVal) return descending ? 1 : -1;
    if (aVal > bVal) return descending ? -1 : 1;
    return 0;
  });

  return sorted;
}

/**
 * Busca un elemento en un array
 */
export function find<T>(arr: T[], predicate: (item: T) => boolean): T | undefined {
  return arr.find(predicate);
}

/**
 * Verifica si algún elemento cumple la condición
 */
export function some<T>(arr: T[], predicate: (item: T) => boolean): boolean {
  return arr.some(predicate);
}

/**
 * Verifica si todos los elementos cumplen la condición
 */
export function every<T>(arr: T[], predicate: (item: T) => boolean): boolean {
  return arr.every(predicate);
}

/**
 * Suma valores de un array
 */
export function sum(arr: number[]): number {
  return arr.reduce((acc, val) => acc + val, 0);
}

/**
 * Obtiene el promedio
 */
export function average(arr: number[]): number {
  return arr.length > 0 ? sum(arr) / arr.length : 0;
}

/**
 * Obtiene el máximo
 */
export function max(arr: number[]): number {
  return Math.max(...arr);
}

/**
 * Obtiene el mínimo
 */
export function min(arr: number[]): number {
  return Math.min(...arr);
}

/**
 * Verifica si el array está vacío
 */
export function isEmpty(arr: any[]): boolean {
  return arr.length === 0;
}

/**
 * Copia un array
 */
export function copy<T>(arr: T[]): T[] {
  return [...arr];
}
