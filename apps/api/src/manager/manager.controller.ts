import { Body, Controller, Delete, Get, NotFoundException, Param, ParseIntPipe, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNumber, IsOptional, IsString, Matches, MaxLength, Min, MinLength } from 'class-validator';

import { Roles } from '../auth/roles.decorator.js';
import { Gender, Role } from '../generated/prisma/client.js';
import { ManagerService } from './manager.service.js';

class CreateDoctorDto {
  @IsEmail() @MaxLength(255) email!: string;
  @IsString() @MinLength(10) @MaxLength(128) password!: string;
  @IsString() @MinLength(2) @MaxLength(160) fullName!: string;
  @IsOptional() @Matches(/^\+?[0-9]{8,15}$/) phone?: string;
  @IsString() clinicId!: string;
  @IsString() serviceId!: string;
  @IsString() @MaxLength(100) licenseNumber!: string;
  @IsOptional() @IsString() @MaxLength(255) degree?: string;
  @IsOptional() @IsString() @MaxLength(4_000) biography?: string;
  @IsOptional() @IsString() @MaxLength(500) address?: string;
  @IsOptional() @IsString() @MaxLength(20) avatarColor?: string;
  @IsOptional() @IsNumber() @Min(0) yearsExperience?: number;
  @IsOptional() @IsNumber() @Min(0) consultationFee?: number;
  @IsOptional() @IsNumber() @Min(0) examinationFee?: number;
  @IsOptional() @IsEnum(Gender) gender?: string;
  @IsOptional() @IsString() birthday?: string;
}

@ApiTags('manager')
@ApiBearerAuth()
@Roles(Role.MANAGER)
@Controller('manager')
export class ManagerController {
  constructor(private readonly manager: ManagerService) {}

  @Get('dashboard') dashboard() { return this.manager.dashboard(); }

  @Get('doctors') doctors(@Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    return this.manager.doctorsList(page ? Number(page) : 1, pageSize ? Number(pageSize) : 20);
  }

  @Post('doctors') createDoctor(@Body() input: CreateDoctorDto) { return this.manager.createDoctor(input); }

  @Patch('doctors/:id') updateDoctor(@Param('id', ParseUUIDPipe) id: string, @Body() input: Record<string, unknown>) { return this.manager.updateDoctor(id, input); }

  @Delete('doctors/:id') async deleteDoctor(@Param('id', ParseUUIDPipe) id: string) {
    try { await this.manager.deactivateDoctor(id); } catch { throw new NotFoundException('Doctor not found'); }
  }
}
