export function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1];
    
    // Add padding if needed for base64url decoding
    let base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const pad = base64.length % 4;
    if (pad) {
      if (pad === 1) {
        throw new Error('Invalid base64url string');
      }
      base64 += '='.repeat(4 - pad);
    }
    
    // Use atob for browser-compatible base64 decoding
    const decoded = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    return JSON.parse(decoded) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function getRolesFromToken(token: string): string[] {
  const payload = decodeJwtPayload(token);
  if (!payload) return [];
  const roles = (payload as { roles?: unknown }).roles;
  if (Array.isArray(roles)) {
    return roles.map((r) => String(r)).filter(Boolean);
  }
  return [];
}

export function getTokenExpirationSeconds(token: string): number | null {
  const payload = decodeJwtPayload(token);
  if (!payload) return null;
  const exp = (payload as { exp?: unknown }).exp;
  if (typeof exp === 'number') return exp;
  if (typeof exp === 'string') {
    const parsed = Number(exp);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

export function isTokenExpired(token: string): boolean {
  const exp = getTokenExpirationSeconds(token);
  if (!exp) return true;
  const nowSeconds = Math.floor(Date.now() / 1000);
  return exp <= nowSeconds;
}
