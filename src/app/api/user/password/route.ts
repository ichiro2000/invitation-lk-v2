import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { authLimiter } from "@/lib/rate-limit";

// In-app password change. Requires proof of the current password even though
// the user is signed in — stops an attacker who steals a short-lived session
// cookie from turning it into a permanent takeover.
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const { success } = authLimiter.check(5, `pw-change:${session.user.id}:${ip}`);
    if (!success) {
      return NextResponse.json({ error: "Too many attempts — please wait a moment" }, { status: 429 });
    }

    const body = await request.json().catch(() => null);
    const currentPassword = typeof body?.currentPassword === "string" ? body.currentPassword : "";
    const newPassword = typeof body?.newPassword === "string" ? body.newPassword : "";

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Both fields are required" }, { status: 400 });
    }
    if (newPassword.length < 8) {
      return NextResponse.json({ error: "New password must be at least 8 characters" }, { status: 400 });
    }
    if (newPassword === currentPassword) {
      return NextResponse.json({ error: "New password must differ from current" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { passwordHash: true },
    });
    if (!user?.passwordHash) {
      // OAuth-only accounts don't have a password yet. Out of scope — return
      // a clear message so the UI can guide them.
      return NextResponse.json(
        { error: "This account has no password set. Use the Forgot Password flow to create one." },
        { status: 400 }
      );
    }

    const ok = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!ok) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
    }

    const newHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: session.user.id },
      data: { passwordHash: newHash },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Password change error:", error);
    return NextResponse.json({ error: "Failed to change password" }, { status: 500 });
  }
}
