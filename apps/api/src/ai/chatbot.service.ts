import { randomUUID } from 'node:crypto';
import { ConflictException, ForbiddenException, Injectable, Logger, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { createOpenAI } from '@ai-sdk/openai';
import { createUIMessageStream, generateText, pipeUIMessageStreamToResponse, stepCountIs, streamText, toUIMessageStream, type ModelMessage, type UIMessage } from 'ai';
import type { Response } from 'express';
import type { AuthUser } from '../auth/auth.types.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { Prisma } from '../generated/prisma/client.js';
import { AiToolsService } from './ai-tools.service.js';
import { AdminSettingsService } from '../admin-settings/admin-settings.service.js';
import { SERENE_SYSTEM_PROMPT } from './prompt.js';
import { emergencyGuidance } from './safety.js';

@Injectable()
export class ChatbotService {
  private readonly logger = new Logger(ChatbotService.name);
  constructor(private readonly prisma: PrismaService, private readonly tools: AiToolsService, private readonly settings: AdminSettingsService) {}

  async chat(user: AuthUser, conversationId: string, text: string, response: Response) {
    if (user.role !== 'PATIENT') throw new ForbiddenException();
    const conversation = await this.prisma.conversation.findFirst({
      where: { id: conversationId, patientId: user.id }, include: { consultation: true },
    });
    if (!conversation) throw new NotFoundException('Conversation not found');
    if (conversation.consultation && conversation.consultation.status !== 'AI_CHAT') {
      throw new ConflictException('This conversation has moved to human care. Start a new AI conversation.');
    }
    const emergency = emergencyGuidance(text);
    const apiKey = process.env.OPENROUTER_API_KEY;
    const baseURL = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';
    const model = emergency ? null : await this.settings.activeModel();
    if (!emergency && (!apiKey || !model)) throw new ServiceUnavailableException('Serene AI is unavailable. Please contact the clinic or use appointment booking.');
    const now = new Date();
    const lease = new Date(now.getTime() + 120_000);
    const acquired = await this.prisma.conversation.updateMany({
      where: { id: conversationId, patientId: user.id, AND: [
        { OR: [{ generationExpiresAt: null }, { generationExpiresAt: { lt: now } }] },
        { OR: [{ consultation: null }, { consultation: { status: 'AI_CHAT' } }] },
      ] },
      data: { generationExpiresAt: lease },
    });
    if (acquired.count !== 1) throw new ConflictException('A response is already being generated');
    const abort = new AbortController();
    const timeout = setTimeout(() => abort.abort(), 90_000);
    const onClose = () => { if (!response.writableFinished) abort.abort(); };
    response.on('close', onClose);
    try {
      const previous = await this.prisma.message.findMany({
        where: { conversationId, role: { in: ['USER', 'ASSISTANT'] }, OR: [
          { role: 'USER' }, { metadata: { path: ['status'], equals: 'completed' } },
        ] },
        orderBy: { createdAt: 'desc' }, take: 30,
      });
      const userMessage = await this.prisma.message.create({
        data: { conversationId, role: 'USER', content: text, parts: [{ type: 'text', text }] },
      });
      const defaultTitles = ['Tư vấn sức khỏe tổng quát', 'Hội thoại mới', 'Cuộc trò chuyện mới'];
      if (previous.length === 0 || defaultTitles.includes(conversation.title)) {
        void this.autoGenerateTitle(conversationId, text, emergency ? null : model, apiKey, baseURL);
      }
      const persist = async (message: UIMessage, status: string) => {
        const content = message.parts.filter((part) => part.type === 'text').map((part) => part.text).join('');
        if (!content && !message.parts.length) return;
        // JSON round-trip strips SDK-only undefined fields before the Prisma JSON boundary.
        const parts = JSON.parse(JSON.stringify(message.parts)) as Prisma.InputJsonValue;
        await this.prisma.message.create({ data: {
          id: randomUUID(), conversationId, role: 'ASSISTANT', content,
          parts, model: emergency ? 'application-safety-rules' : model,
          metadata: { status, emergency: Boolean(emergency) },
        } });
      };
      const originals: UIMessage[] = [{ id: userMessage.id, role: 'user', parts: [{ type: 'text', text }] }];
      if (emergency) {
        const stream = createUIMessageStream({
          originalMessages: originals,
          execute: ({ writer }) => {
            const id = randomUUID();
            writer.write({ type: 'start', messageId: id });
            writer.write({ type: 'text-start', id });
            writer.write({ type: 'text-delta', id, delta: emergency });
            writer.write({ type: 'text-end', id });
            writer.setOutcome({ status: 'completed' });
          },
          onEnd: ({ responseMessage, outcome }) => persist(responseMessage, outcome.status),
          onError: () => 'Unable to save the safety response. Please call emergency services if needed.',
        });
        await pipeUIMessageStreamToResponse({ response, stream });
      } else {
        const history: ModelMessage[] = previous.reverse().filter((message) => message.content).map((message) => ({
          role: message.role === 'USER' ? 'user' : 'assistant', content: message.content.slice(0, 6000),
        }));
        // ponytail: AI-chat MVP — expose live-care proposals when the doctor flow is ready.
        const { requestDoctorEscalation: _escalation, ...tools } = this.tools.forPatient(user);
        this.logger.log(`Chatbot model: ${model}`);
        const openrouter = createOpenAI({ apiKey, baseURL });
        const result = streamText({
          model: openrouter(model!),
          system: `${SERENE_SYSTEM_PROMPT}\nCurrent UTC time: ${now.toISOString()}.`,
          messages: [...history, { role: 'user', content: text }],
          tools, stopWhen: stepCountIs(5), maxOutputTokens: 1600,
          abortSignal: abort.signal, maxRetries: 1,
        });
        const stream = toUIMessageStream({
          stream: result.stream, tools, originalMessages: originals, sendReasoning: false,
          onError: () => 'Serene AI is temporarily unavailable. Please retry later or contact the clinic.',
          onEnd: ({ responseMessage, outcome }) => persist(responseMessage, outcome.status),
        });
        await pipeUIMessageStreamToResponse({ response, stream });
      }
    } finally {
      clearTimeout(timeout);
      response.off('close', onClose);
      await this.prisma.conversation.updateMany({
        where: { id: conversationId, generationExpiresAt: lease },
        data: { generationExpiresAt: null, updatedAt: new Date() },
      });
    }
  }

  private async autoGenerateTitle(
    conversationId: string,
    text: string,
    model: string | null,
    apiKey: string | undefined,
    baseURL: string,
  ) {
    try {
      let title: string | null = null;
      if (apiKey && model) {
        try {
          const openrouter = createOpenAI({ apiKey, baseURL });
          const res = await generateText({
            model: openrouter(model),
            prompt: `Tóm tắt câu hỏi hoặc triệu chứng sức khỏe sau thành một tiêu đề ngắn gọn (từ 3 đến 6 từ tiếng Việt, không dùng dấu ngoặc, không dùng dấu chấm câu):\n"${text.slice(0, 300)}"`,
            maxOutputTokens: 25,
            abortSignal: AbortSignal.timeout(5000),
          });
          const cleaned = res.text.replace(/["'«»“”\.]/g, '').trim();
          if (cleaned && cleaned.length >= 2 && cleaned.length <= 80) {
            title = cleaned;
          }
        } catch {
          // LLM title generation fallback
        }
      }
      if (!title) {
        const cleaned = text.replace(/[\r\n]+/g, ' ').trim();
        title = cleaned.length > 45 ? `${cleaned.slice(0, 42)}…` : cleaned;
      }
      if (title && this.prisma.conversation?.update) {
        await this.prisma.conversation.update({
          where: { id: conversationId },
          data: { title },
        });
      }
    } catch (err) {
      this.logger.warn(`Failed to auto-generate conversation title: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
}
