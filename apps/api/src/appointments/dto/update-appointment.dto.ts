import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

import { AppointmentStatus } from '../../generated/prisma/client.js';

export class UpdateAppointmentDto {
  @IsOptional() @IsEnum(AppointmentStatus) status?: AppointmentStatus;
  @IsOptional() @IsString() @MaxLength(4_000) notes?: string;
}
