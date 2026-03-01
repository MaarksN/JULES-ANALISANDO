import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { PrismaService } from "../../database/prisma.service";

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const method = req.method;

    if (["POST", "PUT", "DELETE", "PATCH"].includes(method)) {
      return next.handle().pipe(
        tap(async () => {
          // Fire and forget audit log
          const userId = (req as any).user?.id || "anonymous";
          const orgId = (req as any).user?.companyId; // Or tenantId header

          await this.prisma.auditLog
            .create({
              data: {
                actorId: userId,
                orgId: orgId,
                action: `${method} ${req.url}`,
                target: "API",
                metadata: { body: req.body, worm: true }, // Flag for WORM storage
              },
            })
            .catch(console.error);
        }),
      );
    }

    return next.handle();
  }
}
