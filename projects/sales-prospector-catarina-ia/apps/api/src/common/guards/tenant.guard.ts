import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Reflector } from "@nestjs/core";

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(" ")[1];

    if (!token) throw new UnauthorizedException("Token missing");

    try {
      const secret =
        process.env.JWT_SECRET ||
        (process.env.NODE_ENV === "production"
          ? undefined
          : "dev_secret_key_123");
      const payload = await this.jwtService.verifyAsync(token, {
        secret: secret,
      });

      request.user = {
        id: payload.sub,
        email: payload.email,
        companyId: payload.companyId,
        role: payload.role,
      };
      return true;
    } catch {
      throw new UnauthorizedException("Invalid token");
    }
  }
}
