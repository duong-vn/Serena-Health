import assert from 'node:assert/strict';
import test from 'node:test';
import { validateEnvironment } from '../src/config/environment.js';

test('environment validation preserves Gemini configuration for Nest to load', () => {
  const input = {
    DATABASE_URL: 'postgresql://localhost:5432/test',
    JWT_SECRET: 'x'.repeat(32),
    GEMINI_API_KEY: 'test-only-placeholder',
    GEMINI_MODEL: 'test-model',
  };
  const valid = validateEnvironment(input);
  assert.equal(Reflect.get(valid, 'GEMINI_API_KEY'), input.GEMINI_API_KEY);
  assert.equal(Reflect.get(valid, 'GEMINI_MODEL'), input.GEMINI_MODEL);
});

test('environment validation ensures safety constraints', () => {
  assert.throws(
    () => validateEnvironment({ DATABASE_URL: 'mysql://localhost:3306/db', JWT_SECRET: 'a'.repeat(32) }),
    /DATABASE_URL must be a PostgreSQL URL/,
  );

  assert.throws(
    () => validateEnvironment({ DATABASE_URL: 'postgresql://localhost:5432/db', JWT_SECRET: 'short-secret' }),
    /JWT_SECRET must be at least 32 characters/,
  );

  const valid = validateEnvironment({
    DATABASE_URL: 'postgresql://serene:secret@localhost:5432/serene_health',
    JWT_SECRET: 'this-is-a-valid-secret-key-that-exceeds-32-chars!',
    PORT: '3001',
    CORS_ORIGINS: 'http://localhost:5173, http://127.0.0.1:5173',
  });

  assert.equal(valid.PORT, 3001);
  assert.equal(valid.CORS_ORIGINS.length, 2);
  assert.equal(valid.CORS_ORIGINS[0], 'http://localhost:5173');
});
