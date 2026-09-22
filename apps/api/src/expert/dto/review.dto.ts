import { IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

import { ReviewStatus } from '../../generated/prisma/client.js';

export class CreateReviewDto {
  @IsString() conversationId!: string;
  @IsString() @MinLength(1) @MaxLength(10_000) notes!: string;
  @IsOptional() @IsString() @MaxLength(255) flagReason?: string;
}

export class UpdateReviewDto {
  @IsOptional() @IsString() @MaxLength(10_000) notes?: string;
  @IsOptional() @IsEnum(ReviewStatus) status?: ReviewStatus;
  @IsOptional() @IsString() @MaxLength(10_000) resolution?: string;
}
