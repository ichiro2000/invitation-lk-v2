import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { logAdminAction } from "@/lib/audit-log";
import { TicketStatus, TicketPriority } from "@/generated/prisma/client";

const VALID_STATUSES = Object.values(TicketStatus);
const VALID_PRIORITIES = Object.values(TicketPriority);

async function requireAdmin(session: { user?: { id?: string } } | null) {
  if (!session?.user?.id) return null;
  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  if (me?.role !== "ADMIN") return null;
  return session.user.id;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const adminId = await requireAdmin(session);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!adminId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;

    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
      select: {
        id: true, subject: true, status: true, priority: true,
        createdAt: true, updatedAt: true,
        user: {
          select: {
            id: true, email: true, yourName: true, partnerName: true,
            plan: true, phone: true, createdAt: true,
          },
        },
        replies: {
          orderBy: { createdAt: "asc" },
          select: {
            id: true, message: true, isInternal: true, createdAt: true,
            author: { select: { id: true, email: true, yourName: true, role: true } },
          },
        },
      },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    return NextResponse.json({ ticket });
  } catch (error) {
    console.error("Admin support ticket fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch ticket" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const adminId = await requireAdmin(session);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!adminId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;
    const body = await request.json().catch(() => ({}));

    const data: { status?: TicketStatus; priority?: TicketPriority } = {};

    if (body.status !== undefined) {
      if (!VALID_STATUSES.includes(body.status)) {
        return NextResponse.json(
          { error: `Invalid status. One of: ${VALID_STATUSES.join(", ")}` },
          { status: 400 }
        );
      }
      data.status = body.status;
    }
    if (body.priority !== undefined) {
      if (!VALID_PRIORITIES.includes(body.priority)) {
        return NextResponse.json(
          { error: `Invalid priority. One of: ${VALID_PRIORITIES.join(", ")}` },
          { status: 400 }
        );
      }
      data.priority = body.priority;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const before = await prisma.supportTicket.findUnique({
      where: { id },
      select: { status: true, priority: true, subject: true },
    });
    if (!before) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    const updated = await prisma.supportTicket.update({
      where: { id },
      data,
      select: { id: true, status: true, priority: true },
    });

    if (data.status !== undefined && before.status !== data.status) {
      await logAdminAction({
        actorUserId: adminId,
        action: "support.ticket.status.update",
        targetType: "User",
        targetId: id,
        metadata: { subject: before.subject, from: before.status, to: data.status },
        request,
      });
    }
    if (data.priority !== undefined && before.priority !== data.priority) {
      await logAdminAction({
        actorUserId: adminId,
        action: "support.ticket.priority.update",
        targetType: "User",
        targetId: id,
        metadata: { subject: before.subject, from: before.priority, to: data.priority },
        request,
      });
    }

    return NextResponse.json({ ticket: updated });
  } catch (error) {
    console.error("Admin support ticket update error:", error);
    return NextResponse.json(
      { error: "Failed to update ticket" },
      { status: 500 }
    );
  }
}
