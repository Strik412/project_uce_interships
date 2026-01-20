/**
 * Configuración de rutas públicas (sin autenticación)
 */
export const PUBLIC_ROUTES = [
  '/api/v1/health',
  '/api/v1/',
  '/api/v1/auth/register',
  '/api/v1/auth/login',
  '/api/v1/auth/refresh',
  '/api/v1/auth/forgot-password',
  '/api/v1/auth/reset-password',
];

/**
 * Rutas que requieren roles específicos
 */
export const ROLE_RESTRICTED_ROUTES: Record<string, string[]> = {
  '/api/v1/reports': ['admin', 'supervisor'],
  '/api/v1/metrics': ['admin', 'supervisor'],
  '/api/v1/dashboards': ['admin', 'supervisor'],
  '/api/v1/analytics': ['admin', 'supervisor'],
  '/api/v1/users': ['admin'],
  '/api/v1/templates': ['admin'],
};
