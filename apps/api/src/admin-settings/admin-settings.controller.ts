import { Body, Controller, Get, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsIn, IsString } from 'class-validator';
import { Roles } from '../auth/roles.decorator.js';
import { Role } from '../generated/prisma/client.js';
import { AdminSettingsService, CHATBOT_MODELS } from './admin-settings.service.js';

export class UpdateModelDto {
  @IsString()
  @IsIn([...CHATBOT_MODELS])
  model!: string;
}

@ApiTags('admin-settings')
@ApiBearerAuth()
@Roles(Role.MANAGER)
@Controller('admin/settings')
export class AdminSettingsController {
  constructor(private readonly settings: AdminSettingsService) {}

  @Get('model') getModel() { return this.settings.getModel(); }

  @Put('model') updateModel(@Body() input: UpdateModelDto) { return this.settings.updateModel(input.model); }
}
