import {
  Controller,
  Post,
  Body,
  Headers,
  UnauthorizedException,
} from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";

@Controller("public")
export class PublicController {
  constructor(private prisma: PrismaService) {}

  @Post("leads")
  async createLead(@Headers("x-api-key") apiKey: string, @Body() body: any) {
    // Validate API Key
    // In real app: await this.prisma.apiKey.findFirst({ where: { key: apiKey } })
    if (apiKey !== "mock_key") {
      throw new UnauthorizedException("Invalid API Key");
    }

    // Create lead
    return { status: "created", id: "mock_lead_id" };
  }
}
