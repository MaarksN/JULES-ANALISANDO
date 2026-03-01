import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@Controller("organizations")
export class OrganizationsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get("me")
  @UseGuards(JwtAuthGuard)
  async getMyOrg(@Req() req) {
    // Assuming user is in req.user
    // This is a simplified fetch. Real one would filter by member.
    return this.prisma.organization.findFirst();
  }
}
