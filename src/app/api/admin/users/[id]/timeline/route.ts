import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export type TimelineEventType =
  | "account.signup"
  | "account.email_verified"
  | "account.suspended"
  | "account.unsuspended"
  | "account.plan_changed"
  | "account.role_changed"
  | "account.impersonated"
  | "invitation.created"
  | "invitation.published"
  | "invitation.paid"
  | "order.created"
  | "order.completed"
  | "order.failed"
  | "order.refunded"
  | "support.ticket_opened"
  | "support.ticket_replied";

interface TimelineEvent {
  type: TimelineEventType;
  at: string; // ISO
  summary: string;
  detail?: string;
  actorEmail?: string | null;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true, createdAt: true, emailVerified: true,
      },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const [invitations, orders, tickets, ticketReplies, auditLogs] = await Promise.all([
      prisma.invitation.findMany({
        where: { userId: id },
        select: { id: true, slug: true, groomName: true, brideName: true, isPublished: true, isPaid: true, createdAt: true, updatedAt: true },
      }),
      prisma.order.findMany({
        where: { userId: id },
        select: { id: true, plan: true, amount: true, currency: true, paymentMethod: true, paymentStatus: true, createdAt: true, updatedAt: true },
      }),
      prisma.supportTicket.findMany({
        where: { userId: id },
        select: { id: true, subject: true, priority: true, createdAt: true },
      }),
      prisma.supportTicketReply.findMany({
        where: { ticket: { userId: id } },
        select: {
          id: true, ticketId: true, message: true, isInternal: true, createdAt: true,
          author: { select: { id: true, email: true, role: true } },
          ticket: { select: { subject: true } },
        },
      }),
      prisma.auditLog.findMany({
        where: { targetType: "User", targetId: id },
        select: {
          id: true, action: true, createdAt: true, metadata: true,
          actor: { select: { email: true, yourName: true } },
        },
      }),
    ]);

    const events: TimelineEvent[] = [];

    events.push({
      type: "account.signup",
      at: user.createdAt.toISOString(),
      summary: "Account created",
    });

    if (user.emailVerified) {
      events.push({
        type: "account.email_verified",
        at: user.emailVerified.toISOString(),
        summary: "Email verified",
      });
    }

    for (const inv of invitations) {
      events.push({
        type: "invitation.created",
        at: inv.createdAt.toISOString(),
        summary: "Invitation created",
        detail: `${inv.groomName} & ${inv.brideName} · /w/${inv.slug}`,
      });
      // isPublished / isPaid don't carry their own timestamp, but we know
      // the current state and the updatedAt — if the flag is true we
      // represent the *current* state at updatedAt. Imperfect but useful.
      if (inv.isPublished) {
        events.push({
          type: "invitation.published",
          at: inv.updatedAt.toISOString(),
          summary: "Invitation site went live",
          detail: `/w/${inv.slug}`,
        });
      }
      if (inv.isPaid) {
        events.push({
          type: "invitation.paid",
          at: inv.updatedAt.toISOString(),
          summary: "Invitation marked paid",
          detail: `/w/${inv.slug}`,
        });
      }
    }

    for (const o of orders) {
      events.push({
        type: "order.created",
        at: o.createdAt.toISOString(),
        summary: `Order placed — ${o.plan}`,
        detail: `${o.currency} ${o.amount.toString()} · ${o.paymentMethod}`,
      });
      if (o.paymentStatus !== "PENDING" && o.updatedAt.getTime() !== o.createdAt.getTime()) {
        const map: Record<string, TimelineEventType> = {
          COMPLETED: "order.completed",
          FAILED: "order.failed",
          REFUNDED: "order.refunded",
        };
        const t = map[o.paymentStatus];
        if (t) {
          events.push({
            type: t,
            at: o.updatedAt.toISOString(),
            summary: `Order ${o.paymentStatus.toLowerCase()} — ${o.plan}`,
            detail: `${o.currency} ${o.amount.toString()} · ${o.paymentMethod}`,
          });
        }
      }
    }

    for (const t of tickets) {
      events.push({
        type: "support.ticket_opened",
        at: t.createdAt.toISOString(),
        summary: `Support ticket opened — ${t.priority}`,
        detail: t.subject,
      });
    }

    for (const r of ticketReplies) {
      if (r.isInternal) continue;
      events.push({
        type: "support.ticket_replied",
        at: r.createdAt.toISOString(),
        summary: r.author.role === "ADMIN"
          ? `Admin replied on "${r.ticket.subject}"`
          : `Customer replied on "${r.ticket.subject}"`,
        detail: r.message.length > 140 ? r.message.slice(0, 137) + "…" : r.message,
        actorEmail: r.author.email,
      });
    }

    for (const a of auditLogs) {
      const meta = (a.metadata ?? {}) as Record<string, unknown>;
      const actor = a.actor?.email ?? null;
      switch (a.action) {
        case "user.suspend":
          events.push({
            type: "account.suspended",
            at: a.createdAt.toISOString(),
            summary: "Account suspended",
            detail: typeof meta.reason === "string" ? meta.reason : undefined,
            actorEmail: actor,
          });
          break;
        case "user.unsuspend":
          events.push({
            type: "account.unsuspended",
            at: a.createdAt.toISOString(),
            summary: "Account unsuspended",
            actorEmail: actor,
          });
          break;
        case "user.plan.update":
          events.push({
            type: "account.plan_changed",
            at: a.createdAt.toISOString(),
            summary: `Plan changed: ${meta.from ?? "?"} → ${meta.to ?? "?"}`,
            actorEmail: actor,
          });
          break;
        case "user.role.update":
          events.push({
            type: "account.role_changed",
            at: a.createdAt.toISOString(),
            summary: `Role changed: ${meta.from ?? "?"} → ${meta.to ?? "?"}`,
            actorEmail: actor,
          });
          break;
        case "user.impersonate.start":
          events.push({
            type: "account.impersonated",
            at: a.createdAt.toISOString(),
            summary: "Admin impersonated this user",
            detail: typeof meta.adminEmail === "string" ? `by ${meta.adminEmail}` : undefined,
            actorEmail: actor,
          });
          break;
      }
    }

    events.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());

    return NextResponse.json({ events });
  } catch (error) {
    console.error("Admin user timeline error:", error);
    return NextResponse.json(
      { error: "Failed to fetch timeline" },
      { status: 500 }
    );
  }
}
