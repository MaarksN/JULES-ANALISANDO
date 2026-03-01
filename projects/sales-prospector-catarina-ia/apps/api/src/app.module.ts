import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { LoggerModule } from "nestjs-pino";
import { TerminusModule } from "@nestjs/terminus";
import { PrismaService } from "./database/prisma.service";
import { AuthModule } from "./auth/auth.module";
import { OrganizationsController } from "./organizations/organizations.controller";
import { BillingController } from "./billing/billing.controller";
import { WalletService } from "./billing/wallet.service";
import { TelephonyService } from "./telephony/telephony.service";
import { WebhookService } from "./webhooks/webhook.service";
import { PiiRedactionService } from "./security/pii.service";
import { SalesModule } from "./sales/sales.module";
import { PublicModule } from "./public/public.module";
import { EmbedController } from "./embed/embed.controller";
import { HealthController } from "./health/health.controller";
import { PlaybookController } from "./playbooks/playbooks.controller";
import { KnowledgeController } from "./knowledge/knowledge.controller";
import { VectorService } from "./ai/vector.service";
import { AIGateway, GeminiAdapter } from "./ai/gateway/ai.gateway";
import { CacheModule, CacheInterceptor } from "@nestjs/cache-manager";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { APP_INTERCEPTOR } from "@nestjs/core";

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    CacheModule.register({
      ttl: 60000,
      max: 100,
      isGlobal: true,
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (config) => {
        const requiredKeys = ["DATABASE_URL", "JWT_SECRET", "GEMINI_API_KEY"];
        const missingKeys = requiredKeys.filter((key) => !config[key]);
        if (missingKeys.length > 0) {
          throw new Error(
            `Missing required environment variables: ${missingKeys.join(", ")}`,
          );
        }
        return config;
      },
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    LoggerModule.forRoot({
      pinoHttp: {
        transport:
          process.env.NODE_ENV !== "production"
            ? { target: "pino-pretty" }
            : undefined,
      },
    }),
    TerminusModule,
    AuthModule,
    SalesModule,
    PublicModule,
  ],
  controllers: [
    OrganizationsController,
    BillingController,
    HealthController,
    EmbedController,
    PlaybookController,
    KnowledgeController,
  ],
  providers: [
    PrismaService,
    WalletService,
    TelephonyService,
    WebhookService,
    PiiRedactionService,
    VectorService,
    AIGateway,
    GeminiAdapter,
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
  ],
})
export class AppModule {}
