import assert from 'node:assert/strict';
import test from 'node:test';
import { Reflector } from '@nestjs/core';
import type { ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { validateSync } from 'class-validator';
import { Role } from '../src/generated/prisma/client.js';
import { ROLES_KEY } from '../src/auth/roles.decorator.js';
import { JwtAuthGuard } from '../src/auth/jwt-auth.guard.js';
import { LoginDto } from '../src/auth/dto/login.dto.js';
import { RolesGuard } from '../src/auth/roles.guard.js';
import { AdminSettingsController, UpdateModelDto } from '../src/admin-settings/admin-settings.controller.js';
import { AdminSettingsService } from '../src/admin-settings/admin-settings.service.js';
import type { PrismaService } from '../src/prisma/prisma.service.js';

test('model setting reads the database and falls back when absent', async () => {
  let stored: string | null = null;
  const prisma = {
    systemSetting: {
      findUnique: async () => stored ? { value: stored } : null,
      upsert: async ({ create }: { create: { value: string } }) => { stored = create.value; return { value: stored }; },
    },
  } as unknown as PrismaService;
  const service = new AdminSettingsService(prisma);
  const fallback = process.env.OPENROUTER_DEFAULT_MODEL;
  process.env.OPENROUTER_DEFAULT_MODEL = 'openai/gpt-4o-mini';
  try {
    assert.equal(await service.activeModel(), 'openai/gpt-4o-mini');
    assert.equal((await service.updateModel('google/gemini-2.5-flash')).model, 'google/gemini-2.5-flash');
    assert.equal(await service.activeModel(), 'google/gemini-2.5-flash');
  } finally {
    if (fallback === undefined) delete process.env.OPENROUTER_DEFAULT_MODEL;
    else process.env.OPENROUTER_DEFAULT_MODEL = fallback;
  }
});

test('admin settings routes require manager role', async () => {
  const roles = new Reflector().get<Role[]>(ROLES_KEY, AdminSettingsController);
  assert.deepEqual(roles, [Role.MANAGER]);
  const context = (role?: Role) => ({
    getHandler: () => AdminSettingsController.prototype.getModel,
    getClass: () => AdminSettingsController,
    switchToHttp: () => ({ getRequest: () => ({ headers: {}, user: role ? { role } : undefined }) }),
  }) as unknown as ExecutionContext;
  assert.throws(() => new RolesGuard(new Reflector()).canActivate(context(Role.PATIENT)), /Insufficient role/);
  assert.throws(() => new RolesGuard(new Reflector()).canActivate(context()), /Insufficient role/);
  await assert.rejects(new JwtAuthGuard(new Reflector(), {} as JwtService, {} as PrismaService).canActivate(context()), /Bearer token required/);
});

test('model DTO rejects values outside the supported list', () => {
  const invalid = Object.assign(new UpdateModelDto(), { model: 'unsupported-arbitrary-model' });
  const valid = Object.assign(new UpdateModelDto(), { model: 'google/gemini-2.5-flash' });
  assert.ok(validateSync(invalid).length > 0);
  assert.equal(validateSync(valid).length, 0);
});

test('admin seed password passes login input validation', () => {
  const input = Object.assign(new LoginDto(), { email: 'admin@gmail.com', password: '123123' });
  assert.equal(validateSync(input).length, 0);
});

test('model setting falls back to environment before its table is migrated', async () => {
  const prisma = { systemSetting: { findUnique: async () => { throw { code: 'P2021' }; } } } as unknown as PrismaService;
  const fallback = process.env.OPENROUTER_DEFAULT_MODEL;
  process.env.OPENROUTER_DEFAULT_MODEL = 'openai/gpt-4o-mini';
  try {
    assert.equal(await new AdminSettingsService(prisma).activeModel(), 'openai/gpt-4o-mini');
  } finally {
    if (fallback === undefined) delete process.env.OPENROUTER_DEFAULT_MODEL;
    else process.env.OPENROUTER_DEFAULT_MODEL = fallback;
  }
});
