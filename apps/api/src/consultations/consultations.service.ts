import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';

import type { AuthUser } from '../auth/auth.types.js';
import { ConsultationStatus, MessageRole, Prisma, Role } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CompleteDto, EscalateDto, NotesDto } from './dto/consultation.dto.js';

const listInclude = {
  conversation: { select: { id: true, title: true } },
  patient: { select: { id: true, fullName: true, phone: true, gender: true, birthday: true, patientProfile: { select: { allergies: true, medicalHistory: true, bloodType: true } } } },
  doctor: { select: { id: true, user: { select: { fullName: true } } } },
} satisfies Prisma.ConsultationInclude;

@Injectable()
export class ConsultationsService {
  constructor(private readonly prisma: PrismaService) {}

  list(actor: AuthUser) {
    const where: Prisma.ConsultationWhereInput = actor.role === Role.PATIENT
      ? { patientId: actor.id }
      : actor.role === Role.DOCTOR
        ? { doctor: { userId: actor.id } }
        : actor.role === Role.MANAGER
          ? {}
          : { id: '__not_authorized__' };
    if (actor.role === Role.EXPERT) throw new ForbiddenException();
    return this.prisma.consultation.findMany({ where, include: listInclude, orderBy: { updatedAt: 'desc' } });
  }

  async escalate(patientId: string, input: EscalateDto) {
    return this.prisma.$transaction(async (tx) => {
      const conversation = await tx.conversation.findFirst({ where: { id: input.conversationId, patientId }, select: { id: true, generationExpiresAt: true } });
      if (!conversation) throw new NotFoundException('Conversation not found');
      if (conversation.generationExpiresAt && conversation.generationExpiresAt > new Date()) throw new ConflictException('Wait for the current AI response to finish');
      const existing = await tx.consultation.findUnique({ where: { conversationId: conversation.id } });
      if (existing && existing.status !== ConsultationStatus.AI_CHAT) throw new ConflictException('Conversation is already escalated');
      if (existing) return tx.consultation.update({ where: { id: existing.id }, data: { status: ConsultationStatus.ESCALATION_REQUESTED, summary: input.summary, reason: input.reason }, include: listInclude });
      return tx.consultation.create({ data: { conversationId: conversation.id, patientId, status: ConsultationStatus.ESCALATION_REQUESTED, summary: input.summary, reason: input.reason }, include: listInclude });
    });
  }

  async claim(doctorUserId: string, id: string) {
    const doctor = await this.prisma.doctorProfile.findFirst({ where: { userId: doctorUserId, active: true }, select: { id: true } });
    if (!doctor) throw new ForbiddenException('Active doctor profile required');
    const updated = await this.prisma.consultation.updateMany({ where: { id, status: ConsultationStatus.ESCALATION_REQUESTED, doctorId: null }, data: { doctorId: doctor.id, status: ConsultationStatus.ASSIGNED_TO_DOCTOR } });
    if (updated.count !== 1) throw new ConflictException('Consultation is unavailable');
    return this.getOwnedDoctorConsultation(doctorUserId, id);
  }

  async notes(doctorUserId: string, id: string, input: NotesDto) {
    const consultation = await this.getOwnedDoctorConsultation(doctorUserId, id);
    if (consultation.status === ConsultationStatus.COMPLETED) throw new ConflictException('Consultation is completed');
    return this.prisma.consultation.update({ where: { id }, data: { notes: input.notes, status: ConsultationStatus.DOCTOR_CHAT }, include: listInclude });
  }

  async complete(doctorUserId: string, id: string, input: CompleteDto) {
    const consultation = await this.getOwnedDoctorConsultation(doctorUserId, id);
    if (consultation.status === ConsultationStatus.COMPLETED) throw new ConflictException('Consultation is already completed');
    return this.prisma.consultation.update({ where: { id }, data: { status: ConsultationStatus.COMPLETED, completedAt: new Date(), ...(input.notes !== undefined ? { notes: input.notes } : {}) }, include: listInclude });
  }

  async assertParticipant(actor: AuthUser, consultationId: string) {
    const consultation = await this.prisma.consultation.findUnique({
      where: { id: consultationId },
      select: { id: true, conversationId: true, patientId: true, status: true, doctor: { select: { userId: true } } },
    });
    if (!consultation || (actor.role === Role.PATIENT ? consultation.patientId !== actor.id : actor.role === Role.DOCTOR ? consultation.doctor?.userId !== actor.id : true)) {
      throw new NotFoundException('Consultation not found');
    }
    if (consultation.status !== ConsultationStatus.ASSIGNED_TO_DOCTOR && consultation.status !== ConsultationStatus.DOCTOR_CHAT) {
      throw new ConflictException('Human chat is not active');
    }
    return consultation;
  }

  async messages(actor: AuthUser, consultationId: string) {
    const consultation = await this.assertParticipant(actor, consultationId);
    return this.prisma.message.findMany({ where: { conversationId: consultation.conversationId }, orderBy: [{ createdAt: 'asc' }, { id: 'asc' }] });
  }

  async sendMessage(actor: AuthUser, consultationId: string, content: string) {
    const consultation = await this.assertParticipant(actor, consultationId);
    return this.prisma.message.create({
      data: { conversationId: consultation.conversationId, senderUserId: actor.id, role: actor.role === Role.DOCTOR ? MessageRole.DOCTOR : MessageRole.USER, content: content.trim(), parts: [{ type: 'text', text: content.trim() }] },
    });
  }

  private async getOwnedDoctorConsultation(doctorUserId: string, id: string) {
    const consultation = await this.prisma.consultation.findFirst({ where: { id, doctor: { userId: doctorUserId } }, include: listInclude });
    if (!consultation) throw new NotFoundException('Consultation not found');
    return consultation;
  }
}
