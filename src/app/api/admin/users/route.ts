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

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const format = searchParams.get("format");

    const where = search
      ? {
          OR: [
            { email: { contains: search, mode: "insensitive" as const } },
            { yourName: { contains: search, mode: "insensitive" as const } },
            { partnerName: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {};

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        yourName: true,
        partnerName: true,
        phone: true,
        role: true,
        plan: true,
        emailVerified: true,
        suspendedAt: true,
        suspendedReason: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: format === "csv" ? 10000 : undefined,
    });

    if (format === "csv") {
      const header = [
        "User ID", "Name", "Partner", "Email", "Email verified",
        "Phone", "Role", "Plan", "Suspended", "Suspended reason", "Joined",
      ];
      const rows = users.map((u) => [
        u.id,
        u.yourName ?? "",
        u.partnerName ?? "",
        u.email,
        u.emailVerified ? "yes" : "no",
        u.phone ?? "",
        u.role,
        u.plan,
        u.suspendedAt ? u.suspendedAt.toISOString() : "",
        u.suspendedReason ?? "",
        u.createdAt.toISOString(),
      ]);
      return new NextResponse(toCsv(header, rows), {
        status: 200,
        headers: csvResponseHeaders("users"),
      });
    }

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Admin users error:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
