import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id");
    const orderId = searchParams.get("order_id");

    if (!sessionId && !orderId) {
      return NextResponse.json(
        { error: "order_id or session_id required" },
        { status: 400 }
      );
    }

    const order = orderId
      ? await prisma.order.findUnique({ where: { id: orderId } })
      : await prisma.order.findUnique({ where: { stripeSessionId: sessionId! } });

    if (!order || order.userId !== session.user.id) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({
      status: order.paymentStatus,
      plan: order.plan,
      amount: Number(order.amount),
    });
  } catch (error) {
    console.error("Checkout verify error:", error);
    return NextResponse.json(
      { error: "Failed to verify checkout" },
      { status: 500 }
    );
  }
}
