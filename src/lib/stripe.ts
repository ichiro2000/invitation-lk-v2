import Stripe from "stripe";
import type { Plan } from "@/generated/prisma/client";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", {
  typescript: true,
});

export const PLAN_PRICES: Record<string, number> = {
  BASIC: 250000,     // Rs. 2,500 in cents
  STANDARD: 500000,  // Rs. 5,000 in cents
  PREMIUM: 1000000,  // Rs. 10,000 in cents
};

export const PLAN_AMOUNTS: Record<string, number> = {
  BASIC: 2500,
  STANDARD: 5000,
  PREMIUM: 10000,
};

export const PLAN_NAMES: Record<string, string> = {
  BASIC: "Basic Plan",
  STANDARD: "Standard Plan",
  PREMIUM: "Premium Plan",
};

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function createCheckoutSession(
  userId: string,
  userEmail: string,
  plan: Plan
) {
  const price = PLAN_PRICES[plan];
  if (!price) throw new Error(`Invalid plan: ${plan}`);

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: userEmail,
    line_items: [
      {
        price_data: {
          currency: "lkr",
          product_data: {
            name: PLAN_NAMES[plan],
            description: `INVITATION.LK ${PLAN_NAMES[plan]} — one-time payment`,
          },
          unit_amount: price,
        },
        quantity: 1,
      },
    ],
    metadata: { userId, plan },
    success_url: `${APP_URL}/dashboard/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${APP_URL}/dashboard/checkout/cancel`,
  });

  return session;
}
