import { Transform, Type } from 'class-transformer';
import { IsDate, IsEmail, IsEnum, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

import { Gender } from '../../generated/prisma/client.js';

export class RegisterDto {
  @IsEmail()
  @MaxLength(255)
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  email!: string;

  @IsOptional()
  @IsString()
  @Matches(/^\+?[0-9]{8,15}$/)
  phone?: string;

  @IsString()
  @MinLength(2)
  @MaxLength(160)
  fullName!: string;

  @IsString()
  @MinLength(10)
  @MaxLength(128)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, { message: 'password must contain upper, lower and numeric characters' })
  password!: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  birthday?: Date;
}
