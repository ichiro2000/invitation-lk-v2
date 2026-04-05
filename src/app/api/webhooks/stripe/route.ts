import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { stripe, PLAN_NAMES, PLAN_AMOUNTS } from "@/lib/stripe";
import { sendPaymentConfirmationEmail } from "@/lib/resend";
import type { Plan } from "@/generated/prisma/client";

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ""
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const userId = session.metadata?.userId;
      const plan = session.metadata?.plan as Plan;

      if (!userId || !plan) {
        console.error("Missing metadata in Stripe session:", session.id);
        return NextResponse.json({ error: "Missing metadata" }, { status: 400 });
      }

      // Update Order
      await prisma.order.updateMany({
        where: { stripeSessionId: session.id },
        data: {
          paymentStatus: "COMPLETED",
          stripePaymentIntentId: session.payment_intent as string,
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
        await sendPaymentConfirmationEmail(
          user.email,
          user.yourName || "Customer",
          PLAN_NAMES[plan],
          `Rs. ${PLAN_AMOUNTS[plan].toLocaleString()}`,
          "Stripe"
        );
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
