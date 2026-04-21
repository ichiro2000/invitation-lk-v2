import { NextResponse } from "next/server";
import { getToken, decode } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import prisma from "@/lib/db";
import { logAdminAction } from "@/lib/audit-log";
import {
  sessionCookieName,
  backupCookieName,
  cookieOptions,
} from "@/lib/impersonation";

// Exits an impersonation session and restores the admin's original JWT.
// Not under /api/admin on purpose — middleware role-check would block it
// since the current session role is CUSTOMER during impersonation.
export async function POST(request: NextRequest) {
  try {
    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret) {
      return NextResponse.json(
        { error: "Server misconfigured: NEXTAUTH_SECRET not set" },
        { status: 500 }
      );
    }

    const currentToken = await getToken({ req: request });
    if (!currentToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const impersonatedBy = currentToken.impersonatedBy as string | null;
    if (!impersonatedBy) {
      return NextResponse.json(
        { error: "Not currently impersonating" },
        { status: 400 }
      );
    }

    const sessionName = sessionCookieName();
    const backupName = backupCookieName();

    const backupCookie = request.cookies.get(backupName)?.value;
    if (!backupCookie) {
      return NextResponse.json(
        { error: "No impersonation backup cookie found" },
        { status: 400 }
      );
    }

    // Verify the backup actually belongs to the admin who started this
    // impersonation session. Anything else means someone attempted to
    // present a different cookie — refuse.
    const backupPayload = await decode({ token: backupCookie, secret });
    if (!backupPayload || typeof backupPayload.id !== "string") {
      return NextResponse.json(
        { error: "Impersonation backup is invalid" },
        { status: 400 }
      );
    }
    if (backupPayload.id !== impersonatedBy) {
      return NextResponse.json(
        { error: "Impersonation backup mismatch" },
        { status: 400 }
      );
    }

    // Also sanity-check the admin still exists and is still an ADMIN —
    // if they've been demoted mid-impersonation, drop to logged-out so
    // they can sign in fresh.
    const admin = await prisma.user.findUnique({
      where: { id: impersonatedBy },
      select: { role: true, email: true },
    });

    await logAdminAction({
      actorUserId: impersonatedBy,
      action: "user.impersonate.end",
      targetType: "User",
      targetId: (currentToken.id as string) ?? null,
      metadata: {
        targetId: currentToken.id ?? null,
        targetEmail: currentToken.email ?? null,
        adminEmail: admin?.email ?? null,
      },
      request,
    });

    const response = NextResponse.json({ ok: true });

    if (!admin || admin.role !== "ADMIN") {
      // Original admin is gone / demoted — clear both cookies and let the
      // browser re-authenticate normally.
      response.cookies.set({
        name: sessionName,
        value: "",
        ...cookieOptions(0),
      });
      response.cookies.set({
        name: backupName,
        value: "",
        ...cookieOptions(0),
      });
      return response;
    }

    // Restore admin session cookie from the backup payload
    response.cookies.set({
      name: sessionName,
      value: backupCookie,
      ...cookieOptions(60 * 60 * 24 * 30),
    });
    response.cookies.set({
      name: backupName,
      value: "",
      ...cookieOptions(0),
    });

    return response;
  } catch (error) {
    console.error("Impersonation exit error:", error);
    return NextResponse.json(
      { error: "Failed to exit impersonation" },
      { status: 500 }
    );
  }
}
