import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import {
  getPayHereConfig,
  verifyNotifyMd5Sig,
  PAYHERE_STATUS,
} from "@/lib/payhere";
import type { Plan } from "@/generated/prisma/client";

const PLAN_RANK: Record<string, number> = {
  FREE: 0,
  BASIC: 1,
  STANDARD: 2,
  PREMIUM: 3,
};

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
      merchant_id_match: merchant_id === process.env.PAYHERE_MERCHANT_ID,
    });

    if (!order_id || !md5sig || !status_code) {
      console.warn("[payhere-notify] missing params");
      return NextResponse.json({ error: "Missing params" }, { status: 400 });
    }

    const config = getPayHereConfig();

    if (merchant_id !== config.merchantId) {
      console.warn("PayHere notify merchant_id mismatch", { order_id });
      return NextResponse.json({ error: "Invalid merchant" }, { status: 403 });
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
      console.warn("PayHere notify md5sig mismatch", { order_id });
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    }

    const order = await prisma.order.findUnique({ where: { id: order_id } });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    let nextStatus: "PENDING" | "COMPLETED" | "FAILED" = "PENDING";
    if (status_code === PAYHERE_STATUS.SUCCESS) nextStatus = "COMPLETED";
    else if (
      status_code === PAYHERE_STATUS.FAILED ||
      status_code === PAYHERE_STATUS.CANCELED
    )
      nextStatus = "FAILED";

    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order_id },
        data: {
          paymentStatus: nextStatus,
          ...(payment_id ? { paymentRef: payment_id } : {}),
        },
      });

      if (nextStatus === "COMPLETED") {
        const user = await tx.user.findUnique({
          where: { id: order.userId },
          select: { plan: true },
        });
        if (
          user &&
          (PLAN_RANK[order.plan as Plan] ?? 0) > (PLAN_RANK[user.plan] ?? 0)
        ) {
          await tx.user.update({
            where: { id: order.userId },
            data: { plan: order.plan },
          });
        }
      }
    });

    console.log("[payhere-notify] processed", { order_id, nextStatus });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("PayHere notify error:", error);
    return NextResponse.json(
      { error: "Failed to process notification" },
      { status: 500 }
    );
  }
}
