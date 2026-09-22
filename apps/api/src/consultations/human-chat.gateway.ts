import { OnModuleDestroy, OnModuleInit, UnauthorizedException, UsePipes, ValidationPipe } from '@nestjs/common';
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer, WsException } from '@nestjs/websockets';
import type { Namespace, Socket } from 'socket.io';
import type { Subscription } from 'rxjs';

import { AuthService } from '../auth/auth.service.js';
import type { AuthUser } from '../auth/auth.types.js';
import { ConsultationsService } from './consultations.service.js';
import { SendMessageDto } from './dto/consultation.dto.js';
import { HumanChatEvents } from './human-chat.events.js';

interface ChatSocketData {
  user?: AuthUser;
  token?: string;
  expiryTimer?: NodeJS.Timeout;
}

interface JoinPayload { consultationId: string }
interface SendPayload extends SendMessageDto { consultationId: string }

@WebSocketGateway({ namespace: '/human-chat', cors: false, maxHttpBufferSize: 8_192 })
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
export class HumanChatGateway implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit, OnModuleDestroy {
  @WebSocketServer() server!: Namespace;
  private subscription?: Subscription;

  constructor(
    private readonly auth: AuthService,
    private readonly consultations: ConsultationsService,
    private readonly events: HumanChatEvents,
  ) {}

  onModuleInit(): void {
    this.subscription = this.events.messages.subscribe(({ consultationId, message }) => this.server.to(this.room(consultationId)).emit('message', message));
  }

  onModuleDestroy(): void { this.subscription?.unsubscribe(); }

  async handleConnection(client: Socket): Promise<void> {
    try {
      const token = typeof client.handshake.auth.token === 'string' ? client.handshake.auth.token : undefined;
      if (!token) throw new UnauthorizedException();
      const { expiresAt, ...user } = await this.auth.verifyToken(token);
      const data = client.data as ChatSocketData;
      data.user = user;
      data.token = token;
      data.expiryTimer = setTimeout(() => client.disconnect(true), Math.max(0, expiresAt - Date.now()));
    } catch {
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket): void {
    const timer = (client.data as ChatSocketData).expiryTimer;
    if (timer) clearTimeout(timer);
  }

  @SubscribeMessage('join')
  async join(@ConnectedSocket() client: Socket, @MessageBody() payload: JoinPayload) {
    const user = await this.reauthorize(client);
    await this.consultations.assertParticipant(user, payload.consultationId);
    await client.join(this.room(payload.consultationId));
    return { event: 'joined', data: { consultationId: payload.consultationId } };
  }

  @SubscribeMessage('send')
  async send(@ConnectedSocket() client: Socket, @MessageBody() payload: SendPayload) {
    const user = await this.reauthorize(client);
    const message = await this.consultations.sendMessage(user, payload.consultationId, payload.content);
    this.events.publish({ consultationId: payload.consultationId, message });
    return { event: 'sent', data: message };
  }

  private async reauthorize(client: Socket): Promise<AuthUser> {
    try {
      const token = (client.data as ChatSocketData).token;
      if (!token) throw new UnauthorizedException();
      const { expiresAt: _expiresAt, ...user } = await this.auth.verifyToken(token);
      return user;
    } catch {
      client.disconnect(true);
      throw new WsException({ code: 'UNAUTHORIZED', message: 'Authentication expired' });
    }
  }

  private room(consultationId: string): string { return `consultation:${consultationId}`; }
}
