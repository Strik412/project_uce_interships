/**
 * @file index.spec.ts
 * @description Tests para utilidades compartidas
 */

import {
  hashSha256,
  generateRandomToken,
  generateNumericCode,
  isValidEmail,
  isStrongPassword,
  isValidUrl,
  isValidUUID,
  capitalize,
  slugify,
  camelCase,
  snakeCase,
  kebabCase,
  isObject,
  shallowClone,
  deepClone,
  unique,
  chunk,
  groupBy,
  calculatePagination,
} from './index';

describe('@shared/utils', () => {
  describe('Crypto Utils', () => {
    it('should hash string with SHA256', () => {
      const hash = hashSha256('password123');
      expect(hash).toBeDefined();
      expect(hash.length).toBe(64); // SHA256 produces 64 hex chars
    });

    it('should generate random token', () => {
      const token1 = generateRandomToken(32);
      const token2 = generateRandomToken(32);
      expect(token1).toBeDefined();
      expect(token2).toBeDefined();
      expect(token1).not.toBe(token2);
    });

    it('should generate numeric code', () => {
      const code = generateNumericCode(6);
      expect(code).toMatch(/^\d{6}$/);
    });
  });

  describe('Validation Utils', () => {
    it('should validate email', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('invalid.email')).toBe(false);
    });

    it('should validate strong password', () => {
      expect(isStrongPassword('StrongPass123!')).toBe(true);
      expect(isStrongPassword('weak')).toBe(false);
    });

    it('should validate URL', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('not a url')).toBe(false);
    });

    it('should validate UUID', () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      expect(isValidUUID(uuid)).toBe(true);
      expect(isValidUUID('not-a-uuid')).toBe(false);
    });
  });

  describe('String Utils', () => {
    it('should capitalize string', () => {
      expect(capitalize('hello')).toBe('Hello');
    });

    it('should create slug', () => {
      expect(slugify('Hello World')).toBe('hello-world');
      expect(slugify('Hello-World!')).toBe('hello-world');
    });

    it('should convert to camelCase', () => {
      expect(camelCase('hello_world')).toBe('helloWorld');
      expect(camelCase('hello-world')).toBe('helloWorld');
    });

    it('should convert to snake_case', () => {
      expect(snakeCase('helloWorld')).toBe('hello_world');
    });

    it('should convert to kebab-case', () => {
      expect(kebabCase('helloWorld')).toBe('hello-world');
    });
  });

  describe('Object Utils', () => {
    it('should check if is object', () => {
      expect(isObject({})).toBe(true);
      expect(isObject([])).toBe(false);
      expect(isObject('string')).toBe(false);
    });

    it('should shallow clone object', () => {
      const obj = { a: 1, b: { c: 2 } };
      const cloned = shallowClone(obj);
      expect(cloned).toEqual(obj);
      expect(cloned).not.toBe(obj);
      expect(cloned.b).toBe(obj.b);
    });

    it('should deep clone object', () => {
      const obj = { a: 1, b: { c: 2 } };
      const cloned = deepClone(obj);
      expect(cloned).toEqual(obj);
      expect(cloned).not.toBe(obj);
      expect(cloned.b).not.toBe(obj.b);
    });
  });

  describe('Array Utils', () => {
    it('should get unique elements', () => {
      expect(unique([1, 2, 2, 3, 3, 3])).toEqual([1, 2, 3]);
    });

    it('should chunk array', () => {
      const result = chunk([1, 2, 3, 4, 5] as any, 2);
      expect(result).toEqual([[1, 2], [3, 4], [5]]);
    });

    it('should group by', () => {
      const data = [
        { name: 'John', age: 30 },
        { name: 'Jane', age: 30 },
        { name: 'Bob', age: 25 },
      ];
      const result = groupBy(data, item => item.age);
      expect(Object.keys(result).length).toBe(2);
      expect(result['30'].length).toBe(2);
    });
  });

  describe('Pagination Utils', () => {
    it('should calculate pagination', () => {
      const result = calculatePagination(100, 2, 10);
      expect(result.skip).toBe(10);
      expect(result.take).toBe(10);
      expect(result.totalPages).toBe(10);
      expect(result.hasNextPage).toBe(true);
      expect(result.hasPreviousPage).toBe(true);
    });
  });
});
