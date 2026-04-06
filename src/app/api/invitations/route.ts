import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

function generateCode(): string {
  return Math.random().toString(36).slice(2, 8);
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

// POST — create new invitation
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // If invitation already exists, redirect to PATCH logic
    const existing = await prisma.invitation.findUnique({
      where: { userId: session.user.id },
    });
    if (existing) {
      // Treat as update instead of erroring
      return handleUpdate(session.user.id, await request.json());
    }

    const body = await request.json();
    const { groomName, brideName, weddingDate, venue, venueAddress, templateSlug, events } = body;

    // Get user data for defaults
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { yourName: true, partnerName: true, weddingDate: true, venue: true },
    });

    const finalGroom = (groomName || user?.yourName || "Groom").trim() || "Groom";
    const finalBride = (brideName || user?.partnerName || "Bride").trim() || "Bride";
    const finalDate = weddingDate && weddingDate !== "" ? new Date(weddingDate) : (user?.weddingDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000));
    const finalVenue = (venue || user?.venue || "Wedding Venue").trim() || "Wedding Venue";
    const finalTemplate = templateSlug || "royal-elegance";

    // Use raw SQL to avoid Prisma/DB schema mismatch
    const invId = `inv_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const slug = generateCode();
    const configJson = body.config && Object.keys(body.config).length > 0 ? JSON.stringify(body.config) : null;

    await prisma.$executeRawUnsafe(
      `INSERT INTO "Invitation" (id, "userId", "templateSlug", slug, "groomName", "brideName", "weddingDate", venue, "venueAddress", config, "isPublished", "isPaid", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb, false, false, NOW(), NOW())`,
      invId, session.user.id, finalTemplate, slug,
      finalGroom, finalBride, finalDate, finalVenue,
      venueAddress?.trim() || null, configJson
    );

    // Create events
    try {
      const evts = events?.length ? events : [
        { title: "Wedding Ceremony", time: "4:00 PM" },
        { title: "Reception", time: "7:00 PM" },
      ];
      for (let i = 0; i < evts.length; i++) {
        const e = evts[i];
        await prisma.$executeRawUnsafe(
          `INSERT INTO "Event" (id, "invitationId", title, time, venue, description, "sortOrder")
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          `evt_${Date.now()}_${i}`, invId, e.title || "Event", e.time || "TBD", e.venue || null, e.description || null, i
        );
      }
    } catch { /* events optional */ }

    const full = await prisma.invitation.findUnique({
      where: { id: invId },
      include: { events: { orderBy: { sortOrder: "asc" } } },
    });

    return NextResponse.json({ invitation: full }, { status: 201 });
  } catch (error) {
    console.error("Create invitation error:", error);
    return NextResponse.json({ error: "Failed to create invitation" }, { status: 500 });
  }
}

// PATCH — update existing invitation
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existing = await prisma.invitation.findUnique({
      where: { userId: session.user.id },
    });

    // If no invitation exists, auto-create one
    if (!existing) {
      const body = await request.json();
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { yourName: true, partnerName: true, weddingDate: true, venue: true },
      });

      const groom = (body.groomName || user?.yourName || "Groom").trim() || "Groom";
      const bride = (body.brideName || user?.partnerName || "Bride").trim() || "Bride";
      const date = body.weddingDate && body.weddingDate !== "" ? new Date(body.weddingDate) : (user?.weddingDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000));
      const ven = (body.venue || user?.venue || "Wedding Venue").trim() || "Wedding Venue";

      // Use raw SQL to avoid Prisma schema mismatch with DB
      const invId = `inv_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      const slug = generateCode();
      const configJson = body.config && Object.keys(body.config).length > 0 ? JSON.stringify(body.config) : null;

      await prisma.$executeRawUnsafe(
        `INSERT INTO "Invitation" (id, "userId", "templateSlug", slug, "groomName", "brideName", "weddingDate", venue, "venueAddress", config, "isPublished", "isPaid", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb, false, false, NOW(), NOW())`,
        invId, session.user.id, body.templateSlug || "royal-elegance", slug,
        groom, bride, date, ven,
        body.venueAddress?.trim() || null, configJson
      );

      // Create default events
      try {
        const evts = body.events?.length ? body.events : [
          { title: "Wedding Ceremony", time: "4:00 PM" },
          { title: "Reception", time: "7:00 PM" },
        ];
        for (let i = 0; i < evts.length; i++) {
          const e = evts[i];
          await prisma.$executeRawUnsafe(
            `INSERT INTO "Event" (id, "invitationId", title, time, venue, description, "sortOrder")
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            `evt_${Date.now()}_${i}`, invId, e.title || "Event", e.time || "TBD", e.venue || null, e.description || null, i
          );
        }
      } catch { /* events optional */ }

      const full = await prisma.invitation.findUnique({
        where: { id: invId },
        include: { events: { orderBy: { sortOrder: "asc" } } },
      });

      return NextResponse.json({ invitation: full }, { status: 201 });
    }

    return handleUpdate(session.user.id, await request.json());
  } catch (error) {
    console.error("Update invitation error:", error);
    return NextResponse.json({ error: "Failed to update invitation" }, { status: 500 });
  }
}

async function handleUpdate(userId: string, body: Record<string, unknown>) {
  const { groomName, brideName, weddingDate, venue, venueAddress, templateSlug, events, config } = body as {
    groomName?: string; brideName?: string; weddingDate?: string; venue?: string;
    venueAddress?: string; templateSlug?: string;
    events?: { title: string; time: string; venue?: string; description?: string }[];
    config?: Record<string, unknown>;
  };

  const data: Record<string, unknown> = {};
  if (groomName !== undefined) data.groomName = groomName.trim();
  if (brideName !== undefined) data.brideName = brideName.trim();
  if (weddingDate !== undefined) data.weddingDate = new Date(weddingDate);
  if (venue !== undefined) data.venue = venue.trim();
  if (venueAddress !== undefined) data.venueAddress = venueAddress?.trim() || null;
  if (templateSlug !== undefined) data.templateSlug = templateSlug;
  if (config !== undefined) data.config = config;

  const invitation = await prisma.invitation.update({
    where: { userId },
    data,
    include: { events: { orderBy: { sortOrder: "asc" } } },
  });

  // Update events if provided
  if (events !== undefined) {
    await prisma.event.deleteMany({ where: { invitationId: invitation.id } });
    if (events.length > 0) {
      await prisma.event.createMany({
        data: events.map((e, i) => ({
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

  const updated = await prisma.invitation.findUnique({
    where: { id: invitation.id },
    include: { events: { orderBy: { sortOrder: "asc" } } },
  });

  return NextResponse.json({ invitation: updated });
}
