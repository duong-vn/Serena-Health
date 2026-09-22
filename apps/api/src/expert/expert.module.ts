import { Module } from '@nestjs/common';

import { ConversationsModule } from '../conversations/conversations.module.js';
import { ExpertController } from './expert.controller.js';
import { ExpertService } from './expert.service.js';

@Module({ imports: [ConversationsModule], controllers: [ExpertController], providers: [ExpertService], exports: [ExpertService] })
export class ExpertModule {}
