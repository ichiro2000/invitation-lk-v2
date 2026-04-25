import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { PLAN_NAMES, PLAN_PUBLISH_LIMIT } from "@/lib/plans";

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  if (typeof body?.isPublished !== "boolean") {
    return NextResponse.json({ error: "isPublished (boolean) is required" }, { status: 400 });
  }

  const invitation = await prisma.invitation.findUnique({
    where: { id },
    select: { id: true, userId: true },
  });
  if (!invitation || invitation.userId !== session.user.id) {
    return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
  }

  // Re-read the plan from the DB instead of trusting the session: a stale JWT
  // could still claim FREE after a recent upgrade (or vice versa).
  if (body.isPublished === true) {
    const owner = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { plan: true },
    });
    if (!owner || owner.plan === "FREE") {
      return NextResponse.json(
        { error: "Upgrade to a paid plan to publish your invitation", upgrade: true },
        { status: 403 }
      );
    }

    const limit = PLAN_PUBLISH_LIMIT[owner.plan] ?? 0;
    // Exclude the current invitation so re-publishing an already-live one is a
    // no-op rather than a double-count.
    const alreadyPublished = await prisma.invitation.count({
      where: { userId: session.user.id, isPublished: true, NOT: { id } },
    });
    if (alreadyPublished >= limit) {
      const planName = PLAN_NAMES[owner.plan] ?? owner.plan;
      return NextResponse.json(
        {
          error: `Your ${planName} can publish up to ${limit} invitation${limit === 1 ? "" : "s"}. Upgrade to publish more.`,
          upgrade: true,
        },
        { status: 403 }
      );
    }
  }

  const updated = await prisma.invitation.update({
    where: { id },
    data: { isPublished: body.isPublished },
    select: { id: true, isPublished: true },
  });

  return NextResponse.json(updated);
}
