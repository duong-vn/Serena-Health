import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

export const CHATBOT_MODELS = [
  'gemini-3.8-flash',
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-3.5-flash-lite',
] as const;

const SETTING_KEY = 'CHATBOT_MODEL';

@Injectable()
export class AdminSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async activeModel(): Promise<string> {
    // ponytail: read per chat for instant cross-instance updates; cache only if this query becomes costly.
    const fallback = process.env.GEMINI_MODEL || 'gemini-3.5-flash';
    try {
      const setting = await this.prisma.systemSetting.findUnique({ where: { key: SETTING_KEY } });
      return setting?.value || fallback;
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 'P2021') return fallback;
      throw error;
    }
  }

  async getModel(): Promise<{ model: string; models: readonly string[] }> {
    return { model: await this.activeModel(), models: CHATBOT_MODELS };
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
