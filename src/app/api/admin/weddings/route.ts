import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { toCsv, csvResponseHeaders } from "@/lib/csv";

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
    const status = searchParams.get("status") ?? ""; // "", "published", "draft", "paid", "unpaid"
    const format = searchParams.get("format") ?? "json";

    const filters: Record<string, unknown>[] = [];
    if (search) {
      filters.push({
        OR: [
          { groomName: { contains: search, mode: "insensitive" as const } },
          { brideName: { contains: search, mode: "insensitive" as const } },
          { slug: { contains: search, mode: "insensitive" as const } },
          { venue: { contains: search, mode: "insensitive" as const } },
          { user: { email: { contains: search, mode: "insensitive" as const } } },
        ],
      });
    }
    if (status === "published") filters.push({ isPublished: true });
    if (status === "draft") filters.push({ isPublished: false });
    if (status === "paid") filters.push({ isPaid: true });
    if (status === "unpaid") filters.push({ isPaid: false });

    const where = filters.length > 0 ? { AND: filters } : {};

    const invitations = await prisma.invitation.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: format === "csv" ? 10000 : 500,
      select: {
        id: true,
        slug: true,
        templateSlug: true,
        groomName: true,
        brideName: true,
        weddingDate: true,
        venue: true,
        isPublished: true,
        isPaid: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: { id: true, email: true, yourName: true, plan: true },
        },
        _count: {
          select: { events: true, pageViews: true },
        },
      },
    });

    if (format === "csv") {
      const header = [
        "Invitation ID", "Slug", "Template", "Groom", "Bride",
        "Wedding date", "Venue", "Published", "Paid",
        "Owner name", "Owner email", "Owner plan",
        "Events", "Page views", "Created at",
      ];
      const rows = invitations.map((i) => [
        i.id,
        i.slug,
        i.templateSlug,
        i.groomName,
        i.brideName,
        i.weddingDate.toISOString().slice(0, 10),
        i.venue,
        i.isPublished ? "yes" : "no",
        i.isPaid ? "yes" : "no",
        i.user.yourName ?? "",
        i.user.email,
        i.user.plan,
        i._count.events,
        i._count.pageViews,
        i.createdAt.toISOString(),
      ]);
      return new NextResponse(toCsv(header, rows), {
        status: 200,
        headers: csvResponseHeaders("weddings"),
      });
    }

    return NextResponse.json({ invitations });
  } catch (error) {
    console.error("Admin weddings error:", error);
    return NextResponse.json(
      { error: "Failed to fetch weddings" },
      { status: 500 }
    );
  }
}
