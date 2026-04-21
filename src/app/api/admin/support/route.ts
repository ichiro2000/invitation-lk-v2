import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { TicketStatus, TicketPriority } from "@/generated/prisma/client";

const VALID_STATUSES = Object.values(TicketStatus);
const VALID_PRIORITIES = Object.values(TicketPriority);

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
    const search = searchParams.get("search")?.trim() ?? "";
    const status = searchParams.get("status") ?? "";
    const priority = searchParams.get("priority") ?? "";

    const filters: Record<string, unknown>[] = [];
    if (search) {
      filters.push({
        OR: [
          { subject: { contains: search, mode: "insensitive" as const } },
          { user: { email: { contains: search, mode: "insensitive" as const } } },
          { user: { yourName: { contains: search, mode: "insensitive" as const } } },
        ],
      });
    }
    if (status && VALID_STATUSES.includes(status as TicketStatus)) {
      filters.push({ status });
    }
    if (priority && VALID_PRIORITIES.includes(priority as TicketPriority)) {
      filters.push({ priority });
    }

    const where = filters.length > 0 ? { AND: filters } : {};

    const rawTickets = await prisma.supportTicket.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      take: 500,
      select: {
        id: true, subject: true, status: true, priority: true,
        createdAt: true, updatedAt: true,
        user: {
          select: { id: true, email: true, yourName: true, plan: true },
        },
        _count: { select: { replies: true } },
        // Earliest public admin reply → used to compute TTFR (time to first
        // admin response) on the client.
        replies: {
          where: { isInternal: false, author: { role: "ADMIN" } },
          orderBy: { createdAt: "asc" },
          take: 1,
          select: { createdAt: true },
        },
      },
    });

    const tickets = rawTickets.map((t) => ({
      id: t.id,
      subject: t.subject,
      status: t.status,
      priority: t.priority,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
      user: t.user,
      _count: t._count,
      firstAdminReplyAt: t.replies[0]?.createdAt ?? null,
    }));

    return NextResponse.json({ tickets });
  } catch (error) {
    console.error("Admin support tickets list error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tickets" },
      { status: 500 }
    );
  }
}
