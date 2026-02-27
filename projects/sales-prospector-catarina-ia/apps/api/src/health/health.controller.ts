import { Controller, Get } from "@nestjs/common";
import {
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
  PrismaHealthIndicator,
} from "@nestjs/terminus";
import { PrismaService } from "../database/prisma.service";

@Controller("health")
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private prisma: PrismaHealthIndicator,
    private db: PrismaService,
  ) {}

  @Get("live")
  @HealthCheck()
  checkLive() {
    return this.health.check([]);
  }

  @Get("ready")
  @HealthCheck()
  checkReady() {
    return this.health.check([
      () => this.prisma.pingCheck("database", this.db),
    ]);
  }
}
