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

    const target = await prisma.user.findUnique({
      where: { id },
      select: { email: true, suspendedAt: true, suspendedReason: true },
    });
    if (!target) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    if (!target.suspendedAt) {
      return NextResponse.json(
        { error: "User is not suspended" },
        { status: 409 }
      );
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { suspendedAt: null, suspendedReason: null },
      select: { id: true, email: true, suspendedAt: true },
    });

    await logAdminAction({
      actorUserId: session.user.id,
      action: "user.unsuspend",
      targetType: "User",
      targetId: id,
      metadata: {
        email: target.email,
        priorReason: target.suspendedReason,
        priorSuspendedAt: target.suspendedAt?.toISOString(),
      },
      request,
    });

    return NextResponse.json({ user: updated });
  } catch (error) {
    console.error("Admin unsuspend user error:", error);
    return NextResponse.json(
      { error: "Failed to unsuspend user" },
      { status: 500 }
    );
  }
}
