import { Injectable, NotFoundException } from '@nestjs/common';

import { Prisma, Role } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class ConversationsService {
  constructor(private readonly prisma: PrismaService) {}

  list(patientId: string) {
    return this.prisma.conversation.findMany({
      where: { patientId },
      include: { consultation: { select: { id: true, status: true, doctorId: true } }, _count: { select: { messages: true } } },
      orderBy: { updatedAt: 'desc' },
    });
  }

  create(patientId: string, title: string) {
    return this.prisma.conversation.create({ data: { patientId, title: title.trim() } });
  }

  async messages(patientId: string, id: string) {
    const conversation = await this.prisma.conversation.findFirst({ where: { id, patientId }, select: { id: true } });
    if (!conversation) throw new NotFoundException('Conversation not found');
    return this.prisma.message.findMany({ where: { conversationId: id }, orderBy: [{ createdAt: 'asc' }, { id: 'asc' }] });
  }

  expertList() {
    return this.prisma.conversation.findMany({
      include: {
        patient: { select: { id: true, fullName: true } },
        consultation: { select: { id: true, status: true } },
        reviews: { orderBy: { updatedAt: 'desc' }, take: 1 },
        messages: { orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], take: 1 },
        _count: { select: { messages: true, reviews: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async expertMessages(id: string) {
    const exists = await this.prisma.conversation.count({ where: { id } });
    if (!exists) throw new NotFoundException('Conversation not found');
    return this.prisma.message.findMany({ where: { conversationId: id }, orderBy: [{ createdAt: 'asc' }, { id: 'asc' }] });
  }
}
