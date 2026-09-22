import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

import { Public } from '../auth/public.decorator.js';
import { CatalogService } from './catalog.service.js';

class DoctorSearchDto {
  @IsOptional() @IsUUID() clinicId?: string;
  @IsOptional() @IsUUID() serviceId?: string;
  @IsOptional() @IsString() @MaxLength(120) specialty?: string;
  @IsOptional() @IsString() @MaxLength(160) search?: string;
}

class AvailabilityQueryDto {
  @IsString() date!: string;
}

@ApiTags('catalog')
@Public()
@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalog: CatalogService) {}
  @Get('clinics') clinics() { return this.catalog.clinics(); }
  @Get('services') services() { return this.catalog.services(); }
  @Get('doctors') doctors(@Query() query: DoctorSearchDto) { return this.catalog.findDoctors(query); }
  @Get('doctors/:id') doctor(@Param('id', ParseUUIDPipe) id: string) { return this.catalog.doctor(id); }
  @Get('doctors/:id/availability') availability(@Param('id', ParseUUIDPipe) id: string, @Query() query: AvailabilityQueryDto) { return this.catalog.availability(id, query.date); }
}
