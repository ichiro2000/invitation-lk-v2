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

    const transfers = await prisma.bankTransfer.findMany({
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

    return NextResponse.json({ transfers });
  } catch (error) {
    console.error("Admin bank transfers error:", error);
    return NextResponse.json(
      { error: "Failed to fetch bank transfers" },
      { status: 500 }
    );
  }
}
