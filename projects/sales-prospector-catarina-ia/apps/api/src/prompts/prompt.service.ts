import { Injectable } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";

@Injectable()
export class PromptManager {
  constructor(private prisma: PrismaService) {}

  async getPrompt(orgId: string, slug: string) {
    const prompt = await this.prisma.prompt.findUnique({
      where: { orgId_slug: { orgId, slug } },
      include: { versions: { where: { isLive: true } } },
    });
    return prompt?.versions[0]?.template || "";
  }
}
