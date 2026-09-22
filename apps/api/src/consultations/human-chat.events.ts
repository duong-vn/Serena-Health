import { Injectable } from '@nestjs/common';
import { Subject } from 'rxjs';

import type { Message } from '../generated/prisma/client.js';

export interface HumanChatEvent {
  consultationId: string;
  message: Message;
}

@Injectable()
export class HumanChatEvents {
  readonly messages = new Subject<HumanChatEvent>();
  publish(event: HumanChatEvent): void { this.messages.next(event); }
}
