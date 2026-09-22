import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../auth/current-user.decorator.js';
import type { AuthUser } from '../auth/auth.types.js';
import { Roles } from '../auth/roles.decorator.js';
import { ReviewStatus, Role } from '../generated/prisma/client.js';
import { ConversationsService } from '../conversations/conversations.service.js';
import { CreateReviewDto, UpdateReviewDto } from './dto/review.dto.js';
import { ExpertService } from './expert.service.js';

@ApiTags('expert')
@ApiBearerAuth()
@Roles(Role.EXPERT)
@Controller('expert')
export class ExpertController {
  constructor(
    private readonly expert: ExpertService,
    private readonly conversationService: ConversationsService,
  ) {}

  @Get('reviews') reviews(@CurrentUser() user: AuthUser, @Query('status') status?: ReviewStatus) { return this.expert.reviews(user.id, status); }
  @Post('reviews') create(@CurrentUser() user: AuthUser, @Body() input: CreateReviewDto) { return this.expert.create(user.id, input); }
  @Patch('reviews/:id') update(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string, @Body() input: UpdateReviewDto) { return this.expert.update(user.id, id, input); }
  @Get('conversations') conversations() { return this.conversationService.expertList(); }
  @Get('conversations/:id/messages') messages(@Param('id', ParseUUIDPipe) id: string) { return this.conversationService.expertMessages(id); }
}
