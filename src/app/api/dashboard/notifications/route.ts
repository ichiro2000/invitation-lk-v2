import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

// Light endpoint for the notifications bell. The bell lives in the dashboard
// layout, so it runs on every /dashboard/* page — kept separate from the
// heavier /api/dashboard/overview so navigation doesn't retrigger all the
// sparkline queries.
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const [count, items] = await Promise.all([
      prisma.supportTicket.count({ where: { userId, status: "PENDING" } }),
      prisma.supportTicket.findMany({
        where: { userId, status: "PENDING" },
        orderBy: { updatedAt: "desc" },
        take: 5,
        select: { id: true, subject: true, priority: true, updatedAt: true },
      }),
    ]);

    return NextResponse.json({
      count,
      items: items.map((t) => ({
        id: t.id,
        kind: "support.pending" as const,
        subject: t.subject,
        priority: t.priority,
        updatedAt: t.updatedAt.toISOString(),
        href: `/dashboard/support/${t.id}`,
      })),
    });
  } catch (error) {
    console.error("Dashboard notifications error:", error);
    return NextResponse.json({ error: "Failed to load notifications" }, { status: 500 });
  }
}
