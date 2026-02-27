import { Injectable, NestMiddleware, ForbiddenException } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";

@Injectable()
export class IpWhitelistMiddleware implements NestMiddleware {
  private allowedIps = ["127.0.0.1", "::1"]; // Configurable via DB/Env

  use(req: Request, res: Response, next: NextFunction) {
    const clientIp = req.ip || req.socket.remoteAddress;

    // Logic: If Org has IP Whitelist enabled, check against it.
    // For now, permissive if not in production or for specific routes.

    if (
      process.env.NODE_ENV === "production" &&
      !this.allowedIps.includes(clientIp || "")
    ) {
      // throw new ForbiddenException('IP not allowed');
    }

    next();
  }
}
