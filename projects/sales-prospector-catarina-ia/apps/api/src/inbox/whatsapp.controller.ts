import { Controller, Post, Body } from "@nestjs/common";

@Controller("whatsapp")
export class WhatsAppController {
  @Post("webhook")
  handleMessage(@Body() body: any) {
    console.log("WhatsApp Message:", body);
    // In a real app: parse, find contact, save to DB, emit socket event
    return { status: "received" };
  }
}
