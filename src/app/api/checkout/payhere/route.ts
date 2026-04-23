import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { PLAN_AMOUNTS } from "@/lib/plans";
import { buildCheckoutHash, getPayHereConfig } from "@/lib/payhere";
import { checkoutLimiter } from "@/lib/rate-limit";
import { getFlag } from "@/lib/settings-read";
import type { Plan } from "@/generated/prisma/client";

const VALID_PLANS = ["BASIC", "STANDARD", "PREMIUM"];

// Reuse an existing PENDING order rather than creating a new row every time
// the user double-clicks Pay Now. This keeps the Order table tidy and,
// because PayHere's hash is a pure function of (merchant, order, amount,
// currency, secret), we can safely resubmit the same payload.
const PENDING_REUSE_WINDOW_MS = 30 * 60 * 1000; // 30 minutes

function getAppUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXTAUTH_URL ||
    "http://localhost:3000"
  );
}

function firstToken(input: string | null | undefined): string {
  const v = (input || "").trim();
  return v ? v.split(/\s+/)[0] : "";
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!(await getFlag("feature_payhere"))) {
      return NextResponse.json(
        { error: "Card payments are temporarily unavailable. Please try another method." },
        { status: 503 }
      );
    }

    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const { success } = checkoutLimiter.check(10, `payhere:${session.user.id}:${ip}`);
    if (!success) {
      return NextResponse.json(
        { error: "Too many checkout attempts — please wait a moment" },
        { status: 429 }
      );
    }

    const { plan } = await request.json();
    if (!plan || !VALID_PLANS.includes(plan)) {
      return NextResponse.json(
        { error: "Invalid plan. Must be BASIC, STANDARD, or PREMIUM" },
        { status: 400 }
      );
    }

    const config = getPayHereConfig();
    const amount = PLAN_AMOUNTS[plan];
    const currency = "LKR";

    // Reuse a fresh PENDING order for this (user, plan) if one exists; avoids
    // piling up orphan rows on double-clicks and retry loops.
    const existing = await prisma.order.findFirst({
      where: {
        userId: session.user.id,
        plan: plan as Plan,
        paymentMethod: "PAYHERE",
        paymentStatus: "PENDING",
        createdAt: { gte: new Date(Date.now() - PENDING_REUSE_WINDOW_MS) },
      },
      orderBy: { createdAt: "desc" },
    });

    const order =
      existing ??
      (await prisma.order.create({
        data: {
          userId: session.user.id,
          plan: plan as Plan,
          amount,
          paymentMethod: "PAYHERE",
          paymentStatus: "PENDING",
        },
      }));

    const hash = buildCheckoutHash({
      merchantId: config.merchantId,
      merchantSecret: config.merchantSecret,
      orderId: order.id,
      amount,
      currency,
    });

    const appUrl = getAppUrl();

    // Use the stored names directly — session.user.name is a derived
    // "Partner A & Partner B" string that splits badly into first/last.
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { yourName: true, partnerName: true, email: true },
    });
    const firstName = firstToken(user?.yourName) || "Customer";
    const lastName = firstToken(user?.partnerName) || "-";

    return NextResponse.json({
      checkoutUrl: config.checkoutUrl,
      mode: config.mode,
      fields: {
        merchant_id: config.merchantId,
        return_url: `${appUrl}/dashboard/checkout/success?order_id=${order.id}`,
        cancel_url: `${appUrl}/dashboard/checkout/cancel`,
        notify_url: `${appUrl}/api/checkout/payhere/notify`,
        order_id: order.id,
        items: `INVITATION.LK ${plan} Plan`,
        currency,
        amount: amount.toFixed(2),
        first_name: firstName,
        last_name: lastName,
        email: user?.email || session.user.email || "",
        phone: "",
        address: "-",
        city: "Colombo",
        country: "Sri Lanka",
        hash,
      },
    });
  } catch (error) {
    console.error("PayHere checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout" },
      { status: 500 }
    );
  }
}
