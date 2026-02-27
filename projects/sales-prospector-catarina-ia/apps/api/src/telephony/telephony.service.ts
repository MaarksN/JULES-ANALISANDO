import { Injectable } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";
import * as twilio from "twilio";

@Injectable()
export class TelephonyService {
  private client: twilio.Twilio;
  private failures = 0;
  private readonly threshold = 5;

  constructor(private prisma: PrismaService) {
    const sid = process.env.TWILIO_SID;
    const token = process.env.TWILIO_TOKEN;

    if (sid && token && sid.startsWith("AC")) {
      this.client = new twilio.Twilio(sid, token);
    }
  }

  async makeCall(to: string, orgId: string) {
    if (this.failures > this.threshold) {
      console.warn("Circuit breaker open. Switching to fallback provider.");
      // Fallback logic here (e.g., VAPI)
      return { status: "fallback_initiated" };
    }

    try {
      // Mock call logic
      // const call = await this.client.calls.create(...)

      await this.prisma.communication.create({
        data: {
          orgId,
          type: "CALL",
          direction: "OUTBOUND",
          status: "INITIATED",
          content: `Call to ${to}`,
        },
      });

      this.failures = 0; // Reset on success
      return { status: "initiated" };
    } catch (e) {
      this.failures++;
      throw e;
    }
  }
}
