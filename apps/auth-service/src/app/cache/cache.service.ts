import { Injectable, Inject } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from './cache.module';

@Injectable()
export class CacheService {
  constructor(@Inject(REDIS_CLIENT) private redis: Redis) {}

  /**
   * Obtener valor del cache
   */
  async get<T>(key: string): Promise<T | null> {
    const value = await this.redis.get(key);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return value as unknown as T;
    }
  }

  /**
   * Guardar valor en el cache con TTL opcional
   */
  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    if (ttlSeconds) {
      await this.redis.setex(key, ttlSeconds, serialized);
    } else {
      await this.redis.set(key, serialized);
    }
  }

  /**
   * Eliminar valor del cache
   */
  async delete(key: string): Promise<void> {
    await this.redis.del(key);
  }

  /**
   * Verificar si existe una clave
   */
  async exists(key: string): Promise<boolean> {
    const result = await this.redis.exists(key);
    return result === 1;
  }

  /**
   * Obtener todas las claves que coincidan con el patrón
   */
  async getKeys(pattern: string): Promise<string[]> {
    return this.redis.keys(pattern);
  }

  /**
   * Limpiar todas las claves del cache
   */
  async flush(): Promise<void> {
    await this.redis.flushdb();
  }

  /**
   * Incrementar un valor numérico
   */
  async increment(key: string, amount = 1): Promise<number> {
    return this.redis.incrby(key, amount);
  }

  /**
   * Añadir a una lista
   */
  async pushToList(key: string, value: string | string[]): Promise<number> {
    if (Array.isArray(value)) {
      return this.redis.rpush(key, ...value);
    }
    return this.redis.rpush(key, value);
  }

  /**
   * Obtener una lista completa
   */
  async getList(key: string): Promise<string[]> {
    return this.redis.lrange(key, 0, -1);
  }

  /**
   * Remover de una lista
   */
  async removeFromList(key: string, value: string): Promise<number> {
    return this.redis.lrem(key, 0, value);
  }
}
