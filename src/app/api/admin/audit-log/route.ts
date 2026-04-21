import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

const VALID_ACTIONS = new Set([
  "user.delete",
  "user.plan.update",
  "user.role.update",
  "user.suspend",
  "user.unsuspend",
  "bank_transfer.approve",
  "bank_transfer.reject",
  "support.ticket.status.update",
  "support.ticket.priority.update",
]);

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const me = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });
    if (me?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const actorId = searchParams.get("actorId") ?? "";
    const targetType = searchParams.get("targetType") ?? "";
    const targetId = searchParams.get("targetId") ?? "";
    const action = searchParams.get("action") ?? "";
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "100", 10) || 100, 500);

    const filters: Record<string, unknown>[] = [];
    if (actorId) filters.push({ actorUserId: actorId });
    if (targetType) filters.push({ targetType });
    if (targetId) filters.push({ targetId });
    if (action && VALID_ACTIONS.has(action)) filters.push({ action });

    const where = filters.length > 0 ? { AND: filters } : {};

    const entries = await prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        actorUserId: true,
        action: true,
        targetType: true,
        targetId: true,
        metadata: true,
        ipAddress: true,
        createdAt: true,
        actor: {
          select: { id: true, email: true, yourName: true },
        },
      },
    });

    return NextResponse.json({ entries });
  } catch (error) {
    console.error("Admin audit-log error:", error);
    return NextResponse.json(
      { error: "Failed to fetch audit log" },
      { status: 500 }
    );
  }
}
