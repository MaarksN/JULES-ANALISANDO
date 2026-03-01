import { Controller, Post, Body, Req, UseGuards } from "@nestjs/common";
import { WalletService } from "./wallet.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@Controller("billing")
export class BillingController {
  constructor(private readonly wallet: WalletService) {}

  @Post("topup")
  @UseGuards(JwtAuthGuard)
  async topUp(@Req() req, @Body() body: { amount: number }) {
    // Mock topup (would be webhook driven normally)
    // return this.wallet.addCredits(req.user.companyId, body.amount);
    return { status: "mock_topup_success" };
  }
}
