import { Controller, Post, Body, Inject } from '@nestjs/common';
import { AIGateway } from '../ai/gateway/ai.gateway';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Controller("playbooks")
export class PlaybookController {
  constructor(
    private ai: AIGateway,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  @Post('generate')
  async generatePlaybook(@Body() body: { goal: string, industry: string }) {
    const cacheKey = `playbook:${body.industry}:${body.goal}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached;
    }

    const prompt = `Create a 5-step sales playbook for selling to ${body.industry} with the goal of ${body.goal}.`;
    const content = await this.ai.generate(prompt);

    const result = {
      playbook: content,
      steps: [
        { day: 1, action: "Email", template: "Intro..." },
        { day: 3, action: "Call", script: "Follow up..." },
      ],
    };

    await this.cacheManager.set(cacheKey, result);
    return result;
  }
}
