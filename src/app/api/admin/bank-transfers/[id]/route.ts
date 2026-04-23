import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { PLAN_NAMES, PLAN_AMOUNTS, PLAN_RANK } from "@/lib/plans";
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
      // Update BankTransfer
      const updatedTransfer = await prisma.bankTransfer.update({
        where: { id },
        data: {
          status: "APPROVED",
          reviewedBy: session.user.id,
          reviewedAt: new Date(),
          adminNotes: adminNotes || null,
        },
      });

      // Update Order
      await prisma.order.update({
        where: { id: bankTransfer.orderId },
        data: { paymentStatus: "COMPLETED" },
      });

      // Update User plan — only if the new plan outranks what the user
      // already has. Prevents accidental downgrades when a user submits a
      // lower-tier bank transfer after upgrading via another flow.
      const currentUser = await prisma.user.findUnique({
        where: { id: bankTransfer.order.userId },
        select: { plan: true },
      });
      if (
        currentUser &&
        (PLAN_RANK[bankTransfer.order.plan] ?? 0) >
          (PLAN_RANK[currentUser.plan] ?? 0)
      ) {
        await prisma.user.update({
          where: { id: bankTransfer.order.userId },
          data: { plan: bankTransfer.order.plan },
        });
      }

      // Update Invitation if exists
      await prisma.invitation.updateMany({
        where: { userId: bankTransfer.order.userId },
        data: { isPaid: true },
      });

      // Send confirmation email
      const user = await prisma.user.findUnique({
        where: { id: bankTransfer.order.userId },
        select: { email: true, yourName: true },
      });

      if (user) {
        const planName = PLAN_NAMES[bankTransfer.order.plan];
        const amount = PLAN_AMOUNTS[bankTransfer.order.plan].toLocaleString();
        await sendPaymentConfirmationEmail(
          user.email,
          user.yourName || "Customer",
          planName,
          amount,
          "Bank Transfer",
          bankTransfer.order.userId
        );
        sendAdminPaymentNotification({
          userEmail: user.email,
          userName: user.yourName || "—",
          plan: planName,
          amount,
          method: "Bank Transfer",
        }).catch(() => {});
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
