import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

function generateSlug(groom: string, bride: string): string {
  const clean = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 20);
  const base = `${clean(groom)}-${clean(bride)}`;
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base}-${suffix}`;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const invitation = await prisma.invitation.findUnique({
      where: { userId: session.user.id },
      include: { events: { orderBy: { sortOrder: "asc" } } },
    });

    return NextResponse.json({ invitation });
  } catch (error) {
    console.error("Get invitation error:", error);
    return NextResponse.json({ error: "Failed to fetch invitation" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user already has an invitation
    const existing = await prisma.invitation.findUnique({
      where: { userId: session.user.id },
    });
    if (existing) {
      return NextResponse.json({ error: "Invitation already exists. Use PATCH to update." }, { status: 409 });
    }

    const { groomName, brideName, weddingDate, venue, venueAddress, templateSlug, events } = await request.json();

    if (!groomName || !brideName || !weddingDate || !venue || !templateSlug) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const slug = generateSlug(groomName, brideName);

    const invitation = await prisma.invitation.create({
      data: {
        userId: session.user.id,
        templateSlug,
        slug,
        groomName: groomName.trim(),
        brideName: brideName.trim(),
        weddingDate: new Date(weddingDate),
        venue: venue.trim(),
        venueAddress: venueAddress?.trim() || null,
        events: events?.length
          ? {
              create: events.map((e: { title: string; time: string; venue?: string; description?: string }, i: number) => ({
                title: e.title,
                time: e.time,
                venue: e.venue || null,
                description: e.description || null,
                sortOrder: i,
              })),
            }
          : undefined,
      },
      include: { events: { orderBy: { sortOrder: "asc" } } },
    });

    return NextResponse.json({ invitation }, { status: 201 });
  } catch (error) {
    console.error("Create invitation error:", error);
    return NextResponse.json({ error: "Failed to create invitation" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existing = await prisma.invitation.findUnique({
      where: { userId: session.user.id },
    });
    if (!existing) {
      return NextResponse.json({ error: "No invitation found. Create one first." }, { status: 404 });
    }

    const body = await request.json();
    const { groomName, brideName, weddingDate, venue, venueAddress, templateSlug, events } = body;

    // Build update data (only include provided fields)
    const data: Record<string, unknown> = {};
    if (groomName !== undefined) data.groomName = groomName.trim();
    if (brideName !== undefined) data.brideName = brideName.trim();
    if (weddingDate !== undefined) data.weddingDate = new Date(weddingDate);
    if (venue !== undefined) data.venue = venue.trim();
    if (venueAddress !== undefined) data.venueAddress = venueAddress?.trim() || null;
    if (templateSlug !== undefined) data.templateSlug = templateSlug;

    const invitation = await prisma.invitation.update({
      where: { userId: session.user.id },
      data,
      include: { events: { orderBy: { sortOrder: "asc" } } },
    });

    // Update events if provided
    if (events !== undefined) {
      // Delete existing events and recreate
      await prisma.event.deleteMany({ where: { invitationId: invitation.id } });
      if (events.length > 0) {
        await prisma.event.createMany({
          data: events.map((e: { title: string; time: string; venue?: string; description?: string }, i: number) => ({
            invitationId: invitation.id,
            title: e.title,
            time: e.time,
            venue: e.venue || null,
            description: e.description || null,
            sortOrder: i,
          })),
        });
      }
    }

    // Re-fetch with updated events
    const updated = await prisma.invitation.findUnique({
      where: { id: invitation.id },
      include: { events: { orderBy: { sortOrder: "asc" } } },
    });

    return NextResponse.json({ invitation: updated });
  } catch (error) {
    console.error("Update invitation error:", error);
    return NextResponse.json({ error: "Failed to update invitation" }, { status: 500 });
  }
}
