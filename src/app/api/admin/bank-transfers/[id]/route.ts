import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { PLAN_NAMES, PLAN_RANK } from "@/lib/plans";
import { sendPaymentConfirmationEmail, sendAdminPaymentNotification } from "@/lib/resend";
import { logAdminAction } from "@/lib/audit-log";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (adminUser?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const { action, adminNotes } = await request.json();

    if (!action || !["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Must be 'approve' or 'reject'" },
        { status: 400 }
      );
    }

    const bankTransfer = await prisma.bankTransfer.findUnique({
      where: { id },
      include: { order: true },
    });

    if (!bankTransfer) {
      return NextResponse.json(
        { error: "Bank transfer not found" },
        { status: 404 }
      );
    }

    // Idempotency: a previously approved or rejected transfer must not be
    // re-processed. Re-running approve would re-send emails and re-apply
    // plan updates; re-running reject would flip a COMPLETED order to FAILED.
    if (bankTransfer.status !== "PENDING_REVIEW") {
      return NextResponse.json(
        {
          error: `Already ${bankTransfer.status.toLowerCase()}`,
          status: bankTransfer.status,
        },
        { status: 409 }
      );
    }

    if (action === "approve") {
      // Read current plan before the transaction so we can compute the
      // downgrade-prevention check without holding the tx open on an
      // otherwise blocking findUnique.
      const currentUser = await prisma.user.findUnique({
        where: { id: bankTransfer.order.userId },
        select: { plan: true, email: true, yourName: true },
      });
      const shouldUpgradePlan = !!(
        currentUser &&
        (PLAN_RANK[bankTransfer.order.plan] ?? 0) >
          (PLAN_RANK[currentUser.plan] ?? 0)
      );

      // All state mutations run in a single transaction — if any step
      // fails, BankTransfer stays PENDING_REVIEW and the admin can retry
      // without ending up with a COMPLETED order whose user was never
      // upgraded. Side-effect-y things (email, audit log) happen AFTER
      // the tx commits so they can't hold a DB connection and so their
      // failure doesn't roll the approval back.
      const updatedTransfer = await prisma.$transaction(async (tx) => {
        const updated = await tx.bankTransfer.update({
          where: { id },
          data: {
            status: "APPROVED",
            reviewedBy: session.user.id,
            reviewedAt: new Date(),
            adminNotes: adminNotes || null,
          },
        });

        await tx.order.update({
          where: { id: bankTransfer.orderId },
          data: { paymentStatus: "COMPLETED" },
        });

        if (shouldUpgradePlan) {
          await tx.user.update({
            where: { id: bankTransfer.order.userId },
            data: { plan: bankTransfer.order.plan },
          });
        }

        await tx.invitation.updateMany({
          where: { userId: bankTransfer.order.userId },
          data: { isPaid: true },
        });

        return updated;
      });

      // Side effects outside the transaction. Log — don't swallow —
      // email failures so an off-line provider doesn't silently hide
      // delivery problems from ops.
      if (currentUser) {
        const planName = PLAN_NAMES[bankTransfer.order.plan];
        const amount = Number(bankTransfer.order.amount).toLocaleString();
        try {
          await sendPaymentConfirmationEmail(
            currentUser.email,
            currentUser.yourName || "Customer",
            planName,
            amount,
            "Bank Transfer",
            bankTransfer.order.userId
          );
        } catch (err) {
          console.error("[bank-transfer] confirmation email failed", {
            orderId: bankTransfer.orderId,
            err: err instanceof Error ? err.message : String(err),
          });
        }
        sendAdminPaymentNotification({
          userEmail: currentUser.email,
          userName: currentUser.yourName || "—",
          plan: planName,
          amount,
          method: "Bank Transfer",
        }).catch((err) => {
          console.error("[bank-transfer] admin notification failed", {
            orderId: bankTransfer.orderId,
            err: err instanceof Error ? err.message : String(err),
          });
        });
      }

      await logAdminAction({
        actorUserId: session.user.id,
        action: "bank_transfer.approve",
        targetType: "BankTransfer",
        targetId: id,
        metadata: {
          orderId: bankTransfer.orderId,
          customerUserId: bankTransfer.order.userId,
          plan: bankTransfer.order.plan,
          amount: bankTransfer.order.amount.toString(),
          adminNotes: adminNotes || null,
        },
        request,
      });

      return NextResponse.json({ transfer: updatedTransfer });
    } else {
      // Reject
      const updatedTransfer = await prisma.bankTransfer.update({
        where: { id },
        data: {
          status: "REJECTED",
          reviewedBy: session.user.id,
          reviewedAt: new Date(),
          adminNotes: adminNotes || null,
        },
      });

      await prisma.order.update({
        where: { id: bankTransfer.orderId },
        data: { paymentStatus: "FAILED" },
      });

      await logAdminAction({
        actorUserId: session.user.id,
        action: "bank_transfer.reject",
        targetType: "BankTransfer",
        targetId: id,
        metadata: {
          orderId: bankTransfer.orderId,
          customerUserId: bankTransfer.order.userId,
          plan: bankTransfer.order.plan,
          amount: bankTransfer.order.amount.toString(),
          adminNotes: adminNotes || null,
        },
        request,
      });

      return NextResponse.json({ transfer: updatedTransfer });
    }
  } catch (error) {
    console.error("Admin bank transfer action error:", error);
    return NextResponse.json(
      { error: "Failed to process bank transfer" },
      { status: 500 }
    );
  }
}
