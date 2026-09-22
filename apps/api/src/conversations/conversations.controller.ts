import { Body, Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

import { CurrentUser } from '../auth/current-user.decorator.js';
import type { AuthUser } from '../auth/auth.types.js';
import { Roles } from '../auth/roles.decorator.js';
import { Role } from '../generated/prisma/client.js';
import { ConversationsService } from './conversations.service.js';

class CreateConversationDto {
  @IsString() @MinLength(1) @MaxLength(200) title!: string;
}

@ApiTags('conversations')
@ApiBearerAuth()
@Roles(Role.PATIENT)
@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversations: ConversationsService) {}
  @Get() list(@CurrentUser() user: AuthUser) { return this.conversations.list(user.id); }
  @Post() create(@CurrentUser() user: AuthUser, @Body() input: CreateConversationDto) { return this.conversations.create(user.id, input.title); }
  @Get(':id/messages') messages(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) { return this.conversations.messages(user.id, id); }
}
