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
      select: { role: true, twoFactorEnabledAt: true },
    });
    if (me?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const unusedBackupCodes = me.twoFactorEnabledAt
      ? await prisma.twoFactorBackupCode.count({
          where: { userId: session.user.id, usedAt: null },
        })
      : 0;

    return NextResponse.json({
      enabled: !!me.twoFactorEnabledAt,
      enabledAt: me.twoFactorEnabledAt?.toISOString() ?? null,
      unusedBackupCodes,
    });
  } catch (error) {
    console.error("2FA status error:", error);
    return NextResponse.json(
      { error: "Failed to fetch 2FA status" },
      { status: 500 }
    );
  }
}
