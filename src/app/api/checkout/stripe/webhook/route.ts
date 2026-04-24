import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { PLAN_RANK } from "@/lib/plans";
import { getStripe } from "@/lib/stripe";
import type Stripe from "stripe";

// Stripe's webhook retries non-2xx responses, so we ack 200 for permanent
// failures (bad signature, unknown order, already-processed) to stop the
// retry loop — matches the PayHere notify pattern.
function ack(reason: string, extra?: Record<string, unknown>) {
  return NextResponse.json(
    { handled: false, reason, ...extra },
    { status: 200 }
  );
}

// Webhook signature verification requires the RAW request body, not a JSON
// parse of it. Reading `await request.text()` before any .json() call keeps
// the bytes intact.
export async function POST(request: Request) {
  try {
    // Trim to survive a trailing newline or space pasted into the DO env var
    // UI — otherwise Stripe's constructEvent rejects the signature with an
    // opaque "whitespace in secret" warning that's hard to spot.
    const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
    if (!secret) {
      console.error("[stripe-webhook] STRIPE_WEBHOOK_SECRET not set");
      return ack("webhook_secret_missing");
    }

    const stripe = getStripe();
    if (!stripe) {
      console.error("[stripe-webhook] STRIPE_SECRET_KEY not set");
      return ack("stripe_not_configured");
    }

    const signature = request.headers.get("stripe-signature");
    if (!signature) {
      return ack("missing_signature");
    }

    const rawBody = await request.text();

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, secret);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn("[stripe-webhook] signature verification failed:", msg);
      return ack("invalid_signature");
    }

    // Only handle the event types we know how to act on. Everything else is
    // acked with `ignored: true` — Stripe will stop retrying.
    if (event.type !== "checkout.session.completed" && event.type !== "checkout.session.async_payment_succeeded" && event.type !== "checkout.session.async_payment_failed") {
      return NextResponse.json({ handled: true, ignored: true, type: event.type });
    }

    const sessionObj = event.data.object as Stripe.Checkout.Session;
    const orderId =
      sessionObj.client_reference_id ??
      (sessionObj.metadata?.orderId as string | undefined) ??
      null;
    if (!orderId) {
      console.warn("[stripe-webhook] missing orderId in session", { sessionId: sessionObj.id });
      return ack("order_id_missing");
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      // If the payment already succeeded on Stripe's side but we can't find
      // the row, fall through to a 500 so Stripe retries — it's usually a
      // commit-vs-webhook timing race and the order will appear shortly.
      // Unpaid / failed sessions with no local row are genuinely orphans
      // and we ack 200 to stop retries.
      const paid =
        sessionObj.payment_status === "paid" ||
        sessionObj.payment_status === "no_payment_required";
      if (paid) {
        console.error("[stripe-webhook] order not found for paid session — letting Stripe retry", {
          orderId,
          sessionId: sessionObj.id,
        });
        return NextResponse.json(
          { error: "Order not found for paid session" },
          { status: 500 }
        );
      }
      console.warn("[stripe-webhook] order not found", { orderId });
      return ack("order_not_found");
    }

    if (order.paymentMethod !== "STRIPE") {
      console.warn("[stripe-webhook] order payment method mismatch", {
        orderId,
        paymentMethod: order.paymentMethod,
      });
      return ack("wrong_payment_method");
    }

    // Defense in depth: validate the amount + currency Stripe reports match
    // what we charged. A compromised webhook secret or session-id swap would
    // otherwise let someone settle a PREMIUM order at the BASIC price.
    // Reject on null/undefined too — a malformed event without amount_total
    // should NOT be allowed to flow through to COMPLETED.
    const expectedMinor = Math.round(Number(order.amount) * 100);
    if (
      typeof sessionObj.amount_total !== "number" ||
      sessionObj.amount_total !== expectedMinor
    ) {
      console.warn("[stripe-webhook] amount mismatch or missing", {
        orderId,
        expected: expectedMinor,
        got: sessionObj.amount_total,
      });
      return ack("amount_mismatch");
    }
    if (sessionObj.currency && sessionObj.currency.toUpperCase() !== order.currency) {
      console.warn("[stripe-webhook] currency mismatch", {
        orderId,
        expected: order.currency,
        got: sessionObj.currency,
      });
      return ack("currency_mismatch");
    }

    // Explicit event-type -> status mapping. Previously the success branch
    // only fired on `sessionObj.payment_status === "paid"`, which meant
    // `async_payment_succeeded` was relying on Stripe's implicit promise
    // that payment_status would have flipped by delivery time. Be explicit
    // so a future Stripe behavior change can't leave us in PENDING.
    let nextStatus: "PENDING" | "COMPLETED" | "FAILED" = "PENDING";
    if (event.type === "checkout.session.async_payment_failed") {
      nextStatus = "FAILED";
    } else if (event.type === "checkout.session.async_payment_succeeded") {
      nextStatus = "COMPLETED";
    } else if (
      sessionObj.payment_status === "paid" ||
      sessionObj.payment_status === "no_payment_required"
    ) {
      nextStatus = "COMPLETED";
    }

    // Idempotency + side-effect gating both inside the transaction. The
    // check-then-act pattern outside a tx allowed two concurrent deliveries
    // of the same event to race past the guard and both upgrade the plan.
    const result = await prisma.$transaction(async (tx) => {
      const current = await tx.order.findUnique({
        where: { id: orderId },
        select: { paymentStatus: true, plan: true, userId: true },
      });
      if (!current) return { handled: false, reason: "order_vanished" as const };
      if (current.paymentStatus === nextStatus) {
        return { handled: true, deduped: true as const };
      }

      await tx.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: nextStatus,
          paymentRef: sessionObj.payment_intent
            ? String(sessionObj.payment_intent)
            : sessionObj.id,
        },
      });

      if (nextStatus === "COMPLETED") {
        const user = await tx.user.findUnique({
          where: { id: current.userId },
          select: { plan: true },
        });
        // Only upgrade — never downgrade — if a stale order settles for a
        // user who has since bought a higher tier.
        if (
          user &&
          (PLAN_RANK[current.plan] ?? 0) > (PLAN_RANK[user.plan] ?? 0)
        ) {
          await tx.user.update({
            where: { id: current.userId },
            data: { plan: current.plan },
          });
        }
      }
      return { handled: true, status: nextStatus };
    });

    if ("deduped" in result) {
      return NextResponse.json({ handled: true, deduped: true });
    }
    if ("reason" in result && result.reason === "order_vanished") {
      return ack("order_vanished");
    }
    return NextResponse.json({ handled: true, status: nextStatus });
  } catch (error) {
    console.error("Stripe webhook error:", error);
    // 500 here because it IS our fault — Stripe's retry is useful.
    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 }
    );
  }
}
