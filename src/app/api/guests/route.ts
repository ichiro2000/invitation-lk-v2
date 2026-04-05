import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const guests = await prisma.guest.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: "desc" } });
    return NextResponse.json({ guests });
  } catch (error) {
    console.error("Guests error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { name, whatsapp, inviteType, headCount, category, side } = await request.json();
    if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });

    const guest = await prisma.guest.create({
      data: {
        userId: session.user.id,
        name,
        whatsapp: whatsapp || null,
        inviteType: inviteType || "TO_YOU",
        headCount: headCount ? parseInt(headCount) : 1,
        category: category || "FRIENDS",
        side: side || "BOTH",
      },
    });

    return NextResponse.json({ guest }, { status: 201 });
  } catch (error) {
    console.error("Guest create error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const guest = await prisma.guest.findFirst({ where: { id, userId: session.user.id } });
    if (!guest) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await prisma.guest.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Guest delete error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
