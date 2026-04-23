import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { PLAN_AMOUNTS, PLAN_NAMES } from "@/lib/plans";
import { checkoutLimiter } from "@/lib/rate-limit";
import { getFlag } from "@/lib/settings-read";
import { getStripe, toStripeAmount } from "@/lib/stripe";
import type { Plan } from "@/generated/prisma/client";

const VALID_PLANS = ["BASIC", "STANDARD", "PREMIUM"];
// Reuse a fresh PENDING Stripe order for ~30 min to avoid piling up rows on
// double-clicks; matches the PayHere flow.
const PENDING_REUSE_WINDOW_MS = 30 * 60 * 1000;

function getAppUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXTAUTH_URL ||
    "http://localhost:3000"
  );
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!(await getFlag("feature_stripe"))) {
      return NextResponse.json(
        { error: "Stripe payments are temporarily unavailable. Please try another method." },
        { status: 503 }
      );
    }

    const stripe = getStripe();
    if (!stripe) {
      // Flag is on but env var is missing — most likely a misconfigured
      // deploy. Surface it as 503 so the UI can hide the tab and the admin
      // can fix env vars without code changes.
      return NextResponse.json(
        { error: "Stripe is not configured. Please contact support." },
        { status: 503 }
      );
    }

    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const { success } = checkoutLimiter.check(10, `stripe:${session.user.id}:${ip}`);
    if (!success) {
      return NextResponse.json(
        { error: "Too many checkout attempts — please wait a moment" },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const plan = body.plan as string | undefined;
    if (!plan || !VALID_PLANS.includes(plan)) {
      return NextResponse.json(
        { error: "Invalid plan. Must be BASIC, STANDARD, or PREMIUM" },
        { status: 400 }
      );
    }

    const amount = PLAN_AMOUNTS[plan];
    const currency = "LKR";

    // Reuse a recent PENDING Stripe order if present.
    const cutoff = new Date(Date.now() - PENDING_REUSE_WINDOW_MS);
    let order = await prisma.order.findFirst({
      where: {
        userId: session.user.id,
        plan: plan as Plan,
        paymentMethod: "STRIPE",
        paymentStatus: "PENDING",
        createdAt: { gte: cutoff },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!order) {
      order = await prisma.order.create({
        data: {
          userId: session.user.id,
          plan: plan as Plan,
          amount,
          currency,
          paymentMethod: "STRIPE",
          paymentStatus: "PENDING",
        },
      });
    }

    const appUrl = getAppUrl();
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: `${PLAN_NAMES[plan] ?? plan} — INVITATION.LK`,
            },
            unit_amount: toStripeAmount(amount),
          },
          quantity: 1,
        },
      ],
      customer_email: session.user.email ?? undefined,
      client_reference_id: order.id,
      metadata: {
        orderId: order.id,
        userId: session.user.id,
        plan,
      },
      success_url: `${appUrl}/dashboard/checkout?status=success&order_id=${order.id}`,
      cancel_url: `${appUrl}/dashboard/checkout?status=canceled&order_id=${order.id}`,
    });

    if (!checkoutSession.url) {
      return NextResponse.json(
        { error: "Failed to create checkout session" },
        { status: 502 }
      );
    }

    // Remember the Stripe session id on the order so the webhook can match.
    await prisma.order.update({
      where: { id: order.id },
      data: { paymentRef: checkoutSession.id },
    });

    return NextResponse.json({ checkoutUrl: checkoutSession.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: "Failed to start payment" },
      { status: 500 }
    );
  }
}
