import assert from 'node:assert/strict';
import test from 'node:test';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import type { OAuth2Client, LoginTicket, TokenPayload } from 'google-auth-library';
import { AuthService } from '../src/auth/auth.service.js';
import { Role } from '../src/generated/prisma/client.js';

const SECRET = 'test-jwt-secret-that-is-at-least-32-characters-long';

interface UserRecord {
  id: string;
  email: string;
  phone: string | null;
  fullName: string;
  passwordHash: string | null;
  googleId: string | null;
  role: Role;
  active: boolean;
  gender: null;
  birthday: null;
  createdAt: Date;
  updatedAt: Date;
}

function makeMockGoogleClient(payload: Partial<TokenPayload> | null, shouldThrow = false): OAuth2Client {
  return {
    verifyIdToken: async () => {
      if (shouldThrow) throw new Error('Invalid token signature');
      return {
        getPayload: () => payload as TokenPayload,
      } as unknown as LoginTicket;
    },
  } as unknown as OAuth2Client;
}

function makeMockConfig(clientId: string | undefined = 'test-client-id'): ConfigService {
  return {
    get: (key: string) => (key === 'GOOGLE_CLIENT_ID' ? clientId : undefined),
  } as unknown as ConfigService;
}

function setupAuthService(options: {
  initialUsers?: UserRecord[];
  googlePayload?: Partial<TokenPayload> | null;
  googleThrow?: boolean;
  clientId?: string;
} = {}) {
  const users = new Map<string, UserRecord>();
  for (const u of options.initialUsers ?? []) {
    users.set(u.id, { ...u });
  }

  const refreshTokens = new Map<string, { id: string; userId: string; tokenHash: string; expiresAt: Date }>();
  let seq = 0;

  const toPublic = (u: UserRecord) => ({
    id: u.id,
    email: u.email,
    phone: u.phone,
    fullName: u.fullName,
    role: u.role,
    active: u.active,
    gender: u.gender,
    birthday: u.birthday,
  });

  const prisma = {
    user: {
      findUnique: async ({ where, select }: { where: { id?: string; email?: string; googleId?: string }; select?: Record<string, boolean> }) => {
        let found: UserRecord | undefined;
        if (where.id) found = users.get(where.id);
        else if (where.email) found = [...users.values()].find((u) => u.email === where.email);
        else if (where.googleId) found = [...users.values()].find((u) => u.googleId === where.googleId);

        if (!found) return null;
        if (select?.passwordHash) {
          return { ...toPublic(found), passwordHash: found.passwordHash, googleId: found.googleId };
        }
        if (select?.googleId) {
          return { ...toPublic(found), googleId: found.googleId };
        }
        return toPublic(found);
      },
      update: async ({ where, data }: { where: { id: string }; data: Partial<UserRecord> }) => {
        const found = users.get(where.id);
        assert.ok(found);
        Object.assign(found, data);
        return toPublic(found);
      },
      create: async ({ data }: { data: { email: string; fullName: string; googleId?: string; role: Role } }) => {
        const id = `user-${++seq}`;
        const newRecord: UserRecord = {
          id,
          email: data.email,
          phone: null,
          fullName: data.fullName,
          passwordHash: null,
          googleId: data.googleId ?? null,
          role: data.role,
          active: true,
          gender: null,
          birthday: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        users.set(id, newRecord);
        return toPublic(newRecord);
      },
    },
    refreshToken: {
      create: async ({ data }: { data: { userId: string; tokenHash: string; expiresAt: Date } }) => {
        const record = { ...data, id: `rt-${++seq}` };
        refreshTokens.set(data.tokenHash, record);
        return record;
      },
    },
  };

  const googleClient = makeMockGoogleClient(
    options.googlePayload ?? {
      sub: 'google-sub-123',
      email: 'user@example.com',
      name: 'Google User',
      email_verified: true,
    },
    options.googleThrow,
  );

  const service = new AuthService(
    prisma as never,
    new JwtService({ secret: SECRET }),
    makeMockConfig(options.clientId ?? 'test-client-id'),
  );
  service.googleClient = googleClient;

  return { service, users };
}

test('googleLogin fails if GOOGLE_CLIENT_ID not configured', async () => {
  const { service } = setupAuthService({ clientId: '' });
  await assert.rejects(
    async () => service.googleLogin('any-credential'),
    (err: unknown) => err instanceof UnauthorizedException && err.message.includes('not configured'),
  );
});

test('googleLogin fails if token verification fails', async () => {
  const { service } = setupAuthService({ googleThrow: true });
  await assert.rejects(
    async () => service.googleLogin('invalid-token'),
    (err: unknown) => err instanceof UnauthorizedException && err.message.includes('Invalid Google token'),
  );
});

test('googleLogin fails if email is not verified', async () => {
  const { service } = setupAuthService({
    googlePayload: { sub: 'g-1', email: 'unverified@example.com', email_verified: false },
  });
  await assert.rejects(
    async () => service.googleLogin('token'),
    (err: unknown) => err instanceof UnauthorizedException && err.message.includes('not verified'),
  );
});

test('googleLogin logs in existing user by googleId', async () => {
  const existingUser: UserRecord = {
    id: 'user-google-1',
    email: 'existing@example.com',
    fullName: 'Existing Google User',
    passwordHash: null,
    googleId: 'g-sub-999',
    role: Role.PATIENT,
    active: true,
    phone: null,
    gender: null,
    birthday: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const { service } = setupAuthService({
    initialUsers: [existingUser],
    googlePayload: {
      sub: 'g-sub-999',
      email: 'existing@example.com',
      name: 'Existing Google User',
      email_verified: true,
    },
  });

  const session = await service.googleLogin('valid-token');
  assert.equal(session.user.id, 'user-google-1');
  assert.equal(session.user.email, 'existing@example.com');
  assert.ok(session.accessToken);
  assert.ok(session.refreshToken);
});

test('googleLogin links googleId to existing user with matching email', async () => {
  const passwordUser: UserRecord = {
    id: 'user-pw-1',
    email: 'password@example.com',
    fullName: 'Password User',
    passwordHash: 'hashed-pw',
    googleId: null,
    role: Role.PATIENT,
    active: true,
    phone: null,
    gender: null,
    birthday: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const { service, users } = setupAuthService({
    initialUsers: [passwordUser],
    googlePayload: {
      sub: 'new-google-sub',
      email: 'password@example.com',
      name: 'Password User Google Name',
      email_verified: true,
    },
  });

  const session = await service.googleLogin('valid-token');
  assert.equal(session.user.id, 'user-pw-1');
  assert.equal(users.get('user-pw-1')?.googleId, 'new-google-sub');
});

test('googleLogin creates new patient user when no user exists', async () => {
  const { service, users } = setupAuthService({
    initialUsers: [],
    googlePayload: {
      sub: 'brand-new-google-sub',
      email: 'newuser@example.com',
      name: 'New Person',
      email_verified: true,
    },
  });

  const session = await service.googleLogin('valid-token');
  assert.equal(session.user.email, 'newuser@example.com');
  assert.equal(session.user.fullName, 'New Person');
  assert.equal(session.user.role, Role.PATIENT);
  const created = [...users.values()].find((u) => u.email === 'newuser@example.com');
  assert.ok(created);
  assert.equal(created.googleId, 'brand-new-google-sub');
  assert.equal(created.passwordHash, null);
});

test('login with password fails when user has no passwordHash (Google-only user)', async () => {
  const googleOnlyUser: UserRecord = {
    id: 'user-google-only',
    email: 'googleonly@example.com',
    fullName: 'Google Only',
    passwordHash: null,
    googleId: 'g-sub-only',
    role: Role.PATIENT,
    active: true,
    phone: null,
    gender: null,
    birthday: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const { service } = setupAuthService({ initialUsers: [googleOnlyUser] });
  await assert.rejects(
    async () => service.login({ email: 'googleonly@example.com', password: 'SomePassword123' }),
    (err: unknown) => err instanceof UnauthorizedException,
  );
});
