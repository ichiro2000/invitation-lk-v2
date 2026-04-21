import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const message = typeof body.message === "string" ? body.message.trim() : "";

    if (!message || message.length > 10000) {
      return NextResponse.json(
        { error: "Message is required (max 10000 chars)" },
        { status: 400 }
      );
    }

    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
      select: { userId: true, status: true },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }
    if (ticket.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (ticket.status === "CLOSED") {
      return NextResponse.json(
        { error: "This ticket is closed. Please open a new ticket." },
        { status: 409 }
      );
    }

    const reply = await prisma.supportTicketReply.create({
      data: {
        ticketId: id,
        authorId: session.user.id,
        message,
        isInternal: false,
      },
      select: {
        id: true, message: true, createdAt: true,
        author: { select: { id: true, email: true, yourName: true, role: true } },
      },
    });

    // Customer reply reopens the ticket to OPEN (from PENDING or RESOLVED)
    await prisma.supportTicket.update({
      where: { id },
      data: { status: ticket.status === "RESOLVED" ? "OPEN" : "OPEN" },
    });

    return NextResponse.json({ reply }, { status: 201 });
  } catch (error) {
    console.error("Support ticket reply error:", error);
    return NextResponse.json(
      { error: "Failed to post reply" },
      { status: 500 }
    );
  }
}
