import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

// Tiny endpoint that powers the sidebar countdown card. Kept separate from
// the heavy /api/dashboard/overview fetch so it can be loaded by the layout
// (which mounts before the page) without pulling stat aggregates we don't
// need here. Layout fetches once per mount.

function startOfDayUTC(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const invitation = await prisma.invitation.findFirst({
      where: { userId: session.user.id },
      select: { weddingDate: true, venue: true, slug: true, isPublished: true },
    });

    if (!invitation) {
      return NextResponse.json({ invitation: null });
    }

    const today = startOfDayUTC(new Date());
    const daysUntil = Math.round(
      (startOfDayUTC(invitation.weddingDate).getTime() - today.getTime()) / 86_400_000
    );

    return NextResponse.json({
      invitation: {
        weddingDate: invitation.weddingDate.toISOString(),
        venue: invitation.venue,
        slug: invitation.slug,
        isPublished: invitation.isPublished,
        daysUntil,
      },
    });
  } catch (error) {
    console.error("Sidebar info error:", error);
    return NextResponse.json({ error: "Failed to load sidebar info" }, { status: 500 });
  }
}
