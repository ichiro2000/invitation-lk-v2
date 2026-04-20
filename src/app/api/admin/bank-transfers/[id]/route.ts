import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { PLAN_NAMES, PLAN_AMOUNTS } from "@/lib/stripe";
import { sendPaymentConfirmationEmail, sendAdminPaymentNotification } from "@/lib/resend";

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

      // Update User plan
      await prisma.user.update({
        where: { id: bankTransfer.order.userId },
        data: { plan: bankTransfer.order.plan },
      });

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
          "Bank Transfer"
        );
        sendAdminPaymentNotification({
          userEmail: user.email,
          userName: user.yourName || "—",
          plan: planName,
          amount,
          method: "Bank Transfer",
        }).catch(() => {});
      }

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
