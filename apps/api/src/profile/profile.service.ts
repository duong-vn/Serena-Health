import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';
import type { UpdateProfileDto } from './dto/update-profile.dto.js';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async get(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, email: true, phone: true, fullName: true, gender: true, birthday: true,
        patientProfile: { select: { address: true, bloodType: true, allergies: true, medicalHistory: true } },
      },
    });
    if (!user) throw new NotFoundException('Profile not found');
    const { patientProfile, ...base } = user;
    return { ...base, address: patientProfile?.address ?? null, bloodType: patientProfile?.bloodType ?? null, allergies: patientProfile?.allergies ?? [], medicalHistory: patientProfile?.medicalHistory ?? [] };
  }

  async update(userId: string, input: UpdateProfileDto) {
    const { address, bloodType, allergies, medicalHistory, ...userData } = input;
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...userData,
        ...(address !== undefined || bloodType !== undefined || allergies !== undefined || medicalHistory !== undefined
          ? { patientProfile: { upsert: { create: { address, bloodType, allergies, medicalHistory }, update: { address, bloodType, allergies, medicalHistory } } } }
          : {}),
      },
    });
    return this.get(userId);
  }
}
