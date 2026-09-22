import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildSlots, clinicDayOfWeek } from './availability.js';
import { canTransitionAppointment, isThirtyMinuteBoundary } from './booking-policy.js';
import { AppointmentStatus, Role } from '../generated/prisma/client.js';

test('buildSlots splits shift window into 30-min intervals and marks booked slots unavailable', () => {
  const windows = [{ startTime: '08:00', endTime: '10:00' }];
  const targetDate = '2026-09-25';
  const bookedTime = new Date('2026-09-25T08:30:00+07:00').getTime();
  const pastReferenceTime = new Date('2026-09-20T00:00:00Z');

  const slots = buildSlots(targetDate, windows, new Set([bookedTime]), pastReferenceTime);
  assert.equal(slots.length, 4);

  assert.equal(slots[0].available, true);
  assert.equal(slots[1].available, false); // booked
  assert.equal(slots[2].available, true);
  assert.equal(slots[3].available, true);
});

test('buildSlots marks past slots as unavailable', () => {
  const windows = [{ startTime: '08:00', endTime: '09:00' }];
  const targetDate = '2026-09-25';
  const midWindowReference = new Date('2026-09-25T08:15:00+07:00');

  const slots = buildSlots(targetDate, windows, new Set(), midWindowReference);
  assert.equal(slots.length, 2);
  assert.equal(slots[0].available, false); // 08:00 is in the past
  assert.equal(slots[1].available, true); // 08:30 is in the future
});

test('clinicDayOfWeek computes correct weekday for clinic timezone', () => {
  // 2026-09-25 is Friday (day 5)
  assert.equal(clinicDayOfWeek('2026-09-25'), 5);
});

test('canTransitionAppointment enforces role-based state machine', () => {
  // Patient can only cancel pending or confirmed
  assert.equal(canTransitionAppointment(Role.PATIENT, AppointmentStatus.PENDING, AppointmentStatus.CANCELLED), true);
  assert.equal(canTransitionAppointment(Role.PATIENT, AppointmentStatus.CONFIRMED, AppointmentStatus.CANCELLED), true);
  assert.equal(canTransitionAppointment(Role.PATIENT, AppointmentStatus.CONFIRMED, AppointmentStatus.COMPLETED), false);

  // Doctor transitions
  assert.equal(canTransitionAppointment(Role.DOCTOR, AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED), true);
  assert.equal(canTransitionAppointment(Role.DOCTOR, AppointmentStatus.CONFIRMED, AppointmentStatus.IN_PROGRESS), true);
  assert.equal(canTransitionAppointment(Role.DOCTOR, AppointmentStatus.IN_PROGRESS, AppointmentStatus.COMPLETED), true);
  assert.equal(canTransitionAppointment(Role.DOCTOR, AppointmentStatus.COMPLETED, AppointmentStatus.CANCELLED), false);

  // Manager or other roles cannot transition via this function
  assert.equal(canTransitionAppointment(Role.MANAGER, AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED), false);
});

test('isThirtyMinuteBoundary checks alignment', () => {
  assert.equal(isThirtyMinuteBoundary(new Date('2026-09-25T08:00:00.000Z')), true);
  assert.equal(isThirtyMinuteBoundary(new Date('2026-09-25T08:30:00.000Z')), true);
  assert.equal(isThirtyMinuteBoundary(new Date('2026-09-25T08:15:00.000Z')), false);
  assert.equal(isThirtyMinuteBoundary(new Date('2026-09-25T08:30:05.000Z')), false);
});
