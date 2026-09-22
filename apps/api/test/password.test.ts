import assert from 'node:assert/strict';
import test from 'node:test';
import { hashPassword, verifyPassword } from '../src/auth/password.js';

test('scrypt password hashing and verification', async () => {
  const plain = 'StrongP@ssw0rd2026!';
  const encoded = await hashPassword(plain);

  assert.ok(encoded.startsWith('scrypt$'), 'Must start with scrypt identifier prefix');
  const parts = encoded.split('$');
  assert.equal(parts.length, 6, 'Must contain 6 parts: prefix, N, r, p, salt, hash');

  const valid = await verifyPassword(plain, encoded);
  assert.equal(valid, true, 'Valid password must verify');

  const invalid = await verifyPassword('WrongPassword123!', encoded);
  assert.equal(invalid, false, 'Wrong password must fail verification');

  const malformed = await verifyPassword(plain, 'scrypt$16384$8$1$bad$');
  assert.equal(malformed, false, 'Malformed hash must fail safely');
});
