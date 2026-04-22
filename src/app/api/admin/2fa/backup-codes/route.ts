import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import {
  verifyTotp,
  generateBackupCodes,
  hashBackupCode,
} from "@/lib/totp";
import { logAdminAction } from "@/lib/audit-log";

// Regenerates all backup codes. Old ones (including unused) are invalidated.
// Requires current TOTP code.
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const me = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, email: true, twoFactorSecret: true, twoFactorEnabledAt: true },
    });
    if (me?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (!me.twoFactorEnabledAt || !me.twoFactorSecret) {
      return NextResponse.json({ error: "2FA is not enabled" }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const code = typeof body.code === "string" ? body.code.trim() : "";
    if (!/^\d{6}$/.test(code) || !verifyTotp(me.twoFactorSecret, code)) {
      return NextResponse.json(
        { error: "Enter a current 6-digit code from your authenticator" },
        { status: 400 }
      );
    }

    const codes = generateBackupCodes(8);
    const hashes = await Promise.all(codes.map(hashBackupCode));

    await prisma.$transaction([
      prisma.twoFactorBackupCode.deleteMany({ where: { userId: session.user.id } }),
      prisma.twoFactorBackupCode.createMany({
        data: hashes.map((codeHash) => ({ userId: session.user.id, codeHash })),
      }),
    ]);

    await logAdminAction({
      actorUserId: session.user.id,
      action: "user.2fa.backup_codes_regenerated",
      targetType: "User",
      targetId: session.user.id,
      metadata: { email: me.email, issued: codes.length },
      request,
    });

    return NextResponse.json({ backupCodes: codes });
  } catch (error) {
    console.error("2FA backup-codes regen error:", error);
    return NextResponse.json(
      { error: "Failed to regenerate backup codes" },
      { status: 500 }
    );
  }
}
