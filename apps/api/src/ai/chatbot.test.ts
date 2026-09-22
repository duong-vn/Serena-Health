import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createServer } from 'node:http';
import type { Response } from 'express';
import type { PrismaService } from '../prisma/prisma.service.js';
import type { AiToolsService } from './ai-tools.service.js';
import { ChatbotService } from './chatbot.service.js';

const patient = { id: 'patient-1', email: 'patient@example.test', fullName: 'Patient', role: 'PATIENT' as const };
const response = {} as Response;

test('emergency guidance streams, persists history and releases the generation lease', async () => {
  const saved: Array<{ role: string; content: string; metadata?: { status: string } }> = [];
  const leases: unknown[] = [];
  const prisma = {
    conversation: {
      findFirst: async () => ({ consultation: null }),
      updateMany: async (input: unknown) => { leases.push(input); return { count: 1 }; },
    },
    message: {
      findMany: async () => [],
      create: async ({ data }: { data: typeof saved[number] }) => { saved.push(data); return { id: 'saved-message', ...data }; },
    },
  } as unknown as PrismaService;
  const service = new ChatbotService(prisma, {} as AiToolsService);
  let complete!: () => void;
  const completed = new Promise<void>((resolve) => { complete = resolve; });
  const server = createServer((_request, reply) => {
    void service.chat(patient, 'conversation', 'I cannot breathe', reply as Response)
      .catch(() => { reply.destroy(); })
      .finally(complete);
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  try {
    const address = server.address();
    assert.ok(address && typeof address !== 'string');
    const result = await fetch(`http://127.0.0.1:${address.port}`);
    assert.match(result.headers.get('content-type') ?? '', /text\/event-stream/);
    const stream = await result.text();
    await completed;
    assert.match(stream, /text-delta/);
    assert.match(stream, /115/);
    assert.match(stream, /\[DONE\]/);
    assert.equal(saved[0].role, 'USER');
    assert.equal(saved[1].role, 'ASSISTANT');
    assert.equal(saved[1].metadata?.status, 'completed');
    assert.equal(leases.length, 2);
    assert.deepEqual((leases[1] as { data: { generationExpiresAt: unknown } }).data.generationExpiresAt, null);
  } finally {
    server.closeAllConnections();
    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
});

test('chat rejects non-patients without querying private history', async () => {
  const service = new ChatbotService({} as PrismaService, {} as AiToolsService);
  await assert.rejects(service.chat({ ...patient, role: 'DOCTOR' }, 'other-conversation', 'hello', response), /Forbidden/);
});

test('chat rejects conversations not owned by current patient', async () => {
  const prisma = { conversation: { findFirst: async ({ where }: { where: { patientId: string } }) => {
    assert.equal(where.patientId, patient.id);
    return null;
  } } } as unknown as PrismaService;
  const service = new ChatbotService(prisma, {} as AiToolsService);
  await assert.rejects(service.chat(patient, 'other-conversation', 'hello', response), /Conversation not found/);
});

test('chat cannot continue after human-care escalation', async () => {
  const prisma = { conversation: { findFirst: async () => ({ consultation: { status: 'DOCTOR_CHAT' } }) } } as unknown as PrismaService;
  const service = new ChatbotService(prisma, {} as AiToolsService);
  await assert.rejects(service.chat(patient, 'conversation', 'hello', response), /moved to human care/);
});

test('concurrent emergency chat is rejected before any provider call', async () => {
  const prisma = { conversation: { findFirst: async () => ({ consultation: null }), updateMany: async () => ({ count: 0 }) } } as unknown as PrismaService;
  const service = new ChatbotService(prisma, {} as AiToolsService);
  await assert.rejects(service.chat(patient, 'conversation', 'I cannot breathe', response), /already being generated/);
});
