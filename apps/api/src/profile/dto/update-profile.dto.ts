import { Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsDate, IsEnum, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

import { Gender } from '../../generated/prisma/client.js';

export class UpdateProfileDto {
  @IsOptional() @IsString() @MinLength(2) @MaxLength(160) fullName?: string;
  @IsOptional() @Matches(/^\+?[0-9]{8,15}$/) phone?: string;
  @IsOptional() @IsEnum(Gender) gender?: Gender;
  @IsOptional() @Type(() => Date) @IsDate() birthday?: Date;
  @IsOptional() @IsString() @MaxLength(500) address?: string;
  @IsOptional() @IsString() @MaxLength(8) bloodType?: string;
  @IsOptional() @IsArray() @ArrayMaxSize(50) @IsString({ each: true }) @MaxLength(500, { each: true }) allergies?: string[];
  @IsOptional() @IsArray() @ArrayMaxSize(50) @IsString({ each: true }) @MaxLength(500, { each: true }) medicalHistory?: string[];
}
