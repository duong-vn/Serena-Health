import { Body, Controller, Get, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../auth/current-user.decorator.js';
import type { AuthUser } from '../auth/auth.types.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import { ProfileService } from './profile.service.js';

@ApiTags('profile')
@ApiBearerAuth()
@Controller('profile')
export class ProfileController {
  constructor(private readonly profile: ProfileService) {}
  @Get() get(@CurrentUser() user: AuthUser) { return this.profile.get(user.id); }
  @Patch() update(@CurrentUser() user: AuthUser, @Body() input: UpdateProfileDto) { return this.profile.update(user.id, input); }
}
