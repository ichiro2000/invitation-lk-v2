import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET() {
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

    const now = new Date();
    const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      totalCouples,
      totalInvitations,
      publishedSites,
      paidSites,
      totalGuests,
      rsvpGroups,
      planGroups,
      pendingOrders,
      failedOrders,
      completedOrdersAgg,
      pendingBankTransfers,
      rejectedBankTransfers,
      upcomingWeddings,
      recentOrders,
      recentSignups,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: { partnerName: { not: "" } },
      }),
      prisma.invitation.count(),
      prisma.invitation.count({ where: { isPublished: true } }),
      prisma.invitation.count({ where: { isPaid: true } }),
      prisma.guest.count(),
      prisma.guest.groupBy({
        by: ["rsvpStatus"],
        _count: { _all: true },
      }),
      prisma.user.groupBy({
        by: ["plan"],
        _count: { _all: true },
      }),
      prisma.order.aggregate({
        where: { paymentStatus: "PENDING" },
        _count: { _all: true },
        _sum: { amount: true },
      }),
      prisma.order.count({ where: { paymentStatus: "FAILED" } }),
      prisma.order.aggregate({
        where: { paymentStatus: "COMPLETED" },
        _sum: { amount: true },
      }),
      prisma.bankTransfer.count({ where: { status: "PENDING_REVIEW" } }),
      prisma.bankTransfer.count({ where: { status: "REJECTED" } }),
      prisma.invitation.findMany({
        where: { weddingDate: { gte: now, lte: in30Days } },
        orderBy: { weddingDate: "asc" },
        take: 10,
        select: {
          id: true,
          slug: true,
          groomName: true,
          brideName: true,
          weddingDate: true,
          venue: true,
          isPublished: true,
        },
      }),
      prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          plan: true,
          amount: true,
          currency: true,
          paymentMethod: true,
          paymentStatus: true,
          createdAt: true,
          user: { select: { email: true, yourName: true } },
        },
      }),
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          email: true,
          yourName: true,
          partnerName: true,
          plan: true,
          createdAt: true,
        },
      }),
    ]);

    const rsvp = { PENDING: 0, ACCEPTED: 0, DECLINED: 0, MAYBE: 0 };
    for (const g of rsvpGroups) rsvp[g.rsvpStatus] = g._count._all;

    const planBreakdown = { FREE: 0, BASIC: 0, STANDARD: 0, PREMIUM: 0 };
    for (const p of planGroups) planBreakdown[p.plan] = p._count._all;

    return NextResponse.json({
      totals: {
        users: totalUsers,
        couples: totalCouples,
        invitations: totalInvitations,
        publishedSites,
        paidSites,
        guests: totalGuests,
      },
      rsvp,
      planBreakdown,
      payments: {
        pendingCount: pendingOrders._count._all,
        pendingAmount: pendingOrders._sum.amount?.toString() ?? "0",
        failedCount: failedOrders,
        completedRevenue: completedOrdersAgg._sum.amount?.toString() ?? "0",
        pendingBankTransfers,
        rejectedBankTransfers,
      },
      upcomingWeddings,
      recentOrders,
      recentSignups,
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
