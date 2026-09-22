import assert from 'node:assert/strict';
import { test } from 'node:test';
import { hashPassword, verifyPassword } from './password.js';

test('hashPassword generates valid scrypt format with distinct salt', async () => {
  const hash1 = await hashPassword('Secret@123456');
  const hash2 = await hashPassword('Secret@123456');

  assert.notEqual(hash1, hash2, 'Salts must be randomly generated for each call');
  assert.ok(hash1.startsWith('scrypt$16384$8$1$'));
});

test('verifyPassword verifies matching password and rejects incorrect password', async () => {
  const encoded = await hashPassword('PatientPass@2026!');

  assert.equal(await verifyPassword('PatientPass@2026!', encoded), true);
  assert.equal(await verifyPassword('WrongPassword', encoded), false);
  assert.equal(await verifyPassword('', encoded), false);
});

test('verifyPassword handles corrupted or malformed hashes safely', async () => {
  assert.equal(await verifyPassword('pass', 'corrupted$string'), false);
  assert.equal(await verifyPassword('pass', ''), false);
  assert.equal(await verifyPassword('pass', 'bcrypt$somehash'), false);
});
