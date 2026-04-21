import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { Plan, Role } from "@/generated/prisma/client";
import { logAdminAction } from "@/lib/audit-log";

const validPlans = Object.values(Plan);
const validRoles = Object.values(Role);

export async function GET(
  _request: Request,
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

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true, email: true, yourName: true, partnerName: true,
        weddingDate: true, venue: true, phone: true, image: true,
        role: true, plan: true, emailVerified: true,
        createdAt: true, updatedAt: true,
        invitations: {
          select: {
            id: true, slug: true, templateSlug: true,
            groomName: true, brideName: true, weddingDate: true,
            venue: true, isPublished: true, isPaid: true, createdAt: true,
            _count: { select: { events: true, pageViews: true } },
          },
          orderBy: { createdAt: "desc" },
        },
        orders: {
          select: {
            id: true, plan: true, amount: true, currency: true,
            paymentMethod: true, paymentStatus: true, createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: { guests: true, tasks: true, vendors: true, budgetItems: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const [guestRsvp, accounts, lastSession] = await Promise.all([
      prisma.guest.groupBy({
        by: ["rsvpStatus"],
        where: { userId: id },
        _count: { _all: true },
      }),
      prisma.account.findMany({
        where: { userId: id },
        select: { provider: true },
      }),
      prisma.session.findFirst({
        where: { userId: id },
        orderBy: { expires: "desc" },
        select: { expires: true },
      }),
    ]);

    const rsvp = { PENDING: 0, ACCEPTED: 0, DECLINED: 0, MAYBE: 0 };
    for (const g of guestRsvp) rsvp[g.rsvpStatus] = g._count._all;

    return NextResponse.json({
      user,
      guestRsvp: rsvp,
      providers: accounts.map((a) => a.provider),
      lastSessionExpires: lastSession?.expires ?? null,
    });
  } catch (error) {
    console.error("Admin get user error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (currentUser?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { plan, role } = body;

    if (id === session.user.id && role !== undefined) {
      return NextResponse.json({ error: "Cannot modify your own role" }, { status: 400 });
    }

    const data: { plan?: Plan; role?: Role } = {};

    if (plan !== undefined) {
      if (!validPlans.includes(plan)) {
        return NextResponse.json(
          { error: `Invalid plan. Must be one of: ${validPlans.join(", ")}` },
          { status: 400 }
        );
      }
      data.plan = plan;
    }

    if (role !== undefined) {
      if (!validRoles.includes(role)) {
        return NextResponse.json(
          { error: `Invalid role. Must be one of: ${validRoles.join(", ")}` },
          { status: 400 }
        );
      }
      data.role = role;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    const before = await prisma.user.findUnique({
      where: { id },
      select: { plan: true, role: true, email: true },
    });

    const updatedUser = await prisma.user.update({
      where: { id },
      data,
      select: { id: true, email: true, yourName: true, partnerName: true, phone: true, role: true, plan: true, createdAt: true },
    });

    if (before && data.plan !== undefined && before.plan !== data.plan) {
      await logAdminAction({
        actorUserId: session.user.id,
        action: "user.plan.update",
        targetType: "User",
        targetId: id,
        metadata: { email: before.email, from: before.plan, to: data.plan },
        request,
      });
    }
    if (before && data.role !== undefined && before.role !== data.role) {
      await logAdminAction({
        actorUserId: session.user.id,
        action: "user.role.update",
        targetType: "User",
        targetId: id,
        metadata: { email: before.email, from: before.role, to: data.role },
        request,
      });
    }

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error("Admin update user error:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (currentUser?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    if (id === session.user.id) {
      return NextResponse.json(
        { error: "Cannot delete your own account" },
        { status: 400 }
      );
    }

    const target = await prisma.user.findUnique({
      where: { id },
      select: { role: true, email: true, yourName: true, plan: true },
    });

    if (!target) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Guard against accidentally removing another admin from the panel —
    // demote them first if that's really the intent.
    if (target.role === "ADMIN") {
      return NextResponse.json(
        { error: "Demote this admin to CUSTOMER before deleting" },
        { status: 400 }
      );
    }

    // User has onDelete: Cascade on accounts, sessions, invitations, guests,
    // tasks, vendors, budgetItems, and orders (which cascades into
    // bankTransfers), so a single delete cleans everything up.
    await prisma.user.delete({ where: { id } });

    await logAdminAction({
      actorUserId: session.user.id,
      action: "user.delete",
      targetType: "User",
      targetId: id,
      metadata: {
        email: target.email,
        yourName: target.yourName,
        plan: target.plan,
      },
      request,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Admin delete user error:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
