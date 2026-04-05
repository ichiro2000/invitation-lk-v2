import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import type { BankTransferStatus } from "@/generated/prisma/client";

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

    const where = status
      ? { status: status as BankTransferStatus }
      : {};

    const rawTransfers = await prisma.bankTransfer.findMany({
      where,
      include: {
        order: {
          include: {
            user: {
              select: { email: true, yourName: true, partnerName: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Flatten data to match frontend interface
    const transfers = rawTransfers.map((t) => ({
      id: t.id,
      userId: t.order.userId,
      userEmail: t.order.user.email,
      userName: `${t.order.user.yourName} & ${t.order.user.partnerName}`,
      plan: t.order.plan,
      amount: Number(t.order.amount),
      bankReference: t.bankReference,
      receiptUrl: t.receiptImage,
      status: t.status,
      adminNotes: t.adminNotes,
      createdAt: t.createdAt.toISOString(),
    }));

    return NextResponse.json({ transfers });
  } catch (error) {
    console.error("Admin bank transfers error:", error);
    return NextResponse.json(
      { error: "Failed to fetch bank transfers" },
      { status: 500 }
    );
  }
}
