import { AppointmentStatus, Role } from '../generated/prisma/client.js';

const PATIENT_TRANSITIONS: Partial<Record<AppointmentStatus, readonly AppointmentStatus[]>> = {
  PENDING: [AppointmentStatus.CANCELLED],
  CONFIRMED: [AppointmentStatus.CANCELLED],
};
const DOCTOR_TRANSITIONS: Partial<Record<AppointmentStatus, readonly AppointmentStatus[]>> = {
  PENDING: [AppointmentStatus.CONFIRMED, AppointmentStatus.CANCELLED],
  CONFIRMED: [AppointmentStatus.IN_PROGRESS, AppointmentStatus.CANCELLED],
  IN_PROGRESS: [AppointmentStatus.COMPLETED],
};

export function canTransitionAppointment(role: Role, from: AppointmentStatus, to: AppointmentStatus): boolean {
  const allowed = role === Role.PATIENT ? PATIENT_TRANSITIONS[from] : role === Role.DOCTOR ? DOCTOR_TRANSITIONS[from] : undefined;
  return allowed?.includes(to) ?? false;
}

export function isThirtyMinuteBoundary(date: Date): boolean {
  return date.getUTCSeconds() === 0 && date.getUTCMilliseconds() === 0 && date.getUTCMinutes() % 30 === 0;
}
