import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { getUpgradeAmount, isUpgrade } from "@/lib/plans";
import { checkoutLimiter } from "@/lib/rate-limit";
import { getFlag } from "@/lib/settings-read";
import type { Plan } from "@/generated/prisma/client";

const VALID_PLANS = ["BASIC", "STANDARD", "PREMIUM"];

// TODO: receiptImage is stored as base64 TEXT in Postgres. Once traffic picks
// up, move to DO Spaces / S3 and keep only the key here. Current cap is ~5MB
// per row so it's manageable for now.

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!(await getFlag("feature_bank_transfer"))) {
      return NextResponse.json(
        { error: "Bank transfer is temporarily unavailable. Please try another method." },
        { status: 503 }
      );
    }

    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const { success } = checkoutLimiter.check(
      5,
      `bank-transfer:${session.user.id}:${ip}`
    );
    if (!success) {
      return NextResponse.json(
        { error: "Too many submissions — please wait a moment" },
        { status: 429 }
      );
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

    // Charge the difference between the user's current plan and the target.
    // DB-sourced to guard against stale JWTs.
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { plan: true },
    });
    if (!isUpgrade(user?.plan, plan)) {
      return NextResponse.json(
        { error: "You're already on this plan or a higher one." },
        { status: 400 }
      );
    }
    const amount = getUpgradeAmount(user?.plan, plan);

    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        plan: plan as Plan,
        amount,
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
