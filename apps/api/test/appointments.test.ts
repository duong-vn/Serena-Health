import assert from 'node:assert/strict';
import test from 'node:test';
import { buildSlots, clinicDayOfWeek } from '../src/appointments/availability.js';
import { canTransitionAppointment, isThirtyMinuteBoundary } from '../src/appointments/booking-policy.js';
import { AppointmentStatus, Role } from '../src/generated/prisma/client.js';

test('availability slot generation respects 30-minute boundaries and bookings', () => {
  const date = '2026-05-11';
  const windows = [{ startTime: '08:00', endTime: '10:00' }];

  // 08:00-08:30 booked
  const bookedTime = new Date('2026-05-11T08:00:00+07:00').getTime();
  const bookedStarts = new Set([bookedTime]);

  const pastNow = new Date('2026-05-11T07:00:00+07:00');
  const slots = buildSlots(date, windows, bookedStarts, pastNow);

  assert.equal(slots.length, 4, '08:00-10:00 in 30min slots should produce 4 slots');
  assert.equal(slots[0].available, false, 'Booked slot must be unavailable');
  assert.equal(slots[1].available, true, 'Unbooked slot must be available');
  assert.equal(slots[2].available, true);
  assert.equal(slots[3].available, true);

  // Past slots are marked unavailable
  const futureNow = new Date('2026-05-11T09:15:00+07:00');
  const futureSlots = buildSlots(date, windows, new Set(), futureNow);
  assert.equal(futureSlots[0].available, false, '08:00 in the past must be unavailable');
  assert.equal(futureSlots[1].available, false, '08:30 in the past must be unavailable');
  assert.equal(futureSlots[2].available, false, '09:00 in the past must be unavailable');
  assert.equal(futureSlots[3].available, true, '09:30 in the future must be available');
});

test('clinicDayOfWeek calculates correct day of week in Asia/Ho_Chi_Minh', () => {
  // 2026-05-11 is a Monday (1)
  assert.equal(clinicDayOfWeek('2026-05-11'), 1);
  // 2026-05-17 is a Sunday (0)
  assert.equal(clinicDayOfWeek('2026-05-17'), 0);
});

test('isThirtyMinuteBoundary validates minute and second precision', () => {
  assert.equal(isThirtyMinuteBoundary(new Date('2026-05-11T08:00:00.000Z')), true);
  assert.equal(isThirtyMinuteBoundary(new Date('2026-05-11T08:30:00.000Z')), true);
  assert.equal(isThirtyMinuteBoundary(new Date('2026-05-11T08:15:00.000Z')), false);
  assert.equal(isThirtyMinuteBoundary(new Date('2026-05-11T08:00:01.000Z')), false);
});

test('appointment transition matrix strictly enforces role permissions', () => {
  // Patient can only cancel pending or confirmed
  assert.equal(canTransitionAppointment(Role.PATIENT, AppointmentStatus.PENDING, AppointmentStatus.CANCELLED), true);
  assert.equal(canTransitionAppointment(Role.PATIENT, AppointmentStatus.CONFIRMED, AppointmentStatus.CANCELLED), true);
  assert.equal(canTransitionAppointment(Role.PATIENT, AppointmentStatus.IN_PROGRESS, AppointmentStatus.CANCELLED), false);
  assert.equal(canTransitionAppointment(Role.PATIENT, AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED), false);

  // Doctor can confirm, start, complete or cancel
  assert.equal(canTransitionAppointment(Role.DOCTOR, AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED), true);
  assert.equal(canTransitionAppointment(Role.DOCTOR, AppointmentStatus.CONFIRMED, AppointmentStatus.IN_PROGRESS), true);
  assert.equal(canTransitionAppointment(Role.DOCTOR, AppointmentStatus.IN_PROGRESS, AppointmentStatus.COMPLETED), true);
  assert.equal(canTransitionAppointment(Role.DOCTOR, AppointmentStatus.COMPLETED, AppointmentStatus.PENDING), false);

  // Manager/Expert cannot transition appointments directly
  assert.equal(canTransitionAppointment(Role.MANAGER, AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED), false);
  assert.equal(canTransitionAppointment(Role.EXPERT, AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED), false);
});
