const TIME_ZONE_OFFSET = '+07:00';
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

export interface ScheduleWindow {
  startTime: string;
  endTime: string;
}

export interface Slot {
  startAt: string;
  endAt: string;
  available: boolean;
}

function localInstant(date: string, time: string): Date {
  if (!DATE_PATTERN.test(date) || !TIME_PATTERN.test(time)) throw new Error('Invalid date or time');
  const instant = new Date(`${date}T${time}:00${TIME_ZONE_OFFSET}`);
  if (Number.isNaN(instant.getTime())) throw new Error('Invalid date or time');
  return instant;
}

export function buildSlots(date: string, windows: ScheduleWindow[], bookedStarts: ReadonlySet<number>, now = new Date()): Slot[] {
  const slots: Slot[] = [];
  for (const window of windows) {
    const end = localInstant(date, window.endTime);
    for (let start = localInstant(date, window.startTime); start.getTime() + 30 * 60_000 <= end.getTime(); start = new Date(start.getTime() + 30 * 60_000)) {
      const slotEnd = new Date(start.getTime() + 30 * 60_000);
      slots.push({ startAt: start.toISOString(), endAt: slotEnd.toISOString(), available: start > now && !bookedStarts.has(start.getTime()) });
    }
  }
  return slots;
}

export function clinicDayOfWeek(date: string): number {
  return localInstant(date, '12:00').getUTCDay();
}
