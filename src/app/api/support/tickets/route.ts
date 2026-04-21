import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { TicketPriority } from "@/generated/prisma/client";

const VALID_PRIORITIES = Object.values(TicketPriority);

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tickets = await prisma.supportTicket.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true, subject: true, status: true, priority: true,
        createdAt: true, updatedAt: true,
        _count: { select: { replies: true } },
      },
    });

    return NextResponse.json({ tickets });
  } catch (error) {
    console.error("Support tickets list error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tickets" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const subject = typeof body.subject === "string" ? body.subject.trim() : "";
    const message = typeof body.message === "string" ? body.message.trim() : "";
    const priority: TicketPriority =
      VALID_PRIORITIES.includes(body.priority) ? body.priority : "NORMAL";

    if (!subject || subject.length > 200) {
      return NextResponse.json(
        { error: "Subject is required (max 200 chars)" },
        { status: 400 }
      );
    }
    if (!message || message.length > 10000) {
      return NextResponse.json(
        { error: "Message is required (max 10000 chars)" },
        { status: 400 }
      );
    }

    const ticket = await prisma.supportTicket.create({
      data: {
        userId: session.user.id,
        subject,
        priority,
        status: "OPEN",
        replies: {
          create: {
            authorId: session.user.id,
            message,
            isInternal: false,
          },
        },
      },
      select: { id: true, subject: true, status: true, priority: true, createdAt: true, updatedAt: true },
    });

    return NextResponse.json({ ticket }, { status: 201 });
  } catch (error) {
    console.error("Support ticket create error:", error);
    return NextResponse.json(
      { error: "Failed to create ticket" },
      { status: 500 }
    );
  }
}
