import { Injectable } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";

@Injectable()
export class WebhookService {
  constructor(private prisma: PrismaService) {}

  async listWebhooks(orgId: string) {
    // Webhook model was removed in this plan to simplify, but assuming we might add it back later.
    // For now, returning empty or using a generic config.
    return [];
  }
}
