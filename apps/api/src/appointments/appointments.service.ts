import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';

import type { AuthUser } from '../auth/auth.types.js';
import { CatalogService } from '../catalog/catalog.service.js';
import { AppointmentStatus, Prisma, Role } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { canTransitionAppointment, isThirtyMinuteBoundary } from './booking-policy.js';
import type { CreateAppointmentDto } from './dto/create-appointment.dto.js';
import type { UpdateAppointmentDto } from './dto/update-appointment.dto.js';

const appointmentInclude = {
  patient: { select: { id: true, fullName: true, phone: true, gender: true, birthday: true } },
  doctor: { select: { id: true, user: { select: { fullName: true } } } },
  service: { select: { id: true, name: true, specialty: true } },
} satisfies Prisma.AppointmentInclude;

@Injectable()
export class AppointmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly catalog: CatalogService,
  ) {}

  slots(doctorId: string, date: string) {
    return this.catalog.availability(doctorId, date);
  }

  list(actor: AuthUser) {
    if (actor.role === Role.PATIENT) {
      return this.prisma.appointment.findMany({ where: { patientId: actor.id }, include: appointmentInclude, orderBy: { startAt: 'desc' } });
    }
    if (actor.role === Role.DOCTOR) {
      return this.prisma.appointment.findMany({ where: { doctor: { userId: actor.id } }, include: appointmentInclude, orderBy: { startAt: 'desc' } });
    }
    throw new ForbiddenException('Appointments are unavailable for this role');
  }

  async create(patientId: string, input: CreateAppointmentDto) {
    if (input.startAt <= new Date() || !isThirtyMinuteBoundary(input.startAt)) throw new BadRequestException('startAt must be a future 30-minute boundary');
    const date = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit' }).format(input.startAt);
    const availability = await this.slots(input.doctorId, date);
    const selected = availability.slots.find((slot) => new Date(slot.startAt).getTime() === input.startAt.getTime());
    if (!selected?.available) throw new ConflictException('Appointment slot is unavailable');

    try {
      return await this.prisma.appointment.create({
        data: { patientId, doctorId: input.doctorId, serviceId: input.serviceId, startAt: input.startAt, endAt: new Date(input.startAt.getTime() + 30 * 60_000), reason: input.reason },
        include: appointmentInclude,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && (error.code === 'P2002' || error.code === 'P2034')) {
        throw new ConflictException('Appointment slot was just booked');
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') throw new BadRequestException('Doctor or service does not exist');
      throw error;
    }
  }

  async cancel(patientId: string, id: string) {
    const appointment = await this.prisma.appointment.findFirst({ where: { id, patientId } });
    if (!appointment) throw new NotFoundException('Appointment not found');
    if (!canTransitionAppointment(Role.PATIENT, appointment.status, AppointmentStatus.CANCELLED)) throw new ConflictException('Appointment cannot be cancelled');
    return this.prisma.appointment.update({ where: { id }, data: { status: AppointmentStatus.CANCELLED }, include: appointmentInclude });
  }

  async update(actor: AuthUser, id: string, input: UpdateAppointmentDto) {
    const appointment = await this.prisma.appointment.findUnique({ where: { id }, include: { doctor: { select: { userId: true } } } });
    if (!appointment) throw new NotFoundException('Appointment not found');
    const owns = actor.role === Role.PATIENT ? appointment.patientId === actor.id : actor.role === Role.DOCTOR && appointment.doctor.userId === actor.id;
    if (!owns) throw new NotFoundException('Appointment not found');
    if (input.status && !canTransitionAppointment(actor.role, appointment.status, input.status)) throw new ConflictException('Invalid appointment status transition');
    if (input.notes !== undefined && actor.role !== Role.DOCTOR) throw new ForbiddenException('Only the assigned doctor may update notes');
    return this.prisma.appointment.update({ where: { id }, data: input, include: appointmentInclude });
  }
}
