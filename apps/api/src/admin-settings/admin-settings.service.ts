import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

export const CHATBOT_MODELS = [
  'google/gemini-2.5-flash',
  'openai/gpt-4o-mini',
  'openai/gpt-4o',
  'anthropic/claude-3.5-haiku',
  'deepseek/deepseek-chat',
  'meta-llama/llama-3.3-70b-instruct',
] as const;

const SETTING_KEY = 'CHATBOT_MODEL';

@Injectable()
export class AdminSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async activeModel(): Promise<string> {
    // ponytail: read per chat for instant cross-instance updates; cache only if this query becomes costly.
    const fallback = process.env.OPENROUTER_DEFAULT_MODEL || 'google/gemini-2.5-flash';
    try {
      const setting = await this.prisma.systemSetting.findUnique({ where: { key: SETTING_KEY } });
      return setting?.value || fallback;
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 'P2021') return fallback;
      throw error;
    }
  }

  async getModel(): Promise<{ model: string; models: readonly string[] }> {
    const active = await this.activeModel();
    const models = (CHATBOT_MODELS as readonly string[]).includes(active)
      ? CHATBOT_MODELS
      : [active, ...CHATBOT_MODELS];
    return { model: active, models };
  }

  async updateModel(model: string): Promise<{ model: string }> {
    const setting = await this.prisma.systemSetting.upsert({
      where: { key: SETTING_KEY },
      create: { key: SETTING_KEY, value: model },
      update: { value: model },
    });
    return { model: setting.value };
  }
}
