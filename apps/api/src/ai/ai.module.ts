import { Module } from '@nestjs/common';
import { AppointmentsModule } from '../appointments/appointments.module.js';
import { CatalogModule } from '../catalog/catalog.module.js';
import { AiToolsService } from './ai-tools.service.js';
import { ChatbotController } from './chatbot.controller.js';
import { ChatbotService } from './chatbot.service.js';

@Module({
  imports: [CatalogModule, AppointmentsModule],
  controllers: [ChatbotController],
  providers: [ChatbotService, AiToolsService],
})
export class AiModule {}
