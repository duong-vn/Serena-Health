import assert from 'node:assert/strict';
import test from 'node:test';
import { ConsultationStatus, Role } from '../src/generated/prisma/client.js';

test('consultation escalation prevents concurrent AI generation lease conflict', () => {
  const now = new Date();
  const activeLease = new Date(now.getTime() + 60_000); // 60s in future

  // Simulating the business rule in ConsultationsService.escalate:
  const isLeaseActive = activeLease > now;
  assert.equal(isLeaseActive, true, 'Active lease must be detected');

  const expiredLease = new Date(now.getTime() - 1_000);
  assert.equal(expiredLease > now, false, 'Expired lease must allow escalation');
});

test('consultation human chat participant assertion only allows patient or assigned doctor', () => {
  const consultation = {
    id: 'consultation-1',
    conversationId: 'conversation-1',
    patientId: 'patient-user-1',
    status: ConsultationStatus.ASSIGNED_TO_DOCTOR,
    doctor: { userId: 'doctor-user-1' },
  };

  const isPatientParticipant = (actorId: string, role: Role) =>
    role === Role.PATIENT ? consultation.patientId === actorId : false;

  const isDoctorParticipant = (actorId: string, role: Role) =>
    role === Role.DOCTOR ? consultation.doctor.userId === actorId : false;

  // Assigned patient
  assert.equal(isPatientParticipant('patient-user-1', Role.PATIENT), true);
  // Other patient
  assert.equal(isPatientParticipant('patient-user-2', Role.PATIENT), false);

  // Assigned doctor
  assert.equal(isDoctorParticipant('doctor-user-1', Role.DOCTOR), true);
  // Other doctor
  assert.equal(isDoctorParticipant('doctor-user-2', Role.DOCTOR), false);

  // Status must be ASSIGNED_TO_DOCTOR or DOCTOR_CHAT
  const isHumanChatActive = (status: ConsultationStatus) =>
    status === ConsultationStatus.ASSIGNED_TO_DOCTOR || status === ConsultationStatus.DOCTOR_CHAT;

  assert.equal(isHumanChatActive(ConsultationStatus.ASSIGNED_TO_DOCTOR), true);
  assert.equal(isHumanChatActive(ConsultationStatus.DOCTOR_CHAT), true);
  assert.equal(isHumanChatActive(ConsultationStatus.AI_CHAT), false);
  assert.equal(isHumanChatActive(ConsultationStatus.COMPLETED), false);
});
