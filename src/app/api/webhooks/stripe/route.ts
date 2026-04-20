import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getStripe, PLAN_NAMES, PLAN_AMOUNTS, PLAN_PRICES } from "@/lib/stripe";
import { sendPaymentConfirmationEmail, sendAdminPaymentNotification } from "@/lib/resend";
import type { Plan } from "@/generated/prisma/client";

export async function POST(request: Request) {
  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
    }

    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    const event = getStripe().webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );

    if (event.type === "checkout.session.completed") {
      const checkoutSession = event.data.object;
      const userId = checkoutSession.metadata?.userId;
      const plan = checkoutSession.metadata?.plan as Plan;

      if (!userId || !plan) {
        console.error("Missing metadata in Stripe session:", checkoutSession.id);
        return NextResponse.json({ error: "Missing metadata" }, { status: 400 });
      }

      // Verify payment amount matches expected plan price
      const expectedPrice = PLAN_PRICES[plan];
      if (expectedPrice && checkoutSession.amount_total !== expectedPrice) {
        console.error("Amount mismatch for session:", checkoutSession.id, "expected:", expectedPrice, "got:", checkoutSession.amount_total);
        return NextResponse.json({ error: "Amount mismatch" }, { status: 400 });
      }

      // Update Order
      await prisma.order.updateMany({
        where: { stripeSessionId: checkoutSession.id },
        data: {
          paymentStatus: "COMPLETED",
          stripePaymentIntentId: checkoutSession.payment_intent as string,
        },
      });

      // Update User plan
      await prisma.user.update({
        where: { id: userId },
        data: { plan },
      });

      // Update Invitation if exists
      await prisma.invitation.updateMany({
        where: { userId },
        data: { isPaid: true },
      });

      // Send confirmation email
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, yourName: true },
      });

      if (user) {
        const planName = PLAN_NAMES[plan];
        const amount = PLAN_AMOUNTS[plan].toLocaleString();
        await sendPaymentConfirmationEmail(
          user.email,
          user.yourName || "Customer",
          planName,
          amount,
          "Stripe"
        );
        sendAdminPaymentNotification({
          userEmail: user.email,
          userName: user.yourName || "—",
          plan: planName,
          amount,
          method: "Stripe",
        }).catch(() => {});
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("Stripe webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
