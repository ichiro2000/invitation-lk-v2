import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import type { PaymentStatus } from "@/generated/prisma/client";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const where = status
      ? { paymentStatus: status as PaymentStatus }
      : {};

    const rawOrders = await prisma.order.findMany({
      where,
      include: {
        user: {
          select: { email: true, yourName: true, partnerName: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Flatten data to match frontend interface
    const orders = rawOrders.map((o) => ({
      id: o.id,
      userName: `${o.user.yourName} & ${o.user.partnerName}`,
      userEmail: o.user.email,
      plan: o.plan,
      amount: Number(o.amount),
      paymentMethod: o.paymentMethod,
      status: o.paymentStatus,
      createdAt: o.createdAt.toISOString(),
    }));

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Admin orders error:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
