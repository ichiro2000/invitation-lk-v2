import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { validateSlug } from "@/lib/slug";

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const result = validateSlug(body?.slug ?? "");
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  const { slug } = result;

  const invitation = await prisma.invitation.findUnique({
    where: { id },
    select: { id: true, userId: true, slug: true },
  });
  if (!invitation || invitation.userId !== session.user.id) {
    return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
  }

  if (invitation.slug === slug) {
    return NextResponse.json({ slug });
  }

  const taken = await prisma.invitation.findUnique({
    where: { slug },
    select: { id: true },
  });
  if (taken) {
    return NextResponse.json({ error: "That link is already taken" }, { status: 409 });
  }

  await prisma.invitation.update({
    where: { id },
    data: { slug },
  });

  return NextResponse.json({ slug });
}
