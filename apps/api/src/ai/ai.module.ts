import { Module } from '@nestjs/common';
import { AdminSettingsModule } from '../admin-settings/admin-settings.module.js';
import { AppointmentsModule } from '../appointments/appointments.module.js';
import { CatalogModule } from '../catalog/catalog.module.js';
import { AiToolsService } from './ai-tools.service.js';
import { ChatbotController } from './chatbot.controller.js';
import { ChatbotService } from './chatbot.service.js';

@Module({
  imports: [CatalogModule, AppointmentsModule, AdminSettingsModule],
  controllers: [ChatbotController],
  providers: [ChatbotService, AiToolsService],
})
export class AiModule {}
