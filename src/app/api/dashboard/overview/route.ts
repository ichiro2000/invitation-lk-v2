import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { displayName } from "@/lib/user-display";

// The dashboard overview page makes one call to this endpoint and gets back
// everything it renders: user chrome, 4 stat totals, 14-day daily series for
// the 3 sparklines, getting-started checkmarks, RSVP breakdown, awaiting
// guests, wedding date/venue, and the notifications list. Keeping it in one
// request keeps the dashboard load fast and avoids the flicker of multiple
// separate loaders.

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
      rsvpGroup,
      guestSeriesRows,
      acceptedSeriesRows,
      pendingTicketCount,
      pendingTickets,
      awaitingGuests,
    ] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { yourName: true, partnerName: true, email: true, plan: true },
      }),
      prisma.invitation.findFirst({
        where: { userId },
        select: {
          id: true,
          slug: true,
          templateSlug: true,
          isPublished: true,
          config: true,
          weddingDate: true,
          venue: true,
          groomName: true,
          brideName: true,
        },
      }),
      prisma.guest.count({ where: { userId } }),
      prisma.guest.groupBy({
        by: ["rsvpStatus"],
        where: { userId },
        _count: { _all: true },
      }),
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
      // Top 5 guests still awaiting an RSVP — most recently added first so the
      // freshest invites bubble up. Used by the "Awaiting responses" panel.
      prisma.guest.findMany({
        where: { userId, rsvpStatus: "PENDING" },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, name: true, category: true, createdAt: true, inviteSent: true },
      }),
    ]);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Tally RSVPs by status into a flat shape the UI can render directly.
    const rsvpCounts = { accepted: 0, declined: 0, pending: 0, maybe: 0 };
    for (const row of rsvpGroup) {
      const key = row.rsvpStatus.toLowerCase() as keyof typeof rsvpCounts;
      if (key in rsvpCounts) rsvpCounts[key] = row._count._all;
    }
    const acceptedTotal = rsvpCounts.accepted;

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

    // Days-until calc: floor of (weddingDate - today) in days. Negative when
    // the date has passed; the UI renders that as "Wedding day was N days
    // ago" instead of a countdown.
    const today = startOfDayUTC(now);
    const weddingDate = invitation?.weddingDate ?? null;
    const daysUntil = weddingDate
      ? Math.round((startOfDayUTC(weddingDate).getTime() - today.getTime()) / 86_400_000)
      : null;

    // Last 7 days vs prior 7 days delta for page views — matches the "+23%
    // last 7 days" chip in the stat card. We already have a 14-day series so
    // it's a plain split.
    const recent7 = pageViewSeries.slice(-7).reduce((a, b) => a + b, 0);
    const prior7 = pageViewSeries.slice(0, 7).reduce((a, b) => a + b, 0);

    return NextResponse.json({
      user: {
        name: displayName(user.yourName, user.partnerName, user.email),
        plan: user.plan,
      },
      invitation: invitation
        ? {
            slug: invitation.slug,
            isPublished: invitation.isPublished,
            weddingDate: invitation.weddingDate.toISOString(),
            venue: invitation.venue,
            groomName: invitation.groomName,
            brideName: invitation.brideName,
            daysUntil,
          }
        : null,
      stats: {
        guests: { total: guestTotal, series: guestSeries, addedRecent: guestSeries.slice(-7).reduce((a, b) => a + b, 0) },
        rsvps: {
          total: acceptedTotal,
          series: acceptedSeries,
          accepted: rsvpCounts.accepted,
          declined: rsvpCounts.declined,
          pending: rsvpCounts.pending,
          maybe: rsvpCounts.maybe,
        },
        pageViews: {
          total: pageViewsTotal,
          series: pageViewSeries,
          recent7,
          prior7,
        },
        template: invitation?.templateSlug ?? null,
      },
      awaitingGuests: awaitingGuests.map((g) => ({
        id: g.id,
        name: g.name,
        category: g.category,
        addedAt: g.createdAt.toISOString(),
        inviteSent: g.inviteSent,
      })),
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
