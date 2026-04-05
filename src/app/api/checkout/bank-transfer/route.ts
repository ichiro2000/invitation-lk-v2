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

    if (!receiptImage || typeof receiptImage !== "string") {
      return NextResponse.json(
        { error: "Receipt image is required" },
        { status: 400 }
      );
    }

    if (
      !receiptImage.startsWith("data:image/jpeg;base64,") &&
      !receiptImage.startsWith("data:image/png;base64,")
    ) {
      return NextResponse.json(
        { error: "Receipt must be a JPEG or PNG image" },
        { status: 400 }
      );
    }

    if (receiptImage.length > 7_000_000) {
      return NextResponse.json(
        { error: "Receipt image must be less than 5MB" },
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
