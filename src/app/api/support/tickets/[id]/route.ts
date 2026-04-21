import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
      select: {
        id: true, userId: true, subject: true, status: true, priority: true,
        createdAt: true, updatedAt: true,
        replies: {
          where: { isInternal: false },
          orderBy: { createdAt: "asc" },
          select: {
            id: true, message: true, createdAt: true,
            author: { select: { id: true, email: true, yourName: true, role: true } },
          },
        },
      },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }
    if (ticket.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ ticket });
  } catch (error) {
    console.error("Support ticket fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch ticket" },
      { status: 500 }
    );
  }
}
