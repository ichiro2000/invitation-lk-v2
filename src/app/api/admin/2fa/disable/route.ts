import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { verifyTotp, verifyBackupCode } from "@/lib/totp";
import {
  twoFactorCookieName,
  twoFactorCookieOptions,
} from "@/lib/twofactor-cookie";
import { logAdminAction } from "@/lib/audit-log";

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
    if (!code) {
      return NextResponse.json(
        { error: "Enter a current 6-digit code or a backup code" },
        { status: 400 }
      );
    }

    let ok = false;
    if (/^\d{6}$/.test(code)) {
      ok = verifyTotp(me.twoFactorSecret, code);
    } else {
      const candidates = await prisma.twoFactorBackupCode.findMany({
        where: { userId: session.user.id, usedAt: null },
        select: { id: true, codeHash: true },
      });
      for (const c of candidates) {
        if (await verifyBackupCode(code, c.codeHash)) {
          ok = true;
          break;
        }
      }
    }

    if (!ok) {
      return NextResponse.json({ error: "Invalid code" }, { status: 400 });
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: session.user.id },
        data: { twoFactorSecret: null, twoFactorEnabledAt: null },
      }),
      prisma.twoFactorBackupCode.deleteMany({ where: { userId: session.user.id } }),
    ]);

    await logAdminAction({
      actorUserId: session.user.id,
      action: "user.2fa.disable",
      targetType: "User",
      targetId: session.user.id,
      metadata: { email: me.email },
      request,
    });

    const response = NextResponse.json({ ok: true });
    response.cookies.set({
      name: twoFactorCookieName(),
      value: "",
      ...twoFactorCookieOptions(0),
    });
    return response;
  } catch (error) {
    console.error("2FA disable error:", error);
    return NextResponse.json(
      { error: "Failed to disable 2FA" },
      { status: 500 }
    );
  }
}
