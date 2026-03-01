import { Controller, Post, Body, Headers } from "@nestjs/common";
import { WalletService } from "./wallet.service";

@Controller("stripe")
export class StripeController {
  constructor(private wallet: WalletService) {}

  @Post("webhook")
  async handleWebhook(
    @Headers("stripe-signature") signature: string,
    @Body() body: any,
  ) {
    // Verify signature with Stripe SDK (mocked here)
    if (body.type === "invoice.paid") {
      const orgId = body.data.object.metadata.orgId;
      const amount = body.data.object.amount_paid / 100;
      // In a real app, we'd add credit, not decrement
      console.log(`Payment received for ${orgId}: ${amount}`);
    }
    return { received: true };
  }
}
