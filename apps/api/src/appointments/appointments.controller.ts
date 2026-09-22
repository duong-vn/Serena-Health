import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../auth/current-user.decorator.js';
import type { AuthUser } from '../auth/auth.types.js';
import { Roles } from '../auth/roles.decorator.js';
import { Role } from '../generated/prisma/client.js';
import { AppointmentsService } from './appointments.service.js';
import { CreateAppointmentDto } from './dto/create-appointment.dto.js';
import { UpdateAppointmentDto } from './dto/update-appointment.dto.js';

@ApiTags('appointments')
@ApiBearerAuth()
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointments: AppointmentsService) {}
  @Roles(Role.PATIENT, Role.DOCTOR) @Get() list(@CurrentUser() user: AuthUser) { return this.appointments.list(user); }
  @Roles(Role.PATIENT) @Post() create(@CurrentUser() user: AuthUser, @Body() input: CreateAppointmentDto) { return this.appointments.create(user.id, input); }
  @Roles(Role.PATIENT) @Patch(':id/cancel') cancel(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) { return this.appointments.cancel(user.id, id); }
  @Roles(Role.PATIENT, Role.DOCTOR) @Patch(':id') update(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string, @Body() input: UpdateAppointmentDto) { return this.appointments.update(user, id, input); }
}
