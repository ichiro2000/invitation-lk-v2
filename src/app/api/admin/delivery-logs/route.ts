import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { Prisma } from "@/generated/prisma/client";

const VALID_CHANNELS = new Set(["EMAIL", "SMS", "WHATSAPP"]);
const VALID_STATUSES = new Set([
  "SENT", "FAILED", "DELIVERED", "BOUNCED", "OPENED", "CLICKED",
]);

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { error: "Unauthorized" as const, status: 401 as const };
  }
  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  if (me?.role !== "ADMIN") {
    return { error: "Forbidden" as const, status: 403 as const };
  }
  return { session };
}

export async function GET(request: Request) {
  try {
    const auth = await requireAdmin();
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(request.url);
    const channel = searchParams.get("channel") ?? "";
    const status = searchParams.get("status") ?? "";
    const template = searchParams.get("template") ?? "";
    const search = searchParams.get("search") ?? "";
    const sinceDays = Math.min(
      Math.max(parseInt(searchParams.get("sinceDays") ?? "30", 10) || 30, 1),
      365
    );
    const limit = Math.min(
      Math.max(parseInt(searchParams.get("limit") ?? "200", 10) || 200, 1),
      1000
    );

    const where: Prisma.DeliveryLogWhereInput = {
      createdAt: {
        gte: new Date(Date.now() - sinceDays * 24 * 60 * 60 * 1000),
      },
    };
    if (channel && VALID_CHANNELS.has(channel)) {
      where.channel = channel as Prisma.DeliveryLogWhereInput["channel"];
    }
    if (status && VALID_STATUSES.has(status)) {
      where.status = status as Prisma.DeliveryLogWhereInput["status"];
    }
    if (template) {
      where.template = template;
    }
    if (search) {
      where.OR = [
        { recipient: { contains: search, mode: "insensitive" } },
        { subject: { contains: search, mode: "insensitive" } },
      ];
    }

    const [entries, totals] = await Promise.all([
      prisma.deliveryLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        select: {
          id: true,
          channel: true,
          status: true,
          provider: true,
          providerId: true,
          recipient: true,
          subject: true,
          template: true,
          userId: true,
          error: true,
          metadata: true,
          createdAt: true,
        },
      }),
      prisma.deliveryLog.groupBy({
        by: ["status"],
        where: { createdAt: where.createdAt },
        _count: { _all: true },
      }),
    ]);

    const statusCounts: Record<string, number> = {};
    for (const t of totals) statusCounts[t.status] = t._count._all;

    return NextResponse.json({ entries, statusCounts, sinceDays });
  } catch (error) {
    console.error("Admin delivery-logs error:", error);
    return NextResponse.json(
      { error: "Failed to load delivery logs" },
      { status: 500 }
    );
  }
}
