import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { encode } from "next-auth/jwt";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { logAdminAction } from "@/lib/audit-log";
import {
  sessionCookieName,
  backupCookieName,
  cookieOptions,
} from "@/lib/impersonation";

// Impersonation sessions last at most 1 hour. Admin can exit anytime.
const IMPERSONATION_MAX_AGE = 60 * 60;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const me = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, email: true, suspendedAt: true },
    });
    if (me?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (me.suspendedAt) {
      return NextResponse.json({ error: "Account suspended" }, { status: 403 });
    }

    if (session.user.impersonatedBy) {
      return NextResponse.json(
        { error: "Already impersonating. Exit first." },
        { status: 409 }
      );
    }

    const { id } = await params;

    if (id === session.user.id) {
      return NextResponse.json(
        { error: "Cannot impersonate yourself" },
        { status: 400 }
      );
    }

    const target = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true, email: true, yourName: true, partnerName: true,
        role: true, plan: true, emailVerified: true, image: true,
        suspendedAt: true,
      },
    });
    if (!target) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    if (target.role === "ADMIN") {
      return NextResponse.json(
        { error: "Cannot impersonate another admin" },
        { status: 400 }
      );
    }
    if (target.suspendedAt) {
      return NextResponse.json(
        { error: "Cannot impersonate a suspended user. Unsuspend first." },
        { status: 400 }
      );
    }

    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret) {
      return NextResponse.json(
        { error: "Server misconfigured: NEXTAUTH_SECRET not set" },
        { status: 500 }
      );
    }

    // Back up the admin's current session cookie exactly as it is — it stays
    // a valid encrypted JWT, ready to be restored on exit.
    const adminCookie = request.headers.get("cookie") ?? "";
    const sessionName = sessionCookieName();
    const backupName = backupCookieName();
    const adminJwtMatch = adminCookie
      .split(/;\s*/)
      .find((c) => c.startsWith(`${sessionName}=`));
    if (!adminJwtMatch) {
      return NextResponse.json(
        { error: "Could not read your session cookie to back up" },
        { status: 400 }
      );
    }
    const adminJwt = decodeURIComponent(adminJwtMatch.split("=").slice(1).join("="));

    const now = Math.floor(Date.now() / 1000);
    const impersonationToken = await encode({
      secret,
      maxAge: IMPERSONATION_MAX_AGE,
      token: {
        sub: target.id,
        id: target.id,
        name: target.yourName && target.partnerName
          ? `${target.yourName} & ${target.partnerName}`
          : target.yourName || target.email,
        email: target.email,
        picture: target.image ?? null,
        role: target.role,
        plan: target.plan,
        emailVerified: target.emailVerified
          ? target.emailVerified.toISOString()
          : null,
        suspended: !!target.suspendedAt,
        impersonatedBy: session.user.id,
        twoFactorEnabled: false,
        iat: now,
        exp: now + IMPERSONATION_MAX_AGE,
        jti: `impersonation-${session.user.id}-${target.id}-${now}`,
      },
    });

    await logAdminAction({
      actorUserId: session.user.id,
      action: "user.impersonate.start",
      targetType: "User",
      targetId: target.id,
      metadata: {
        targetEmail: target.email,
        targetPlan: target.plan,
        adminEmail: me.email,
        expiresInSeconds: IMPERSONATION_MAX_AGE,
      },
      request,
    });

    const response = NextResponse.json({
      ok: true,
      target: { id: target.id, email: target.email },
    });

    response.cookies.set({
      name: backupName,
      value: adminJwt,
      ...cookieOptions(IMPERSONATION_MAX_AGE + 600),
    });
    response.cookies.set({
      name: sessionName,
      value: impersonationToken,
      ...cookieOptions(IMPERSONATION_MAX_AGE),
    });

    return response;
  } catch (error) {
    console.error("Admin impersonate error:", error);
    return NextResponse.json(
      { error: "Failed to start impersonation" },
      { status: 500 }
    );
  }
}
