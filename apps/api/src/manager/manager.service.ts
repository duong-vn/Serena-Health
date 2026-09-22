import { Injectable } from '@nestjs/common';

import { AppointmentStatus, ConsultationStatus, Role } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class ManagerService {
  constructor(private readonly prisma: PrismaService) {}

  async dashboard() {
    const now = new Date();
    const startOfDay = new Date(now.toLocaleDateString('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }) + 'T00:00:00+07:00');
    const endOfDay = new Date(now.toLocaleDateString('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }) + 'T23:59:59.999+07:00');

    const [patients, doctors, appointmentsToday, consultationStats] = await Promise.all([
      this.prisma.user.count({ where: { role: Role.PATIENT, active: true } }),
      this.prisma.doctorProfile.count({ where: { active: true } }),
      this.prisma.appointment.count({ where: { startAt: { gte: startOfDay, lte: endOfDay } } }),
      this.prisma.consultation.groupBy({ by: ['status'], _count: { id: true } }),
    ]);

    const statusCount = (s: ConsultationStatus) => consultationStats.find((r) => r.status === s)?._count.id ?? 0;
    const openConsultations = statusCount(ConsultationStatus.AI_CHAT) + statusCount(ConsultationStatus.ESCALATION_REQUESTED) + statusCount(ConsultationStatus.ASSIGNED_TO_DOCTOR) + statusCount(ConsultationStatus.DOCTOR_CHAT);
    const completedConsultations = statusCount(ConsultationStatus.COMPLETED);

    const appointmentsByStatus = await this.prisma.appointment.groupBy({ by: ['status'], _count: { id: true } });

    return {
      patients,
      doctors,
      appointmentsToday,
      openConsultations,
      completedConsultations,
      appointmentsByStatus: appointmentsByStatus.map((r) => ({ status: r.status, count: r._count.id })),
    };
  }

  async doctorsList(page = 1, pageSize = 20) {
    const skip = (page - 1) * pageSize;
    const [items, total] = await Promise.all([
      this.prisma.doctorProfile.findMany({
        skip, take: pageSize,
        include: {
          user: { select: { id: true, email: true, fullName: true, phone: true, gender: true, birthday: true, active: true } },
          clinic: { select: { id: true, code: true, name: true } },
          service: { select: { id: true, code: true, name: true, specialty: true } },
          schedules: { where: { active: true }, orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }] },
        },
        orderBy: { user: { fullName: 'asc' } },
      }),
      this.prisma.doctorProfile.count(),
    ]);
    return { items, total, page, pageSize };
  }

  async createDoctor(input: {
    email: string; password: string; fullName: string; phone?: string;
    clinicId: string; serviceId: string; licenseNumber: string;
    degree?: string; biography?: string; address?: string; avatarColor?: string;
    yearsExperience?: number; consultationFee?: number; examinationFee?: number;
    gender?: string; birthday?: string;
  }) {
    const { hashPassword } = await import('../auth/password.js');
    return this.prisma.user.create({
      data: {
        email: input.email.trim().toLowerCase(),
        phone: input.phone,
        fullName: input.fullName.trim(),
        passwordHash: await hashPassword(input.password),
        role: Role.DOCTOR,
        gender: input.gender as any,
        birthday: input.birthday ? new Date(input.birthday) : undefined,
        doctorProfile: {
          create: {
            clinicId: input.clinicId,
            serviceId: input.serviceId,
            licenseNumber: input.licenseNumber,
            degree: input.degree,
            biography: input.biography,
            address: input.address,
            avatarColor: input.avatarColor,
            yearsExperience: input.yearsExperience ?? 0,
            consultationFee: input.consultationFee ?? 0,
            examinationFee: input.examinationFee ?? 0,
          },
        },
      },
      select: { id: true, email: true, fullName: true, role: true, doctorProfile: { include: { clinic: true, service: true, schedules: true } } },
    });
  }

  async updateDoctor(id: string, input: Record<string, unknown>) {
    const profile = await this.prisma.doctorProfile.findUnique({ where: { id }, select: { userId: true } });
    if (!profile) throw new Error('Doctor not found');
    const { email, phone, fullName, gender, birthday, active, password, ...profileData } = input as any;
    const userData: Record<string, unknown> = {};
    if (email !== undefined) userData.email = email;
    if (phone !== undefined) userData.phone = phone;
    if (fullName !== undefined) userData.fullName = fullName;
    if (gender !== undefined) userData.gender = gender;
    if (birthday !== undefined) userData.birthday = birthday ? new Date(birthday as string) : null;
    if (active !== undefined) userData.active = active;
    if (password) {
      const { hashPassword } = await import('../auth/password.js');
      userData.passwordHash = await hashPassword(password as string);
    }
    if (Object.keys(userData).length > 0) await this.prisma.user.update({ where: { id: profile.userId }, data: userData });
    const allowedProfile = ['clinicId', 'serviceId', 'licenseNumber', 'degree', 'biography', 'address', 'avatarColor', 'yearsExperience', 'consultationFee', 'examinationFee', 'active'] as const;
    const cleanProfile: Record<string, unknown> = {};
    for (const key of allowedProfile) if (profileData[key] !== undefined) cleanProfile[key] = profileData[key];
    if (Object.keys(cleanProfile).length > 0) await this.prisma.doctorProfile.update({ where: { id }, data: cleanProfile });
    return this.prisma.doctorProfile.findUnique({
      where: { id },
      include: { user: { select: { id: true, email: true, fullName: true, phone: true, gender: true, birthday: true, active: true } }, clinic: true, service: true, schedules: { where: { active: true } } },
    });
  }

  async deactivateDoctor(id: string) {
    const profile = await this.prisma.doctorProfile.findUnique({ where: { id }, select: { userId: true } });
    if (!profile) throw new Error('Doctor not found');
    await this.prisma.$transaction([
      this.prisma.doctorProfile.update({ where: { id }, data: { active: false } }),
      this.prisma.user.update({ where: { id: profile.userId }, data: { active: false } }),
    ]);
  }
}
