import { decodeJwtPayload, getJwtRole, getJwtUserId } from './jwt';

function tokenWithPayload(payload: Record<string, unknown>): string {
  const json = JSON.stringify(payload);
  const base64Url = btoa(unescape(encodeURIComponent(json)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');

  return `header.${base64Url}.signature`;
}

describe('jwt utilities', () => {
  it('decodes a base64url JWT payload', () => {
    const token = tokenWithPayload({ sub: 'user-123', role: 'SELLER', name: 'Amina' });

    expect(decodeJwtPayload(token)).toEqual({
      sub: 'user-123',
      role: 'SELLER',
      name: 'Amina',
    });
  });

  it('returns user id and supported roles from token claims', () => {
    const sellerToken = tokenWithPayload({ sub: 'seller-9', role: 'SELLER' });
    const clientToken = tokenWithPayload({ sub: 'client-4', role: 'CLIENT' });

    expect(getJwtUserId(sellerToken)).toBe('seller-9');
    expect(getJwtRole(sellerToken)).toBe('SELLER');
    expect(getJwtRole(clientToken)).toBe('CLIENT');
  });

  it('returns null for malformed tokens and unsupported claims', () => {
    const unsupportedRoleToken = tokenWithPayload({ sub: 42, role: 'ADMIN' });

    expect(decodeJwtPayload('not-a-jwt')).toBeNull();
    expect(getJwtUserId(unsupportedRoleToken)).toBeNull();
    expect(getJwtRole(unsupportedRoleToken)).toBeNull();
  });
});
