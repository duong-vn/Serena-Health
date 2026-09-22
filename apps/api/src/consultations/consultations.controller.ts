import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../auth/current-user.decorator.js';
import type { AuthUser } from '../auth/auth.types.js';
import { Roles } from '../auth/roles.decorator.js';
import { Role } from '../generated/prisma/client.js';
import { ConsultationsService } from './consultations.service.js';
import { CompleteDto, EscalateDto, NotesDto, SendMessageDto } from './dto/consultation.dto.js';
import { HumanChatEvents } from './human-chat.events.js';

@ApiTags('consultations')
@ApiBearerAuth()
@Controller('consultations')
export class ConsultationsController {
  constructor(
    private readonly consultations: ConsultationsService,
    private readonly events: HumanChatEvents,
  ) {}

  @Roles(Role.PATIENT, Role.DOCTOR, Role.MANAGER)
  @Get()
  list(@CurrentUser() user: AuthUser) { return this.consultations.list(user); }

  @Roles(Role.PATIENT)
  @Post('escalate')
  escalate(@CurrentUser() user: AuthUser, @Body() input: EscalateDto) { return this.consultations.escalate(user.id, input); }

  @Roles(Role.DOCTOR)
  @Patch(':id/claim')
  claim(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) { return this.consultations.claim(user.id, id); }

  @Roles(Role.DOCTOR)
  @Patch(':id/notes')
  notes(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string, @Body() input: NotesDto) { return this.consultations.notes(user.id, id, input); }

  @Roles(Role.DOCTOR)
  @Patch(':id/complete')
  complete(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string, @Body() input: CompleteDto) { return this.consultations.complete(user.id, id, input); }

  @Roles(Role.PATIENT, Role.DOCTOR)
  @Get(':id/messages')
  messages(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) { return this.consultations.messages(user, id); }

  @Roles(Role.PATIENT, Role.DOCTOR)
  @Post(':id/messages')
  async send(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string, @Body() input: SendMessageDto) {
    const message = await this.consultations.sendMessage(user, id, input.content);
    this.events.publish({ consultationId: id, message });
    return message;
  }
}
