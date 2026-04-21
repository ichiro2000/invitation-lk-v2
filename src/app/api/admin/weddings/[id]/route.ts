import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

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

    const invitation = await prisma.invitation.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true, email: true, yourName: true, partnerName: true,
            phone: true, plan: true, role: true, emailVerified: true,
            createdAt: true,
          },
        },
        events: { orderBy: { sortOrder: "asc" } },
        _count: { select: { pageViews: true } },
      },
    });

    if (!invitation) {
      return NextResponse.json({ error: "Wedding not found" }, { status: 404 });
    }

    const [guests, rsvpGroups, orders, recentViews] = await Promise.all([
      prisma.guest.findMany({
        where: { userId: invitation.userId },
        orderBy: { createdAt: "desc" },
        take: 50,
        select: {
          id: true, name: true, email: true, whatsapp: true,
          rsvpStatus: true, headCount: true, confirmedCount: true,
          category: true, side: true, inviteSent: true, linkOpened: true,
          createdAt: true,
        },
      }),
      prisma.guest.groupBy({
        by: ["rsvpStatus"],
        where: { userId: invitation.userId },
        _count: { _all: true },
      }),
      prisma.order.findMany({
        where: { userId: invitation.userId },
        orderBy: { createdAt: "desc" },
        select: {
          id: true, plan: true, amount: true, currency: true,
          paymentMethod: true, paymentStatus: true, createdAt: true,
        },
      }),
      prisma.pageView.count({
        where: {
          invitationId: invitation.id,
          viewedAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
      }),
    ]);

    const rsvp = { PENDING: 0, ACCEPTED: 0, DECLINED: 0, MAYBE: 0 };
    for (const g of rsvpGroups) rsvp[g.rsvpStatus] = g._count._all;
    const guestTotal = rsvp.PENDING + rsvp.ACCEPTED + rsvp.DECLINED + rsvp.MAYBE;

    return NextResponse.json({
      invitation,
      guests,
      guestSummary: { ...rsvp, total: guestTotal },
      orders,
      pageViews30d: recentViews,
    });
  } catch (error) {
    console.error("Admin wedding detail error:", error);
    return NextResponse.json(
      { error: "Failed to fetch wedding" },
      { status: 500 }
    );
  }
}
