import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import type { PaymentStatus } from "@/generated/prisma/client";
import { toCsv, csvResponseHeaders } from "@/lib/csv";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const format = searchParams.get("format");

    const validStatuses = ["PENDING", "COMPLETED", "FAILED", "REFUNDED"];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const where = status
      ? { paymentStatus: status as PaymentStatus }
      : {};

    const rawOrders = await prisma.order.findMany({
      where,
      include: {
        user: {
          select: { email: true, yourName: true, partnerName: true },
        },
        // Deliberately omit receiptImage here — it's a multi-megabyte data
        // URL per row and we don't need it until an admin clicks "View" on
        // a specific receipt. See GET /api/admin/bank-transfers/[id]/receipt.
        bankTransfer: {
          select: {
            id: true,
            status: true,
            adminNotes: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: format === "csv" ? 10000 : undefined,
    });

    if (format === "csv") {
      const header = [
        "Order ID", "Customer name", "Partner", "Email", "Plan",
        "Amount", "Currency", "Payment method", "Status",
        "Bank transfer status", "Created at",
      ];
      const rows = rawOrders.map((o) => [
        o.id,
        o.user.yourName ?? "",
        o.user.partnerName ?? "",
        o.user.email,
        o.plan,
        Number(o.amount).toFixed(2),
        o.currency,
        o.paymentMethod,
        o.paymentStatus,
        o.bankTransfer?.status ?? "",
        o.createdAt.toISOString(),
      ]);
      return new NextResponse(toCsv(header, rows), {
        status: 200,
        headers: csvResponseHeaders("orders"),
      });
    }

    const orders = rawOrders.map((o) => ({
      id: o.id,
      userName: `${o.user.yourName} & ${o.user.partnerName}`,
      userEmail: o.user.email,
      plan: o.plan,
      amount: Number(o.amount),
      paymentMethod: o.paymentMethod,
      status: o.paymentStatus,
      createdAt: o.createdAt.toISOString(),
      bankTransfer: o.bankTransfer
        ? {
            id: o.bankTransfer.id,
            status: o.bankTransfer.status,
            adminNotes: o.bankTransfer.adminNotes,
          }
        : null,
    }));

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Admin orders error:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
