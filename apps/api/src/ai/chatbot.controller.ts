import { Body, Controller, Post, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Throttle } from '@nestjs/throttler';
import { ArrayMaxSize, IsArray, IsIn, IsString, IsUUID, Length, Matches, ValidateNested } from 'class-validator';
import { Public } from '../auth/public.decorator.js';
import type { Response } from 'express';
import type { AuthUser } from '../auth/auth.types.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { Roles } from '../auth/roles.decorator.js';
import { ChatbotService } from './chatbot.service.js';

class ChatDto {
  @ApiProperty() @IsUUID() conversationId!: string;
  @ApiProperty({ maxLength: 4000 }) @IsString() @Length(1, 4000) @Matches(/\S/) text!: string;
}

class GuestMessageDto {
  @ApiProperty({ enum: ['user', 'assistant'] }) @IsIn(['user', 'assistant']) role!: 'user' | 'assistant';
  @ApiProperty({ maxLength: 4000 }) @IsString() @Length(1, 4000) @Matches(/\S/) content!: string;
}

export class GuestChatDto {
  @ApiProperty({ maxLength: 4000 }) @IsString() @Length(1, 4000) @Matches(/\S/) text!: string;
  @ApiProperty({ type: [GuestMessageDto], maxItems: 12 })
  @IsArray() @ArrayMaxSize(12) @ValidateNested({ each: true }) @Type(() => GuestMessageDto)
  history!: GuestMessageDto[];
}

@ApiTags('AI')
@ApiBearerAuth()
@Roles('PATIENT')
@Controller('ai')
export class ChatbotController {
  constructor(private readonly chatbot: ChatbotService) {}

  @Public()
  @Roles()
  @Post('guest/chat')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({ summary: 'Temporary guest health guidance. No account, conversation persistence or tools.' })
  guestChat(@Body() input: GuestChatDto, @Res() response: Response) {
    return this.chatbot.guestChat(input.text, input.history, response);
  }

  @Post('chat')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @ApiOperation({ summary: 'Stream Serene guidance using the AI SDK UI message protocol. Only latest user text is accepted.' })
  chat(@CurrentUser() user: AuthUser, @Body() input: ChatDto, @Res() response: Response) {
    return this.chatbot.chat(user, input.conversationId, input.text, response);
  }
}
