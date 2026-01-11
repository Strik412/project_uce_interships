/**
 * @file date.utils.ts
 * @description Utilidades para manejo de fechas
 */

/**
 * Obtiene la fecha actual en ISO
 */
export function getNowISO(): string {
  return new Date().toISOString();
}

/**
 * Convierte una fecha a ISO string
 */
export function toISOString(date: Date): string {
  return date.toISOString();
}

/**
 * Suma días a una fecha
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Suma horas a una fecha
 */
export function addHours(date: Date, hours: number): Date {
  const result = new Date(date);
  result.setHours(result.getHours() + hours);
  return result;
}

/**
 * Suma minutos a una fecha
 */
export function addMinutes(date: Date, minutes: number): Date {
  const result = new Date(date);
  result.setMinutes(result.getMinutes() + minutes);
  return result;
}

/**
 * Obtiene la diferencia en días entre dos fechas
 */
export function daysBetween(date1: Date, date2: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.floor((date2.getTime() - date1.getTime()) / msPerDay);
}

/**
 * Obtiene la diferencia en horas entre dos fechas
 */
export function hoursBetween(date1: Date, date2: Date): number {
  const msPerHour = 60 * 60 * 1000;
  return Math.floor((date2.getTime() - date1.getTime()) / msPerHour);
}

/**
 * Obtiene la diferencia en minutos entre dos fechas
 */
export function minutesBetween(date1: Date, date2: Date): number {
  const msPerMinute = 60 * 1000;
  return Math.floor((date2.getTime() - date1.getTime()) / msPerMinute);
}

/**
 * Verifica si una fecha está en el pasado
 */
export function isPast(date: Date): boolean {
  return date.getTime() < new Date().getTime();
}

/**
 * Verifica si una fecha está en el futuro
 */
export function isFuture(date: Date): boolean {
  return date.getTime() > new Date().getTime();
}

/**
 * Verifica si una fecha es hoy
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

/**
 * Obtiene el inicio del día
 */
export function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Obtiene el final del día
 */
export function endOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}

/**
 * Formatea una fecha
 */
export function formatDate(date: Date, format: string = 'DD/MM/YYYY'): string {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  return format
    .replace('DD', day)
    .replace('MM', month)
    .replace('YYYY', year.toString())
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
}
