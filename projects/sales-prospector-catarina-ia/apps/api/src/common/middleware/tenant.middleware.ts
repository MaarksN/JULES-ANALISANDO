import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { PrismaService } from "../../database/prisma.service";

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private prisma: PrismaService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const tenantId = req.headers["x-tenant-id"];
    const userId = (req as any).user?.id; // Assuming AuthGuard runs before or we verify token here

    if (!tenantId) {
      // Allow public routes or handle missing tenant
      return next();
    }

    if (userId) {
      // Check if user belongs to tenant
      const membership = await this.prisma.member.findFirst({
        where: {
          userId: userId,
          orgId: tenantId as string,
        },
      });

      if (!membership) {
        throw new UnauthorizedException(
          "User does not belong to this organization",
        );
      }
    }

    (req as any).tenantId = tenantId;
    next();
  }
}
