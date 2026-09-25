import assert from 'node:assert/strict';
import test from 'node:test';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../src/auth/auth.service.js';
import { Role } from '../src/generated/prisma/client.js';
import { hashPassword } from '../src/auth/password.js';

const SECRET = 'test-jwt-secret-that-is-at-least-32-characters-long';

interface RefreshRecord { id: string; userId: string; tokenHash: string; expiresAt: Date; revokedAt: Date | null }

function makeService(userOverrides: Record<string, unknown> = {}) {
  const stored = {
    id: 'user-id-1',
    email: 'patient@example.com',
    phone: null,
    fullName: 'Test Patient',
    passwordHash: '',
    role: Role.PATIENT,
    active: true,
    gender: null,
    birthday: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...userOverrides,
  };
  const refreshTokens = new Map<string, RefreshRecord>();
  let seq = 0;
  const toPublic = () => {
    const { passwordHash: _dropped, createdAt: _c, updatedAt: _u, ...safe } = stored;
    void _dropped;
    void _c;
    void _u;
    return safe;
  };
  const prisma = {
    user: {
      findUnique: async ({ select }: { select?: Record<string, boolean> }) =>
        select && !('passwordHash' in select) ? toPublic() : { ...stored },
      create: async () => toPublic(),
    },
    refreshToken: {
      create: async ({ data }: { data: Omit<RefreshRecord, 'id' | 'revokedAt'> }) => {
        const record = { ...data, id: `rt-${++seq}`, revokedAt: null };
        refreshTokens.set(record.tokenHash, record);
        return record;
      },
      findUnique: async ({ where }: { where: { tokenHash: string } }) => refreshTokens.get(where.tokenHash) ?? null,
      update: async ({ where, data }: { where: { id: string }; data: { revokedAt: Date } }) => {
        const record = [...refreshTokens.values()].find((r) => r.id === where.id);
        assert.ok(record);
        Object.assign(record, data);
        return record;
      },
      updateMany: async ({ where }: { where: { tokenHash?: string; userId?: string; revokedAt: null } }) => {
        let count = 0;
        for (const record of refreshTokens.values()) {
          if (where.tokenHash && record.tokenHash !== where.tokenHash) continue;
          if (where.userId && record.userId !== where.userId) continue;
          if (!record.revokedAt) {
            record.revokedAt = new Date();
            count += 1;
          }
        }
        return { count };
      },
    },
  };
  return { service: new AuthService(prisma as never, new JwtService({ secret: SECRET })), stored, refreshTokens };
}

test('login issues access + refresh pair and whitelists user fields', async () => {
  const { service } = makeService({ passwordHash: await hashPassword('StrongPass1') });
  const session = await service.login({ email: 'patient@example.com', password: 'StrongPass1' });
  assert.ok(session.accessToken);
  assert.ok(session.refreshToken);
  assert.ok(session.refreshExpiresAt > new Date());
  assert.ok(!('passwordHash' in session.user));
  assert.ok(!('createdAt' in session.user));
});

test('refresh rotates token — old token rejected after use', async () => {
  const { service } = makeService({ passwordHash: await hashPassword('StrongPass1') });
  const first = await service.login({ email: 'patient@example.com', password: 'StrongPass1' });
  const second = await service.refresh(first.refreshToken);
  assert.notEqual(second.refreshToken, first.refreshToken);
  assert.ok(second.accessToken);
  await assert.rejects(service.refresh(first.refreshToken), UnauthorizedException);
});

test('logout revokes refresh token', async () => {
  const { service } = makeService({ passwordHash: await hashPassword('StrongPass1') });
  const session = await service.login({ email: 'patient@example.com', password: 'StrongPass1' });
  await service.logout(session.refreshToken);
  await assert.rejects(service.refresh(session.refreshToken), UnauthorizedException);
});

test('logoutAll revokes every session', async () => {
  const { service } = makeService({ passwordHash: await hashPassword('StrongPass1') });
  const first = await service.login({ email: 'patient@example.com', password: 'StrongPass1' });
  const second = await service.login({ email: 'patient@example.com', password: 'StrongPass1' });
  await service.logoutAll('user-id-1');
  await assert.rejects(service.refresh(first.refreshToken), UnauthorizedException);
  await assert.rejects(service.refresh(second.refreshToken), UnauthorizedException);
});

test('refresh rejects unknown and missing tokens', async () => {
  const { service, refreshTokens } = makeService();
  await assert.rejects(service.refresh('bogus-token'), UnauthorizedException);
  await assert.rejects(service.refresh(undefined), UnauthorizedException);
  assert.equal(refreshTokens.size, 0);
});
