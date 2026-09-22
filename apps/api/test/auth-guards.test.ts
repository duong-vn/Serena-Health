import assert from 'node:assert/strict';
import test from 'node:test';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from '../src/auth/roles.guard.js';
import { Role } from '../src/generated/prisma/client.js';
import { ROLES_KEY } from '../src/auth/roles.decorator.js';

test('RolesGuard allows request when no roles metadata is set', () => {
  const reflector = new Reflector();
  const guard = new RolesGuard(reflector);

  const mockContext = {
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({
      getRequest: () => ({ user: { role: Role.PATIENT } }),
    }),
  } as any;

  assert.equal(guard.canActivate(mockContext), true);
});

test('RolesGuard allows user with matching role', () => {
  const reflector = new Reflector();
  reflector.getAllAndOverride = () => [Role.DOCTOR, Role.MANAGER];
  const guard = new RolesGuard(reflector);

  const mockDoctorContext = {
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({
      getRequest: () => ({ user: { role: Role.DOCTOR } }),
    }),
  } as any;

  assert.equal(guard.canActivate(mockDoctorContext), true);
});

test('RolesGuard throws ForbiddenException for unprivileged user', () => {
  const reflector = new Reflector();
  reflector.getAllAndOverride = () => [Role.MANAGER];
  const guard = new RolesGuard(reflector);

  const mockPatientContext = {
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({
      getRequest: () => ({ user: { role: Role.PATIENT } }),
    }),
  } as any;

  assert.throws(() => guard.canActivate(mockPatientContext), /Insufficient role/);
});
