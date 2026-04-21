import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { toCsv, csvResponseHeaders } from "@/lib/csv";

const VALID_RSVP = new Set(["PENDING", "ACCEPTED", "DECLINED", "MAYBE"]);

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
    const rsvp = searchParams.get("rsvp") ?? "";
    const userId = searchParams.get("userId") ?? "";
    const format = searchParams.get("format") ?? "json";

    const filters: Record<string, unknown>[] = [];
    if (search) {
      filters.push({
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
          { whatsapp: { contains: search, mode: "insensitive" as const } },
          { user: { email: { contains: search, mode: "insensitive" as const } } },
          { user: { yourName: { contains: search, mode: "insensitive" as const } } },
        ],
      });
    }
    if (rsvp && VALID_RSVP.has(rsvp)) {
      filters.push({ rsvpStatus: rsvp });
    }
    if (userId) {
      filters.push({ userId });
    }
    const where = filters.length > 0 ? { AND: filters } : {};

    const guests = await prisma.guest.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: format === "csv" ? 10000 : 500,
      select: {
        id: true,
        name: true,
        email: true,
        whatsapp: true,
        inviteType: true,
        headCount: true,
        confirmedCount: true,
        category: true,
        side: true,
        rsvpStatus: true,
        inviteSent: true,
        linkOpened: true,
        linkOpenedAt: true,
        createdAt: true,
        user: {
          select: { id: true, email: true, yourName: true, partnerName: true },
        },
      },
    });

    if (format === "csv") {
      const header = [
        "Guest name", "Email", "WhatsApp", "Category", "Side", "Invite type",
        "Head count", "Confirmed count", "RSVP status", "Invite sent", "Link opened",
        "Couple", "Couple email", "Created at",
      ];
      const rows = guests.map((g) => [
        g.name, g.email, g.whatsapp, g.category, g.side, g.inviteType,
        g.headCount, g.confirmedCount, g.rsvpStatus,
        g.inviteSent ? "yes" : "no", g.linkOpened ? "yes" : "no",
        g.user?.yourName ?? "", g.user?.email ?? "",
        g.createdAt.toISOString(),
      ]);
      return new NextResponse(toCsv(header, rows), {
        status: 200,
        headers: csvResponseHeaders("guests"),
      });
    }

    return NextResponse.json({ guests });
  } catch (error) {
    console.error("Admin guests error:", error);
    return NextResponse.json(
      { error: "Failed to fetch guests" },
      { status: 500 }
    );
  }
}
