import { Injectable, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";
import { Decimal } from "@prisma/client/runtime/library";

@Injectable()
export class WalletService {
  constructor(private prisma: PrismaService) {}

  async getBalance(orgId: string) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { orgId },
    });
    return wallet?.balance || 0;
  }

  async decrementBalance(orgId: string, amount: number, description: string) {
    return this.prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({
        where: { orgId },
      });

      if (!wallet) {
        throw new BadRequestException("Wallet not found");
      }

      if (wallet.balance.lessThan(amount)) {
        throw new BadRequestException("Insufficient funds");
      }

      const newBalance = wallet.balance.minus(amount);

      await tx.wallet.update({
        where: { orgId },
        data: { balance: newBalance },
      });

      await tx.ledger.create({
        data: {
          walletId: wallet.id,
          amount: new Decimal(amount),
          type: "DEBIT",
          description,
        },
      });

      return newBalance;
    });
  }
}
