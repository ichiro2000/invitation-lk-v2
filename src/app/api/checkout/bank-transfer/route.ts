import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { PLAN_AMOUNTS } from "@/lib/stripe";
import type { Plan } from "@/generated/prisma/client";

const VALID_PLANS = ["BASIC", "STANDARD", "PREMIUM"];

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { plan, receiptImage, bankReference } = await request.json();

    if (!plan || !VALID_PLANS.includes(plan)) {
      return NextResponse.json(
        { error: "Invalid plan. Must be BASIC, STANDARD, or PREMIUM" },
        { status: 400 }
      );
    }

    if (!receiptImage) {
      return NextResponse.json(
        { error: "Receipt image is required" },
        { status: 400 }
      );
    }

    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        plan: plan as Plan,
        amount: PLAN_AMOUNTS[plan],
        paymentMethod: "BANK_TRANSFER",
        paymentStatus: "PENDING",
        bankTransfer: {
          create: {
            receiptImage,
            bankReference: bankReference || null,
            status: "PENDING_REVIEW",
          },
        },
      },
      include: { bankTransfer: true },
    });

    return NextResponse.json(
      { success: true, orderId: order.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Bank transfer error:", error);
    return NextResponse.json(
      { error: "Failed to create bank transfer order" },
      { status: 500 }
    );
  }
}
