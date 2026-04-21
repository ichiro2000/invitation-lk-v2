import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { logAdminAction } from "@/lib/audit-log";

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
      select: { role: true },
    });
    if (me?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    if (id === session.user.id) {
      return NextResponse.json({ error: "Cannot suspend your own account" }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const reason = typeof body.reason === "string" ? body.reason.trim() : "";
    if (!reason) {
      return NextResponse.json({ error: "Reason is required" }, { status: 400 });
    }
    if (reason.length > 500) {
      return NextResponse.json({ error: "Reason must be 500 characters or fewer" }, { status: 400 });
    }

    const target = await prisma.user.findUnique({
      where: { id },
      select: { role: true, email: true, suspendedAt: true },
    });
    if (!target) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    if (target.role === "ADMIN") {
      return NextResponse.json(
        { error: "Demote this admin to CUSTOMER before suspending" },
        { status: 400 }
      );
    }
    if (target.suspendedAt) {
      return NextResponse.json(
        { error: "User is already suspended" },
        { status: 409 }
      );
    }

    const suspendedAt = new Date();
    const updated = await prisma.user.update({
      where: { id },
      data: { suspendedAt, suspendedReason: reason },
      select: { id: true, email: true, suspendedAt: true, suspendedReason: true },
    });

    // Kill active DB sessions so the target user is kicked on next request
    // that triggers a session refresh (belt + suspenders on top of the JWT
    // claim refresh that happens at the next session update()).
    await prisma.session.deleteMany({ where: { userId: id } }).catch(() => {});

    await logAdminAction({
      actorUserId: session.user.id,
      action: "user.suspend",
      targetType: "User",
      targetId: id,
      metadata: { email: target.email, reason, suspendedAt: suspendedAt.toISOString() },
      request,
    });

    return NextResponse.json({ user: updated });
  } catch (error) {
    console.error("Admin suspend user error:", error);
    return NextResponse.json(
      { error: "Failed to suspend user" },
      { status: 500 }
    );
  }
}
