import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

const DAY_MS = 24 * 60 * 60 * 1000;

function dayKey(d: Date) {
  return d.toISOString().slice(0, 10); // YYYY-MM-DD (UTC)
}

function monthKey(d: Date) {
  return d.toISOString().slice(0, 7); // YYYY-MM (UTC)
}

function emptyDailySeries(days: number): Record<string, number> {
  const series: Record<string, number> = {};
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today.getTime() - i * DAY_MS);
    series[dayKey(d)] = 0;
  }
  return series;
}

function emptyMonthlySeries(months: number, fromNow = true): Record<string, number> {
  const series: Record<string, number> = {};
  const now = new Date();
  now.setUTCDate(1);
  now.setUTCHours(0, 0, 0, 0);
  for (let i = 0; i < months; i++) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + (fromNow ? i : -i), 1));
    series[monthKey(d)] = 0;
  }
  return series;
}

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
    const daysParam = parseInt(searchParams.get("days") ?? "30", 10);
    const days = Math.min(Math.max(daysParam, 7), 90);

    const now = new Date();
    const from = new Date(now.getTime() - days * DAY_MS);
    const sixMonthsFromNow = new Date(now.getTime() + 180 * DAY_MS);

    const [
      signups,
      completedOrders,
      newInvitations,
      upcomingWeddings,
      templateGroups,
      paymentMethodGroups,
      paymentStatusGroups,
      rsvpGroups,
      planGroups,
      totalUsers,
      paidUsers,
      venueGroups,
    ] = await Promise.all([
      prisma.user.findMany({
        where: { createdAt: { gte: from } },
        select: { createdAt: true, plan: true },
      }),
      prisma.order.findMany({
        where: { paymentStatus: "COMPLETED", createdAt: { gte: from } },
        select: { createdAt: true, amount: true, currency: true, paymentMethod: true, plan: true },
      }),
      prisma.invitation.findMany({
        where: { createdAt: { gte: from } },
        select: { createdAt: true, isPublished: true, isPaid: true },
      }),
      prisma.invitation.findMany({
        where: { weddingDate: { gte: now, lte: sixMonthsFromNow } },
        select: { weddingDate: true },
      }),
      prisma.invitation.groupBy({
        by: ["templateSlug"],
        _count: { _all: true },
        orderBy: { _count: { templateSlug: "desc" } },
        take: 20,
      }),
      prisma.order.groupBy({
        by: ["paymentMethod"],
        where: { paymentStatus: "COMPLETED" },
        _count: { _all: true },
        _sum: { amount: true },
      }),
      prisma.order.groupBy({
        by: ["paymentStatus"],
        _count: { _all: true },
        _sum: { amount: true },
      }),
      prisma.guest.groupBy({
        by: ["rsvpStatus"],
        _count: { _all: true },
      }),
      prisma.user.groupBy({
        by: ["plan"],
        _count: { _all: true },
      }),
      prisma.user.count(),
      prisma.user.count({ where: { plan: { in: ["BASIC", "STANDARD", "PREMIUM"] } } }),
      prisma.invitation.groupBy({
        by: ["venue"],
        _count: { _all: true },
        orderBy: { _count: { venue: "desc" } },
        take: 10,
      }),
    ]);

    // Signup → invitation → published → paid funnel for the window.
    const signupIds = await prisma.user.findMany({
      where: { createdAt: { gte: from } },
      select: { id: true },
    });
    const ids = signupIds.map((u) => u.id);
    const [usersWithInvitation, usersPublished, usersPaid] = ids.length === 0
      ? [0, 0, 0]
      : await Promise.all([
          prisma.user.count({
            where: { id: { in: ids }, invitations: { some: {} } },
          }),
          prisma.user.count({
            where: { id: { in: ids }, invitations: { some: { isPublished: true } } },
          }),
          prisma.user.count({
            where: { id: { in: ids }, invitations: { some: { isPaid: true } } },
          }),
        ]);

    const signupsByDay = emptyDailySeries(days);
    for (const u of signups) {
      const k = dayKey(u.createdAt);
      if (k in signupsByDay) signupsByDay[k]++;
    }

    const revenueByDay = emptyDailySeries(days);
    for (const o of completedOrders) {
      const k = dayKey(o.createdAt);
      if (k in revenueByDay) revenueByDay[k] += Number(o.amount);
    }

    const ordersByDay = emptyDailySeries(days);
    for (const o of completedOrders) {
      const k = dayKey(o.createdAt);
      if (k in ordersByDay) ordersByDay[k]++;
    }

    const invitationsByDay = emptyDailySeries(days);
    for (const inv of newInvitations) {
      const k = dayKey(inv.createdAt);
      if (k in invitationsByDay) invitationsByDay[k]++;
    }

    const weddingsByMonth = emptyMonthlySeries(6);
    for (const w of upcomingWeddings) {
      const k = monthKey(w.weddingDate);
      if (k in weddingsByMonth) weddingsByMonth[k]++;
    }

    const rsvp = { PENDING: 0, ACCEPTED: 0, DECLINED: 0, MAYBE: 0 };
    for (const r of rsvpGroups) rsvp[r.rsvpStatus] = r._count._all;
    const rsvpTotal = rsvp.PENDING + rsvp.ACCEPTED + rsvp.DECLINED + rsvp.MAYBE;

    const planBreakdown = { FREE: 0, BASIC: 0, STANDARD: 0, PREMIUM: 0 };
    for (const p of planGroups) planBreakdown[p.plan] = p._count._all;

    const totalRevenue = completedOrders.reduce((sum, o) => sum + Number(o.amount), 0);
    const avgOrderValue = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;
    const conversionRate = totalUsers > 0 ? (paidUsers / totalUsers) * 100 : 0;
    const publishedInvitations = newInvitations.filter((i) => i.isPublished).length;
    const paidInvitations = newInvitations.filter((i) => i.isPaid).length;

    return NextResponse.json({
      window: { days, from: from.toISOString(), to: now.toISOString() },
      summary: {
        totalRevenue,
        avgOrderValue,
        orderCount: completedOrders.length,
        newSignups: signups.length,
        newInvitations: newInvitations.length,
        publishedInvitations,
        paidInvitations,
        conversionRate,
        totalUsers,
        paidUsers,
      },
      series: {
        signupsByDay,
        revenueByDay,
        ordersByDay,
        invitationsByDay,
        weddingsByMonth,
      },
      distributions: {
        rsvp,
        rsvpTotal,
        planBreakdown,
        templates: templateGroups.map((t) => ({
          slug: t.templateSlug,
          count: t._count._all,
        })),
        paymentMethods: paymentMethodGroups.map((g) => ({
          method: g.paymentMethod,
          count: g._count._all,
          revenue: g._sum.amount?.toString() ?? "0",
        })),
        paymentStatuses: paymentStatusGroups.map((g) => ({
          status: g.paymentStatus,
          count: g._count._all,
          amount: g._sum.amount?.toString() ?? "0",
        })),
        venues: venueGroups.map((v) => ({
          venue: v.venue,
          count: v._count._all,
        })),
      },
      funnel: {
        signups: signups.length,
        hasInvitation: usersWithInvitation,
        published: usersPublished,
        paid: usersPaid,
        neverActivated: Math.max(0, signups.length - usersWithInvitation),
      },
    });
  } catch (error) {
    console.error("Admin reports error:", error);
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}
