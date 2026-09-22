import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';

import { Prisma, ReviewStatus } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CreateReviewDto, UpdateReviewDto } from './dto/review.dto.js';

const reviewInclude = {
  conversation: { select: { id: true, title: true, patientId: true } },
  reviewer: { select: { id: true, fullName: true } },
} satisfies Prisma.ExpertReviewInclude;

@Injectable()
export class ExpertService {
  constructor(private readonly prisma: PrismaService) {}

  reviews(reviewerId: string, status?: ReviewStatus) {
    return this.prisma.expertReview.findMany({
      where: { reviewerId, ...(status ? { status } : {}) },
      include: reviewInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(reviewerId: string, input: CreateReviewDto) {
    try {
      return await this.prisma.expertReview.create({
        data: { conversationId: input.conversationId, reviewerId, notes: input.notes, flagReason: input.flagReason },
        include: reviewInclude,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') throw new ConflictException('Review already exists for this conversation');
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') throw new NotFoundException('Conversation not found');
      throw error;
    }
  }

  async update(reviewerId: string, id: string, input: UpdateReviewDto) {
    const review = await this.prisma.expertReview.findFirst({ where: { id, reviewerId } });
    if (!review) throw new NotFoundException('Review not found');
    const resolved = input.status === ReviewStatus.RESOLVED ? { resolvedAt: new Date() } : {};
    return this.prisma.expertReview.update({ where: { id }, data: { ...input, ...resolved }, include: reviewInclude });
  }
}
