import { Controller, Post, Body } from "@nestjs/common";

@Controller("voice/webhooks")
export class VoiceWebhookController {
  @Post("twilio")
  handleTwilio(@Body() body: any) {
    console.log("Twilio Webhook:", body);
    return { status: "ok" };
  }

  @Post("vapi")
  handleVapi(@Body() body: any) {
    console.log("VAPI Webhook:", body);
    return { status: "ok" };
  }
}
