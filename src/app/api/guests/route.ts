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

    // Validate name
    if (!name || typeof name !== "string" || name.trim().length === 0 || name.trim().length > 200) {
      return NextResponse.json({ error: "Name is required and must be under 200 characters" }, { status: 400 });
    }

    // Validate headCount
    const parsedHeadCount = headCount ? Number(headCount) : 1;
    if (!Number.isInteger(parsedHeadCount) || parsedHeadCount < 1 || parsedHeadCount > 100) {
      return NextResponse.json({ error: "Head count must be between 1 and 100" }, { status: 400 });
    }

    // Validate inviteType
    const validInviteTypes = ["TO_YOU", "TO_YOU_BOTH", "TO_YOUR_FAMILY"];
    const safeInviteType = inviteType || "TO_YOU";
    if (!validInviteTypes.includes(safeInviteType)) {
      return NextResponse.json({ error: "Invalid invite type" }, { status: 400 });
    }

    // Validate category
    const validCategories = ["FRIENDS", "FAMILY", "WORK", "OTHER"];
    const safeCategory = category || "FRIENDS";
    if (!validCategories.includes(safeCategory)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    // Validate side
    const validSides = ["BRIDE", "GROOM", "BOTH"];
    const safeSide = side || "BOTH";
    if (!validSides.includes(safeSide)) {
      return NextResponse.json({ error: "Invalid side" }, { status: 400 });
    }

    const guest = await prisma.guest.create({
      data: {
        userId: session.user.id,
        name: name.trim(),
        whatsapp: whatsapp ? String(whatsapp).trim() : null,
        inviteType: safeInviteType,
        headCount: parsedHeadCount,
        category: safeCategory,
        side: safeSide,
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
