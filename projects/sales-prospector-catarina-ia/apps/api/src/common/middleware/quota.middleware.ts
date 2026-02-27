import { Injectable, NestMiddleware, ForbiddenException } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { WalletService } from "../../billing/wallet.service";

@Injectable()
export class QuotaMiddleware implements NestMiddleware {
  constructor(private wallet: WalletService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const tenantId = req.headers["x-tenant-id"] as string;
    if (!tenantId) return next();

    const balance = await this.wallet.getBalance(tenantId);
    if (Number(balance) <= 0) {
      throw new ForbiddenException("Insufficient credits. Please top up.");
    }

    next();
  }
}
