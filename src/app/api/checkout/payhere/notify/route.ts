import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import {
  getPayHereConfig,
  verifyNotifyMd5Sig,
  PAYHERE_STATUS,
} from "@/lib/payhere";
import { PLAN_RANK } from "@/lib/plans";

// PayHere retries any non-2xx response, which is useless for permanent
// failures (bad signature, unknown order, already-processed). Always ack 200
// to stop the retry loop; use `handled: false` + a reason in the body so we
// can still see the failure in logs / offline audits.
function ack(reason: string, extra?: Record<string, unknown>) {
  return NextResponse.json(
    { handled: false, reason, ...extra },
    { status: 200 }
  );
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const params: Record<string, string> = {};
    for (const [key, value] of formData.entries()) {
      params[key] = String(value);
    }

    const {
      merchant_id,
      order_id,
      payment_id,
      payhere_amount,
      payhere_currency,
      status_code,
      md5sig,
    } = params;

    console.log("[payhere-notify] received", {
      order_id,
      payment_id,
      status_code,
      payhere_amount,
      payhere_currency,
    });

    if (!order_id || !md5sig || !status_code) {
      console.warn("[payhere-notify] missing params");
      return ack("missing_params");
    }

    const config = getPayHereConfig();

    if (merchant_id !== config.merchantId) {
      console.warn("[payhere-notify] merchant_id mismatch", { order_id });
      return ack("merchant_mismatch");
    }

    const valid = verifyNotifyMd5Sig({
      merchantId: config.merchantId,
      merchantSecret: config.merchantSecret,
      orderId: order_id,
      payhereAmount: payhere_amount,
      payhereCurrency: payhere_currency,
      statusCode: status_code,
      receivedMd5Sig: md5sig,
    });

    if (!valid) {
      console.warn("[payhere-notify] md5sig mismatch", { order_id });
      return ack("invalid_signature");
    }

    const order = await prisma.order.findUnique({ where: { id: order_id } });
    if (!order) {
      console.warn("[payhere-notify] order not found", { order_id });
      return ack("order_not_found");
    }

    if (order.paymentMethod !== "PAYHERE") {
      console.warn("[payhere-notify] order payment method mismatch", {
        order_id,
        paymentMethod: order.paymentMethod,
      });
      return ack("wrong_payment_method");
    }

    // Validate the amount + currency PayHere claims against what we charged.
    // Signature only proves authenticity, not that the payment matches the
    // order — without this an attacker (or a merchant misconfiguration)
    // could settle the order for a different amount.
    const expectedAmount = Number(order.amount).toFixed(2);
    if (payhere_amount !== expectedAmount) {
      console.warn("[payhere-notify] amount mismatch", {
        order_id,
        expected: expectedAmount,
        got: payhere_amount,
      });
      return ack("amount_mismatch");
    }
    if (payhere_currency !== order.currency) {
      console.warn("[payhere-notify] currency mismatch", {
        order_id,
        expected: order.currency,
        got: payhere_currency,
      });
      return ack("currency_mismatch");
    }

    let nextStatus: "PENDING" | "COMPLETED" | "FAILED" = "PENDING";
    if (status_code === PAYHERE_STATUS.SUCCESS) nextStatus = "COMPLETED";
    else if (
      status_code === PAYHERE_STATUS.FAILED ||
      status_code === PAYHERE_STATUS.CANCELED
    )
      nextStatus = "FAILED";

    // Idempotency + side-effect gating both inside the transaction. The
    // previous check-then-update pattern outside a tx could let two
    // concurrent notify deliveries race past the status guard and apply
    // side effects twice. Re-read inside the tx and only mutate if the
    // stored status actually differs from the target.
    const result = await prisma.$transaction(async (tx) => {
      const current = await tx.order.findUnique({
        where: { id: order_id },
        select: { paymentStatus: true, plan: true, userId: true },
      });
      if (!current) return { handled: false, reason: "order_vanished" as const };
      if (current.paymentStatus === nextStatus) {
        return { handled: true, deduped: true as const };
      }

      await tx.order.update({
        where: { id: order_id },
        data: {
          paymentStatus: nextStatus,
          ...(payment_id ? { paymentRef: payment_id } : {}),
        },
      });

      if (nextStatus === "COMPLETED") {
        const user = await tx.user.findUnique({
          where: { id: current.userId },
          select: { plan: true },
        });
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
      console.log("[payhere-notify] already processed", { order_id });
      return NextResponse.json({ handled: true, deduped: true });
    }
    if ("reason" in result && result.reason === "order_vanished") {
      return ack("order_vanished");
    }
    console.log("[payhere-notify] processed", { order_id, nextStatus });
    return NextResponse.json({ handled: true, status: nextStatus });
  } catch (error) {
    console.error("PayHere notify error:", error);
    // 500 here because it IS our fault — PayHere's retry is actually useful.
    return NextResponse.json(
      { error: "Failed to process notification" },
      { status: 500 }
    );
  }
}
