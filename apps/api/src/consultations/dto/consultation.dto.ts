import { IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class EscalateDto {
  @IsUUID() conversationId!: string;
  @IsString() @MinLength(1) @MaxLength(4_000) summary!: string;
  @IsString() @MinLength(1) @MaxLength(2_000) reason!: string;
}

export class NotesDto {
  @IsString() @MaxLength(10_000) notes!: string;
}

export class CompleteDto {
  @IsOptional() @IsString() @MaxLength(10_000) notes?: string;
}

export class SendMessageDto {
  @IsString() @MinLength(1) @MaxLength(4_000) content!: string;
}
