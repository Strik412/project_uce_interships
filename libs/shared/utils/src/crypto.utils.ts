/**
 * @file crypto.utils.ts
 * @description Utilidades de encriptación y hash
 */

import * as crypto from 'crypto';

/**
 * Genera un hash SHA256 de una cadena
 */
export function hashSha256(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Genera un hash bcrypt de una contraseña
 * Nota: bcrypt está disponible en el proyecto
 */
export async function hashPassword(password: string, rounds: number = 10): Promise<string> {
  const bcrypt = require('bcrypt');
  return bcrypt.hash(password, rounds);
}

/**
 * Compara una contraseña con su hash bcrypt
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  const bcrypt = require('bcrypt');
  return bcrypt.compare(password, hash);
}

/**
 * Genera un token aleatorio
 */
export function generateRandomToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Genera un código numérico (TOTP)
 */
export function generateNumericCode(length: number = 6): string {
  const code = Math.floor(Math.random() * Math.pow(10, length));
  return code.toString().padStart(length, '0');
}

/**
 * Encripta datos con AES-256
 */
export function encryptAes256(data: string, key: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    'aes-256-cbc',
    Buffer.from(key.padEnd(32, '0').substring(0, 32)),
    iv,
  );
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

/**
 * Desencripta datos con AES-256
 */
export function decryptAes256(encryptedData: string, key: string): string {
  const parts = encryptedData.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const decipher = crypto.createDecipheriv(
    'aes-256-cbc',
    Buffer.from(key.padEnd(32, '0').substring(0, 32)),
    iv,
  );
  let decrypted = decipher.update(parts[1], 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

/**
 * Genera un UUID v4
 */
export function generateUUID(): string {
  return crypto.randomUUID();
}
