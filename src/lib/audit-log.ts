import prisma from "@/lib/db";

export type AuditAction =
  | "user.delete"
  | "user.plan.update"
  | "user.role.update"
  | "bank_transfer.approve"
  | "bank_transfer.reject";

export type AuditTargetType = "User" | "Order" | "BankTransfer" | "Invitation";

type LogParams = {
  actorUserId: string | null;
  action: AuditAction;
  targetType?: AuditTargetType;
  targetId?: string;
  metadata?: Record<string, unknown>;
  request?: Request;
};

function extractIp(request?: Request): string | null {
  if (!request) return null;
  const h = request.headers;
  const xff = h.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return h.get("x-real-ip") || h.get("cf-connecting-ip") || null;
}

export async function logAdminAction({
  actorUserId,
  action,
  targetType,
  targetId,
  metadata,
  request,
}: LogParams): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        actorUserId,
        action,
        targetType: targetType ?? null,
        targetId: targetId ?? null,
        metadata: metadata ? (metadata as object) : undefined,
        ipAddress: extractIp(request),
      },
    });
  } catch (error) {
    // Never let audit logging break the admin action itself.
    console.error("[audit-log] Failed to record", action, error);
  }
}
