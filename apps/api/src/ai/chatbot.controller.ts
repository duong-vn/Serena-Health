import { Body, Controller, Post, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { IsString, IsUUID, Length, Matches } from 'class-validator';
import type { Response } from 'express';
import type { AuthUser } from '../auth/auth.types.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { Roles } from '../auth/roles.decorator.js';
import { ChatbotService } from './chatbot.service.js';

class ChatDto {
  @ApiProperty() @IsUUID() conversationId!: string;
  @ApiProperty({ maxLength: 4000 }) @IsString() @Length(1, 4000) @Matches(/\S/) text!: string;
}

@ApiTags('AI')
@ApiBearerAuth()
@Roles('PATIENT')
@Controller('ai')
export class ChatbotController {
  constructor(private readonly chatbot: ChatbotService) {}

  @Post('chat')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @ApiOperation({ summary: 'Stream Serene guidance using the AI SDK UI message protocol. Only latest user text is accepted.' })
  chat(@CurrentUser() user: AuthUser, @Body() input: ChatDto, @Res() response: Response) {
    return this.chatbot.chat(user, input.conversationId, input.text, response);
  }
}
