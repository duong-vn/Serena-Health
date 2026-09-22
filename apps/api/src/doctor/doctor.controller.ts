import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../auth/current-user.decorator.js';
import type { AuthUser } from '../auth/auth.types.js';
import { Roles } from '../auth/roles.decorator.js';
import { ConsultationStatus, Role } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';

@ApiTags('doctor')
@ApiBearerAuth()
@Roles(Role.DOCTOR)
@Controller('doctor')
export class DoctorController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('patients')
  async patients(@CurrentUser() user: AuthUser) {
    const profile = await this.prisma.doctorProfile.findFirst({ where: { userId: user.id, active: true }, select: { id: true } });
    if (!profile) return [];
    const consultations = await this.prisma.consultation.findMany({
      where: { doctorId: profile.id },
      select: { patientId: true },
      distinct: ['patientId'],
    });
    const patientIds = consultations.map((c) => c.patientId);
    if (!patientIds.length) return [];
    return this.prisma.user.findMany({
      where: { id: { in: patientIds } },
      select: { id: true, fullName: true, phone: true, gender: true, birthday: true, email: true, patientProfile: { select: { allergies: true, medicalHistory: true, bloodType: true, address: true } } },
    });
  }

  @Get('schedule')
  async schedule(@CurrentUser() user: AuthUser) {
    const profile = await this.prisma.doctorProfile.findFirst({ where: { userId: user.id, active: true }, select: { id: true } });
    if (!profile) return [];
    return this.prisma.doctorSchedule.findMany({ where: { doctorId: profile.id, active: true }, orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }] });
  }

  @Get('consultations')
  async consultations(@CurrentUser() user: AuthUser) {
    const profile = await this.prisma.doctorProfile.findFirst({ where: { userId: user.id, active: true }, select: { id: true } });
    if (!profile) return [];
    return this.prisma.consultation.findMany({
      where: { doctorId: profile.id },
      include: {
        conversation: { select: { id: true, title: true } },
        patient: { select: { id: true, fullName: true, phone: true, gender: true, birthday: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }
}
