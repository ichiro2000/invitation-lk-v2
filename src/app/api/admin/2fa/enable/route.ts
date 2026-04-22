import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import {
  verifyTotp,
  generateBackupCodes,
  hashBackupCode,
} from "@/lib/totp";
import {
  twoFactorCookieName,
  twoFactorCookieOptions,
  issueTwoFactorCookieValue,
  TWO_FACTOR_COOKIE_TTL_SECONDS,
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
      select: { role: true, email: true, twoFactorEnabledAt: true },
    });
    if (me?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (me.twoFactorEnabledAt) {
      return NextResponse.json({ error: "2FA already enabled" }, { status: 409 });
    }

    const body = await request.json().catch(() => ({}));
    const secret = typeof body.secret === "string" ? body.secret.trim() : "";
    const code = typeof body.code === "string" ? body.code.trim() : "";
    if (!secret || !code) {
      return NextResponse.json(
        { error: "secret and code are required" },
        { status: 400 }
      );
    }

    if (!verifyTotp(secret, code)) {
      return NextResponse.json(
        { error: "Invalid code — check your authenticator app and try again" },
        { status: 400 }
      );
    }

    const backupCodes = generateBackupCodes(8);
    const hashes = await Promise.all(backupCodes.map(hashBackupCode));

    // Transaction: flip the user on + insert backup codes atomically.
    await prisma.$transaction([
      prisma.user.update({
        where: { id: session.user.id },
        data: { twoFactorSecret: secret, twoFactorEnabledAt: new Date() },
      }),
      prisma.twoFactorBackupCode.createMany({
        data: hashes.map((codeHash) => ({ userId: session.user.id, codeHash })),
      }),
    ]);

    await logAdminAction({
      actorUserId: session.user.id,
      action: "user.2fa.enable",
      targetType: "User",
      targetId: session.user.id,
      metadata: { email: me.email, backupCodesIssued: backupCodes.length },
      request,
    });

    const nextauthSecret = process.env.NEXTAUTH_SECRET ?? "";
    const cookieValue = await issueTwoFactorCookieValue(nextauthSecret);
    const response = NextResponse.json({ backupCodes });
    response.cookies.set({
      name: twoFactorCookieName(),
      value: cookieValue,
      ...twoFactorCookieOptions(TWO_FACTOR_COOKIE_TTL_SECONDS),
    });
    return response;
  } catch (error) {
    console.error("2FA enable error:", error);
    return NextResponse.json(
      { error: "Failed to enable 2FA" },
      { status: 500 }
    );
  }
}
