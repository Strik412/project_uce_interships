/**
 * @file object.utils.ts
 * @description Utilidades para manejo de objetos
 */

/**
 * Verifica si un valor es un objeto
 */
export function isObject(value: any): value is Record<string, any> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Obtiene claves de un objeto
 */
export function getKeys<T extends Record<string, any>>(obj: T): (keyof T)[] {
  return Object.keys(obj) as (keyof T)[];
}

/**
 * Obtiene valores de un objeto
 */
export function getValues<T extends Record<string, any>>(obj: T): T[keyof T][] {
  return Object.values(obj);
}

/**
 * Obtiene entradas (key-value pairs)
 */
export function getEntries<T extends Record<string, any>>(obj: T): [keyof T, T[keyof T]][] {
  return Object.entries(obj) as [keyof T, T[keyof T]][];
}

/**
 * Copia superficial de un objeto
 */
export function shallowClone<T extends Record<string, any>>(obj: T): T {
  return { ...obj };
}

/**
 * Copia profunda de un objeto
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as any;
  }

  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as any;
  }

  if (obj instanceof Object) {
    const clonedObj = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }

  return obj;
}

/**
 * Fusiona dos objetos
 */
export function merge<T extends Record<string, any>, U extends Record<string, any>>(
  obj1: T,
  obj2: U,
): T & U {
  return { ...obj1, ...obj2 };
}

/**
 * Fusiona objetos profundamente
 */
export function deepMerge<T extends Record<string, any>>(objects: T[]): T {
  const result = {} as T;

  for (const obj of objects) {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (isObject(obj[key]) && isObject(result[key])) {
          result[key] = deepMerge([result[key], obj[key]]);
        } else {
          result[key] = obj[key];
        }
      }
    }
  }

  return result;
}

/**
 * Omite propiedades de un objeto
 */
export function omit<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[],
): Omit<T, K> {
  const result = { ...obj };
  keys.forEach(key => {
    delete result[key];
  });
  return result;
}

/**
 * Selecciona propiedades de un objeto
 */
export function pick<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[],
): Pick<T, K> {
  const result = {} as Pick<T, K>;
  keys.forEach(key => {
    result[key] = obj[key];
  });
  return result;
}

/**
 * Flattena un objeto anidado
 */
export function flatten(obj: any, prefix: string = '', result: Record<string, any> = {}): Record<string, any> {
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];
      const newKey = prefix ? `${prefix}.${key}` : key;

      if (isObject(value) && !Array.isArray(value)) {
        flatten(value, newKey, result);
      } else {
        result[newKey] = value;
      }
    }
  }

  return result;
}

/**
 * Compara dos objetos
 */
export function deepEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true;

  if (typeof obj1 !== 'object' || typeof obj2 !== 'object' || obj1 === null || obj2 === null) {
    return false;
  }

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  return keys1.every(key => deepEqual(obj1[key], obj2[key]));
}

/**
 * Verifica si un objeto está vacío
 */
export function isEmptyObject(obj: any): boolean {
  return Object.keys(obj).length === 0;
}
