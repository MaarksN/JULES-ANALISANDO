import { Injectable } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ConfigService } from "@nestjs/config";
import { EventEmitter2 } from "@nestjs/event-emitter";

@Injectable()
export class SalesService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private eventEmitter: EventEmitter2,
  ) {
    const apiKey = this.configService.get<string>("GEMINI_API_KEY");
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    }
  }

  async getLeads(orgId: string, skip: number = 0, take: number = 50) {
    return this.prisma.contact.findMany({
      where: { orgId },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    });

    try {
      // Cache for 10 minutes (600000 ms)
      await this.cacheManager.set(cacheKey, leads, 600000);
    } catch (e) {
      console.warn('Cache set error:', e);
    }

    return leads;
  }

  async createLead(orgId: string, data: any) {
    const lead = await this.prisma.contact.create({
      data: {
        ...data,
        orgId,
      },
    });

    this.eventEmitter.emit("sales.lead.created", { leadId: lead.id, orgId });
    return lead;
  }

  async generateText(prompt: string) {
    if (!this.model) {
      return "Simulação de resposta da IA. Configure GEMINI_API_KEY para respostas reais.";
    }

    // ⚡ Bolt Optimization: Cache AI response based on prompt hash to reduce latency and costs
    const hash = crypto.createHash('sha256').update(prompt).digest('hex');
    const cacheKey = `sales:generate:${hash}`;

    try {
        const cached = await this.cacheManager.get<string>(cacheKey);
        if (cached) {
            return cached;
        }
    } catch (e) {
        // Fail open on cache error
        console.warn('Cache read error:', e);
    }

    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    try {
        // Cache for 24 hours (86400000 ms)
        await this.cacheManager.set(cacheKey, text, 86400000);
    } catch (e) {
        console.warn('Cache set error:', e);
    }

    return text;
  }
}
