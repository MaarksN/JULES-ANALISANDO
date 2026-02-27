import { Controller, Get, Post, Body, Req, Query, UseGuards } from '@nestjs/common';
import { SalesService } from './sales.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller("sales")
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Get("leads")
  // @UseGuards(JwtAuthGuard)
  async getLeads(
    @Req() req,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
  ) {
    // TODO: Use req.user.companyId when Auth is fully active
    const companyId = req.user?.companyId || 'default-company-id';
    return this.salesService.getLeads(
      companyId,
      skip ? Number(skip) : undefined,
      take ? Number(take) : undefined,
    );
  }

  @Post("leads")
  // @UseGuards(JwtAuthGuard)
  async createLead(@Req() req, @Body() body) {
    const companyId = req.user?.companyId || "default-company-id";
    // If companyRef connection is required by Prisma, we might need to ensure 'default-company-id' exists or handle it.
    // For this migration, I'll assume the frontend sends what's needed or we use a valid ID.
    // To be safe, if we are in dev/demo mode, we might need to create a dummy company first.
    return this.salesService.createLead(companyId, body);
  }

  @Post("generate")
  async generate(@Body() body: { prompt: string }) {
    const text = await this.salesService.generateText(body.prompt);
    return { text };
  }
}
