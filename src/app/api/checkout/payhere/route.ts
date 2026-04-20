import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { PLAN_AMOUNTS } from "@/lib/stripe";
import { buildCheckoutHash, getPayHereConfig } from "@/lib/payhere";
import type { Plan } from "@/generated/prisma/client";

const VALID_PLANS = ["BASIC", "STANDARD", "PREMIUM"];

function getAppUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXTAUTH_URL ||
    "http://localhost:3000"
  );
}

function splitName(full: string | null | undefined): { first: string; last: string } {
  const name = (full || "").trim();
  if (!name) return { first: "Customer", last: "-" };
  const parts = name.split(/\s+/);
  if (parts.length === 1) return { first: parts[0], last: "-" };
  return { first: parts[0], last: parts.slice(1).join(" ") };
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        plan: plan as Plan,
        amount,
        paymentMethod: "PAYHERE" as unknown as "STRIPE",
        paymentStatus: "PENDING",
      },
    });

    const hash = buildCheckoutHash({
      merchantId: config.merchantId,
      merchantSecret: config.merchantSecret,
      orderId: order.id,
      amount,
      currency,
    });

    const appUrl = getAppUrl();
    const { first, last } = splitName(session.user.name);

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
        first_name: first,
        last_name: last,
        email: session.user.email || "",
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
