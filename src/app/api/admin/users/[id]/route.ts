import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { Plan, Role } from "@/generated/prisma/client";

const validPlans = Object.values(Plan);
const validRoles = Object.values(Role);

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

    const updatedUser = await prisma.user.update({
      where: { id },
      data,
      select: { id: true, email: true, yourName: true, partnerName: true, phone: true, role: true, plan: true, createdAt: true },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error("Admin update user error:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}
