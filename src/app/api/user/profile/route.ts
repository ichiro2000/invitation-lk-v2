import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

// Reads + writes the signed-in user's own profile. Intentionally decoupled
// from the Invitation model — editing wedding date/venue here updates the
// User record only. The published invitation is edited via the invitation
// editor (which is the canonical source of what guests see).

const MAX_NAME = 120;
const MAX_PHONE = 40;
const MAX_VENUE = 200;

function isNonEmpty(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const [user, invitation, guestCount, pageViewSum, lastOrder] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          emailVerified: true,
          yourName: true,
          partnerName: true,
          phone: true,
          weddingDate: true,
          venue: true,
          plan: true,
          notifyEmailUpdates: true,
          notifyRsvpAlerts: true,
          notifyMarketingEmails: true,
          createdAt: true,
        },
      }),
      prisma.invitation.findFirst({
        where: { userId },
        select: { id: true, slug: true, isPublished: true },
      }),
      prisma.guest.count({ where: { userId } }),
      (async () => {
        const inv = await prisma.invitation.findFirst({
          where: { userId },
          select: { id: true },
        });
        if (!inv) return 0;
        return prisma.pageView.count({ where: { invitationId: inv.id } });
      })(),
      prisma.order.findFirst({
        where: { userId, paymentStatus: "COMPLETED" },
        orderBy: { createdAt: "desc" },
        select: { plan: true, amount: true, currency: true, paymentMethod: true, createdAt: true },
      }),
    ]);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      profile: {
        email: user.email,
        emailVerified: !!user.emailVerified,
        yourName: user.yourName,
        partnerName: user.partnerName,
        phone: user.phone,
        weddingDate: user.weddingDate ? user.weddingDate.toISOString().slice(0, 10) : "",
        venue: user.venue,
        plan: user.plan,
        memberSince: user.createdAt.toISOString(),
        notifyEmailUpdates: user.notifyEmailUpdates,
        notifyRsvpAlerts: user.notifyRsvpAlerts,
        notifyMarketingEmails: user.notifyMarketingEmails,
      },
      invitation: invitation
        ? { slug: invitation.slug, isPublished: invitation.isPublished }
        : null,
      usage: {
        guestCount,
        pageViews: pageViewSum,
      },
      lastPayment: lastOrder
        ? {
            plan: lastOrder.plan,
            amount: lastOrder.amount.toString(),
            currency: lastOrder.currency,
            method: lastOrder.paymentMethod,
            paidAt: lastOrder.createdAt.toISOString(),
          }
        : null,
    });
  } catch (error) {
    console.error("User profile GET error:", error);
    return NextResponse.json({ error: "Failed to load profile" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }

    const errors: Record<string, string> = {};
    const data: {
      yourName?: string;
      partnerName?: string;
      phone?: string | null;
      weddingDate?: Date | null;
      venue?: string | null;
      notifyEmailUpdates?: boolean;
      notifyRsvpAlerts?: boolean;
      notifyMarketingEmails?: boolean;
    } = {};

    if (body.yourName !== undefined) {
      if (typeof body.yourName !== "string") errors.yourName = "Must be a string";
      else if (body.yourName.trim().length > MAX_NAME) errors.yourName = `Max ${MAX_NAME} characters`;
      else data.yourName = body.yourName.trim();
    }
    if (body.partnerName !== undefined) {
      if (typeof body.partnerName !== "string") errors.partnerName = "Must be a string";
      else if (body.partnerName.trim().length > MAX_NAME) errors.partnerName = `Max ${MAX_NAME} characters`;
      else data.partnerName = body.partnerName.trim();
    }
    if (body.phone !== undefined) {
      if (body.phone === null || body.phone === "") data.phone = null;
      else if (typeof body.phone !== "string") errors.phone = "Must be a string";
      else if (body.phone.trim().length > MAX_PHONE) errors.phone = `Max ${MAX_PHONE} characters`;
      else data.phone = body.phone.trim();
    }
    if (body.weddingDate !== undefined) {
      if (body.weddingDate === null || body.weddingDate === "") {
        data.weddingDate = null;
      } else if (!isNonEmpty(body.weddingDate)) {
        errors.weddingDate = "Must be a string";
      } else {
        const d = new Date(body.weddingDate);
        if (isNaN(d.getTime())) errors.weddingDate = "Invalid date";
        else data.weddingDate = d;
      }
    }
    if (body.venue !== undefined) {
      if (body.venue === null || body.venue === "") data.venue = null;
      else if (typeof body.venue !== "string") errors.venue = "Must be a string";
      else if (body.venue.trim().length > MAX_VENUE) errors.venue = `Max ${MAX_VENUE} characters`;
      else data.venue = body.venue.trim();
    }
    for (const key of ["notifyEmailUpdates", "notifyRsvpAlerts", "notifyMarketingEmails"] as const) {
      if (body[key] !== undefined) {
        if (typeof body[key] !== "boolean") errors[key] = "Must be true or false";
        else data[key] = body[key];
      }
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ error: "Validation failed", errors }, { status: 400 });
    }
    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("User profile PATCH error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
