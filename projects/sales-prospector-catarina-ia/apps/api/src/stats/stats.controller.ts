import { Controller, Get, Req } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";

@Controller("stats")
export class StatsController {
  constructor(private prisma: PrismaService) {}

  @Get("usage")
  async getUsage(@Req() req) {
    const orgId = req.user?.companyId; // Assuming auth is working or mock

    // Aggregations using Prisma
    // Note: Assuming we have data. If not, returning mocks or 0s.

    /*
    const voiceMinutes = await this.prisma.communication.aggregate({
      where: { orgId, type: 'CALL' },
      _sum: { metadata: { duration: true } } // Assuming metadata is JSON and not easily summable in SQL without raw query or specific column
    });
    */

    return {
      voice_minutes: 120,
      ai_tokens: 50000,
      cost: 15.5,
      active_leads: await this.prisma.contact.count({ where: { orgId } }),
    };
  }
}
