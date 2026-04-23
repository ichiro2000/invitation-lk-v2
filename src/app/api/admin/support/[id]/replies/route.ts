import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { sendSupportReplyToCustomer } from "@/lib/resend";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const me = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });
    if (me?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const message = typeof body.message === "string" ? body.message.trim() : "";
    const isInternal = body.isInternal === true;

    if (!message || message.length > 10000) {
      return NextResponse.json(
        { error: "Message is required (max 10000 chars)" },
        { status: 400 }
      );
    }

    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
      select: {
        id: true, status: true, subject: true, userId: true,
        user: { select: { email: true, yourName: true } },
      },
    });
    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    const reply = await prisma.supportTicketReply.create({
      data: {
        ticketId: id,
        authorId: session.user.id,
        message,
        isInternal,
      },
      select: {
        id: true, message: true, isInternal: true, createdAt: true,
        author: { select: { id: true, email: true, yourName: true, role: true } },
      },
    });

    // Admin reply on a non-internal message flips status to PENDING
    // (awaiting customer). Skip for internal notes and CLOSED tickets.
    if (!isInternal && ticket.status !== "CLOSED") {
      await prisma.supportTicket.update({
        where: { id },
        data: { status: "PENDING" },
      });

      // Notify the customer. Fire-and-forget so email failures never break
      // the reply flow. Internal notes don't email.
      if (ticket.user?.email) {
        sendSupportReplyToCustomer({
          ticketId: id,
          customerEmail: ticket.user.email,
          customerName: ticket.user.yourName || ticket.user.email,
          subject: ticket.subject,
          message,
          userId: ticket.userId,
        }).catch(() => {});
      }
    }

    return NextResponse.json({ reply }, { status: 201 });
  } catch (error) {
    console.error("Admin support ticket reply error:", error);
    return NextResponse.json(
      { error: "Failed to post reply" },
      { status: 500 }
    );
  }
}
