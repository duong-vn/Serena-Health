import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { buildSlots, clinicDayOfWeek } from '../appointments/availability.js';
import { AppointmentStatus, Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';

export interface DoctorSearchQuery {
  clinicId?: string;
  serviceId?: string;
  specialty?: string;
  search?: string;
}

const doctorInclude = {
  user: { select: { id: true, fullName: true, email: true, phone: true, gender: true, birthday: true } },
  clinic: { select: { id: true, code: true, name: true, address: true, phone: true } },
  service: { select: { id: true, code: true, name: true, specialty: true, description: true, durationMinutes: true, price: true } },
  schedules: { where: { active: true }, orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }] },
} satisfies Prisma.DoctorProfileInclude;

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  clinics() {
    return this.prisma.clinic.findMany({ where: { active: true }, orderBy: { name: 'asc' }, select: { id: true, code: true, name: true, address: true, phone: true } });
  }

  services() {
    return this.prisma.medicalService.findMany({ where: { active: true }, orderBy: [{ specialty: 'asc' }, { name: 'asc' }], select: { id: true, code: true, name: true, specialty: true, description: true, durationMinutes: true, price: true } });
  }

  findDoctors(query: DoctorSearchQuery = {}) {
    const search = query.search?.trim();
    return this.prisma.doctorProfile.findMany({
      where: {
        active: true,
        user: { active: true, ...(search ? { fullName: { contains: search, mode: 'insensitive' } } : {}) },
        ...(query.clinicId ? { clinicId: query.clinicId } : {}),
        ...(query.serviceId ? { serviceId: query.serviceId } : {}),
        ...(query.specialty ? { service: { specialty: { equals: query.specialty, mode: 'insensitive' } } } : {}),
      },
      include: doctorInclude,
      orderBy: { user: { fullName: 'asc' } },
    });
  }

  async doctor(id: string) {
    const doctor = await this.prisma.doctorProfile.findFirst({ where: { id, active: true, user: { active: true } }, include: doctorInclude });
    if (!doctor) throw new NotFoundException('Doctor not found');
    return doctor;
  }

  async availability(doctorId: string, date: string) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new BadRequestException('date must be YYYY-MM-DD');
    const dayOfWeek = clinicDayOfWeek(date);
    const doctor = await this.prisma.doctorProfile.findFirst({
      where: { id: doctorId, active: true, user: { active: true } },
      select: { schedules: { where: { dayOfWeek, active: true }, select: { startTime: true, endTime: true } } },
    });
    if (!doctor) throw new NotFoundException('Doctor not found');
    const localStart = new Date(`${date}T00:00:00+07:00`);
    const localEnd = new Date(`${date}T23:59:59.999+07:00`);
    const appointments = await this.prisma.appointment.findMany({
      where: { doctorId, startAt: { gte: localStart, lte: localEnd }, status: { in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED, AppointmentStatus.IN_PROGRESS] } },
      select: { startAt: true },
    });
    return { date, timezone: 'Asia/Ho_Chi_Minh', slots: buildSlots(date, doctor.schedules, new Set(appointments.map(({ startAt }) => startAt.getTime()))) };
  }
}
