import { Type } from 'class-transformer';
import { IsDate, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateAppointmentDto {
  @IsUUID() doctorId!: string;
  @IsUUID() serviceId!: string;
  @Type(() => Date) @IsDate() startAt!: Date;
  @IsOptional() @IsString() @MaxLength(2_000) reason?: string;
}
