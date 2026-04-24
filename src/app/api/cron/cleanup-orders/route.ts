import { NextResponse } from "next/server";
import prisma from "@/lib/db";

// Stale-order cleanup cron. Hit this on a schedule (DO App Platform Jobs, a
// GitHub Action on a timer, or any external scheduler) with:
//
//   POST /api/cron/cleanup-orders
//   Authorization: Bearer $CLEANUP_CRON_SECRET
//
// Deletes STRIPE and PAYHERE orders that have been PENDING for longer than
// 7 days. Those are abandoned checkouts — the user closed the tab, the
// gateway never fired a terminal webhook, and the row has been squatting on
// the table ever since. Bank-transfer PENDING orders are explicitly NOT
// deleted here because they're awaiting a human admin review and could be
// approved days later.
//
// Designed to be safely retried. The delete is scoped by paymentMethod and
// age so a successful deletion isn't surprising on a rerun.

const STALE_AFTER_MS = 7 * 24 * 60 * 60 * 1000;

export async function POST(request: Request) {
  const expected = process.env.CLEANUP_CRON_SECRET?.trim();
  if (!expected) {
    console.error("[cron/cleanup-orders] CLEANUP_CRON_SECRET not set");
    return NextResponse.json({ error: "Cron disabled" }, { status: 503 });
  }

  const header = request.headers.get("authorization") || "";
  const presented = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!presented || presented !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cutoff = new Date(Date.now() - STALE_AFTER_MS);
  try {
    const result = await prisma.order.deleteMany({
      where: {
        paymentStatus: "PENDING",
        paymentMethod: { in: ["STRIPE", "PAYHERE"] },
        createdAt: { lt: cutoff },
      },
    });
    console.log("[cron/cleanup-orders] deleted", {
      count: result.count,
      olderThan: cutoff.toISOString(),
    });
    return NextResponse.json({
      deleted: result.count,
      olderThan: cutoff.toISOString(),
    });
  } catch (error) {
    console.error("[cron/cleanup-orders] failed", error);
    return NextResponse.json(
      { error: "Cleanup failed" },
      { status: 500 }
    );
  }
}
