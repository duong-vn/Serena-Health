import { ForbiddenException, Injectable } from '@nestjs/common';
import { tool } from 'ai';
import { z } from 'zod';
import { AppointmentsService } from '../appointments/appointments.service.js';
import type { AuthUser } from '../auth/auth.types.js';
import { CatalogService } from '../catalog/catalog.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

const id = z.string().uuid();
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

@Injectable()
export class AiToolsService {
  constructor(
    private readonly catalog: CatalogService,
    private readonly appointments: AppointmentsService,
    private readonly prisma: PrismaService,
  ) {}

  forPatient(user: AuthUser) {
    if (user.role !== 'PATIENT') throw new ForbiddenException();
    return {
      getServices: tool({
        description: 'List real clinic medical services.',
        inputSchema: z.object({}),
        execute: () => this.catalog.services(),
      }),
      findDoctors: tool({
        description: 'Find available clinic doctors using real catalog data.',
        inputSchema: z.object({ search: z.string().max(100).optional() }),
        execute: ({ search }) => this.catalog.findDoctors({ search }),
      }),
      getDoctorDetails: tool({
        description: 'Read a doctor profile from the clinic catalog.',
        inputSchema: z.object({ doctorId: id }),
        execute: ({ doctorId }) => this.catalog.doctor(doctorId),
      }),
      getDoctorAvailability: tool({
        description: 'Get a doctor schedule on a YYYY-MM-DD clinic-local date.',
        inputSchema: z.object({ doctorId: id, date }),
        execute: ({ doctorId, date }) => this.catalog.availability(doctorId, date),
      }),
      getAvailableAppointmentSlots: tool({
        description: 'Check real free appointment slots. This does not reserve or book.',
        inputSchema: z.object({ doctorId: id, date }),
        execute: ({ doctorId, date }) => this.appointments.slots(doctorId, date),
      }),
      getCurrentPatientProfile: tool({
        description: 'Read only the authenticated patient’s self-reported health profile.',
        inputSchema: z.object({}),
        execute: () => this.prisma.patientProfile.findUnique({ where: { userId: user.id } }),
      }),
      requestDoctorEscalation: tool({
        description: 'Prepare a human-care proposal only. Patient must explicitly confirm in the interface; this does not contact a doctor.',
        inputSchema: z.object({ reason: z.string().min(1).max(500), summary: z.string().min(1).max(2000) }),
        execute: async ({ reason, summary }) => ({
          requiresConfirmation: true,
          reason,
          summary: `AI-generated summary of patient-reported information, not confirmed medical facts:\n${summary}`,
          instruction: 'Use the patient interface confirmation button to request a doctor.',
        }),
      }),
    };
  }
}
