import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { displayName } from "@/lib/user-display";

// The dashboard overview page makes one call to this endpoint and gets back
// everything it renders: user chrome, 4 stat totals, 14-day daily series for
// the 3 sparklines, getting-started checkmarks, and the notifications list.
// Keeping it in one request keeps the dashboard load fast and avoids the
// flicker of multiple separate loaders.

const DAYS = 14;

function startOfDayUTC(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

// Bucket timestamps into a 14-slot daily array starting from `start` (UTC).
function bucketDaily(dates: Date[], start: Date): number[] {
  const out: number[] = new Array(DAYS).fill(0);
  for (const d of dates) {
    const dayIdx = Math.floor((d.getTime() - start.getTime()) / 86_400_000);
    if (dayIdx >= 0 && dayIdx < DAYS) out[dayIdx]++;
  }
  return out;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const now = new Date();
    const windowStart = startOfDayUTC(new Date(now.getTime() - (DAYS - 1) * 86_400_000));

    // First wave: core user + invitation + everything that doesn't depend on
    // invitationId.
    const [
      user,
      invitation,
      guestTotal,
      acceptedTotal,
      guestSeriesRows,
      acceptedSeriesRows,
      pendingTicketCount,
      pendingTickets,
    ] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { yourName: true, partnerName: true, email: true, plan: true },
      }),
      prisma.invitation.findFirst({
        where: { userId },
        select: { id: true, slug: true, templateSlug: true, isPublished: true, config: true },
      }),
      prisma.guest.count({ where: { userId } }),
      prisma.guest.count({ where: { userId, rsvpStatus: "ACCEPTED" } }),
      prisma.guest.findMany({
        where: { userId, createdAt: { gte: windowStart } },
        select: { createdAt: true },
      }),
      prisma.guest.findMany({
        where: { userId, rsvpStatus: "ACCEPTED", updatedAt: { gte: windowStart } },
        select: { updatedAt: true },
      }),
      prisma.supportTicket.count({ where: { userId, status: "PENDING" } }),
      prisma.supportTicket.findMany({
        where: { userId, status: "PENDING" },
        orderBy: { updatedAt: "desc" },
        take: 5,
        select: { id: true, subject: true, priority: true, updatedAt: true },
      }),
    ]);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Second wave: page views only if the user has an invitation row yet.
    // New accounts auto-create an invitation at signup, so this is normally
    // true — but guard anyway so a deleted-invitation admin action can't 500
    // the dashboard.
    const [pageViewsTotal, pageViewSeriesRows] = invitation
      ? await Promise.all([
          prisma.pageView.count({ where: { invitationId: invitation.id } }),
          prisma.pageView.findMany({
            where: { invitationId: invitation.id, viewedAt: { gte: windowStart } },
            select: { viewedAt: true },
          }),
        ])
      : [0, [] as { viewedAt: Date }[]];

    const guestSeries = bucketDaily(
      guestSeriesRows.map((g) => g.createdAt),
      windowStart
    );
    const acceptedSeries = bucketDaily(
      acceptedSeriesRows.map((g) => g.updatedAt),
      windowStart
    );
    const pageViewSeries = bucketDaily(
      pageViewSeriesRows.map((p) => p.viewedAt),
      windowStart
    );

    return NextResponse.json({
      user: {
        name: displayName(user.yourName, user.partnerName, user.email),
        plan: user.plan,
      },
      invitation: invitation
        ? { slug: invitation.slug, isPublished: invitation.isPublished }
        : null,
      stats: {
        guests: { total: guestTotal, series: guestSeries },
        rsvps: { total: acceptedTotal, series: acceptedSeries },
        pageViews: { total: pageViewsTotal, series: pageViewSeries },
        template: invitation?.templateSlug ?? null,
      },
      gettingStarted: {
        // "royal-elegance" is the default slug the signup flow sets; anything
        // else means the user picked a template deliberately.
        templateChosen: invitation ? invitation.templateSlug !== "royal-elegance" : false,
        guestsAdded: guestTotal > 0,
        // Any saved editor customization lives in Invitation.config (JSON).
        invitationEdited: invitation ? invitation.config !== null : false,
        published: invitation?.isPublished ?? false,
      },
      notifications: {
        count: pendingTicketCount,
        items: pendingTickets.map((t) => ({
          id: t.id,
          kind: "support.pending" as const,
          subject: t.subject,
          priority: t.priority,
          updatedAt: t.updatedAt.toISOString(),
          href: `/dashboard/support/${t.id}`,
        })),
      },
    });
  } catch (error) {
    console.error("Dashboard overview error:", error);
    return NextResponse.json(
      { error: "Failed to load dashboard" },
      { status: 500 }
    );
  }
}
