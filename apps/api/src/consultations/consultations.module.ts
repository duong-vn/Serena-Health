import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module.js';
import { ConsultationsController } from './consultations.controller.js';
import { ConsultationsService } from './consultations.service.js';
import { HumanChatEvents } from './human-chat.events.js';
import { HumanChatGateway } from './human-chat.gateway.js';

@Module({
  imports: [AuthModule],
  controllers: [ConsultationsController],
  providers: [ConsultationsService, HumanChatEvents, HumanChatGateway],
  exports: [ConsultationsService],
})
export class ConsultationsModule {}
