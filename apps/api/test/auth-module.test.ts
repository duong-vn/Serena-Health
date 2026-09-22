import assert from 'node:assert/strict';
import test from 'node:test';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { AuthModule } from '../src/auth/auth.module.js';

test('AuthModule signs JWT using secret supplied by ConfigService at bootstrap', async () => {
  const secret = 'test-jwt-secret-that-is-at-least-32-characters-long';
  const module = await Test.createTestingModule({
    imports: [AuthModule],
  })
    .overrideProvider(ConfigService)
    .useValue({ getOrThrow: (key: string) => {
      assert.equal(key, 'JWT_SECRET');
      return secret;
    } })
    .compile();

  const jwt = module.get(JwtService);
  const token = await jwt.signAsync({ sub: 'patient-id' });
  const payload = await jwt.verifyAsync<{ sub: string; iat: number; exp: number }>(token);
  assert.equal(payload.sub, 'patient-id');
  assert.equal(typeof payload.iat, 'number');
  assert.equal(typeof payload.exp, 'number');

  await module.close();
});
