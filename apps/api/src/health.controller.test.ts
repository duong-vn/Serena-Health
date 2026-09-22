import 'reflect-metadata';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { HealthController } from './health.controller.js';
import { IS_PUBLIC_KEY } from './auth/public.decorator.js';

test('health returns a public liveness response with an ISO timestamp', () => {
  const before = Date.now();
  const result = new HealthController().health();
  assert.equal(result.status, 'ok');
  assert.equal(new Date(result.timestamp).toISOString(), result.timestamp);
  assert.ok(Date.parse(result.timestamp) >= before);
  assert.ok(Date.parse(result.timestamp) <= Date.now());
  assert.equal(Reflect.getMetadata(IS_PUBLIC_KEY, HealthController.prototype.health), true);
});
