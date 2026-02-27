import type { Request } from "express";
import { HttpError } from "../errors/http-error.js";
import type { AuthRequest } from "./auth.js";

export type TenantContext = {
  tenantId: string;
  source: "token" | "header";
};

export const resolveTenantId = (req: Request): string => {
  const authReq = req as AuthRequest;
  const claimTenantId = authReq.user?.tenantId ?? authReq.user?.organizationId;

  if (claimTenantId && claimTenantId.trim().length > 0) {
    return claimTenantId.trim();
  }

  const tenantHeader = typeof req.header === "function"
    ? req.header("x-tenant-id")?.trim()
    : (typeof req.headers?.["x-tenant-id"] === "string" ? req.headers["x-tenant-id"].trim() : undefined);
  if (tenantHeader && tenantHeader.length > 0) {
    return tenantHeader;
  }

  throw new HttpError(400, "TENANT_CONTEXT_REQUIRED", "Missing tenant context");
};

export const resolveTenantContext = (req: Request): TenantContext => {
  const authReq = req as AuthRequest;
  const claimTenantId = authReq.user?.tenantId ?? authReq.user?.organizationId;
  if (claimTenantId && claimTenantId.trim().length > 0) {
    return { tenantId: claimTenantId.trim(), source: "token" };
  }

  const tenantHeader = typeof req.header === "function"
    ? req.header("x-tenant-id")?.trim()
    : (typeof req.headers?.["x-tenant-id"] === "string" ? req.headers["x-tenant-id"].trim() : undefined);
  if (tenantHeader && tenantHeader.length > 0) {
    return { tenantId: tenantHeader, source: "header" };
  }

  throw new HttpError(400, "TENANT_CONTEXT_REQUIRED", "Missing tenant context");
};
