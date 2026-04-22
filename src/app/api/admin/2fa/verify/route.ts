import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { verifyTotp, verifyBackupCode } from "@/lib/totp";
import {
  twoFactorCookieName,
  twoFactorCookieOptions,
  issueTwoFactorCookieValue,
  TWO_FACTOR_COOKIE_TTL_SECONDS,
} from "@/lib/twofactor-cookie";

// Login challenge. Accepts either a current TOTP code or an unused backup
// code. On success, sets the 12-hour admin-2fa cookie.
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const me = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, twoFactorSecret: true, twoFactorEnabledAt: true },
    });
    if (me?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (!me.twoFactorEnabledAt || !me.twoFactorSecret) {
      return NextResponse.json(
        { error: "2FA is not enabled for this account" },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const code = typeof body.code === "string" ? body.code.trim() : "";
    if (!code) {
      return NextResponse.json({ error: "code is required" }, { status: 400 });
    }

    let usedBackupCodeId: string | null = null;
    let ok = false;

    if (/^\d{6}$/.test(code)) {
      ok = verifyTotp(me.twoFactorSecret, code);
    } else {
      // Try backup codes (unused only). Must compare against each stored hash.
      const candidates = await prisma.twoFactorBackupCode.findMany({
        where: { userId: session.user.id, usedAt: null },
        select: { id: true, codeHash: true },
      });
      for (const c of candidates) {
        if (await verifyBackupCode(code, c.codeHash)) {
          ok = true;
          usedBackupCodeId = c.id;
          break;
        }
      }
    }

    if (!ok) {
      return NextResponse.json({ error: "Invalid code" }, { status: 400 });
    }

    if (usedBackupCodeId) {
      await prisma.twoFactorBackupCode.update({
        where: { id: usedBackupCodeId },
        data: { usedAt: new Date() },
      });
    }

    const nextauthSecret = process.env.NEXTAUTH_SECRET ?? "";
    const cookieValue = await issueTwoFactorCookieValue(nextauthSecret);
    const response = NextResponse.json({ ok: true, usedBackupCode: !!usedBackupCodeId });
    response.cookies.set({
      name: twoFactorCookieName(),
      value: cookieValue,
      ...twoFactorCookieOptions(TWO_FACTOR_COOKIE_TTL_SECONDS),
    });
    return response;
  } catch (error) {
    console.error("2FA verify error:", error);
    return NextResponse.json(
      { error: "Failed to verify 2FA code" },
      { status: 500 }
    );
  }
}
