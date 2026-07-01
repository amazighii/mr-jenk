import type { Role } from '../models/role';

function decodeBase64Url(input: string): string {
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
  return decodeURIComponent(
    atob(padded)
      .split('')
      .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
      .join(''),
  );
}

export function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const json = decodeBase64Url(parts[1]);
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function getJwtUserId(token: string): string | null {
  const payload = decodeJwtPayload(token);
  const sub = payload?.['sub'];
  return typeof sub === 'string' ? sub : null;
}

export function getJwtRole(token: string): Role | null {
  const payload = decodeJwtPayload(token);
  const role = payload?.['role'];
  if (role === 'CLIENT' || role === 'SELLER') return role;
  return null;
}

