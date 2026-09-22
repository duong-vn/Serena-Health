import assert from 'node:assert/strict';
import { test } from 'node:test';
import { AiToolsService } from './ai-tools.service.js';
import type { CatalogService } from '../catalog/catalog.service.js';
import type { AppointmentsService } from '../appointments/appointments.service.js';
import type { PrismaService } from '../prisma/prisma.service.js';

const patient = { id: 'patient-1', email: 'patient@example.test', fullName: 'Patient', role: 'PATIENT' as const };

test('AI tools reject non-patient actors before exposing any tool', () => {
  const tools = new AiToolsService({} as CatalogService, {} as AppointmentsService, {} as PrismaService);
  assert.throws(() => tools.forPatient({ ...patient, role: 'MANAGER' }), /Forbidden/);
});

test('patient tools expose no booking mutation or arbitrary database access', () => {
  const tools = new AiToolsService({} as CatalogService, {} as AppointmentsService, {} as PrismaService).forPatient(patient);
  assert.deepEqual(Object.keys(tools).sort(), ['findDoctors', 'getAvailableAppointmentSlots', 'getCurrentPatientProfile', 'getDoctorAvailability', 'getDoctorDetails', 'getServices', 'requestDoctorEscalation'].sort());
});

test('escalation tool produces a consent proposal without database writes', async () => {
  const tools = new AiToolsService({} as CatalogService, {} as AppointmentsService, {} as PrismaService).forPatient(patient);
  // @ts-expect-error test harness passes minimal execution context
  const proposal = (await tools.requestDoctorEscalation.execute({ reason: 'Patient requests care', summary: 'Reported headache' }, { toolCallId: 'test', messages: [] })) as { requiresConfirmation: boolean; summary: string };
  assert.equal(proposal.requiresConfirmation, true);
  assert.match(proposal.summary, /not confirmed medical facts/);
});
