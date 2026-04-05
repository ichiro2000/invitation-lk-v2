import { notFound } from "next/navigation";
import prisma from "@/lib/db";
import type { Metadata } from "next";
import type { InvitationData } from "@/types/invitation";

import RoyalElegance from "@/components/templates/RoyalElegance";
import ModernBloom from "@/components/templates/ModernBloom";
import GoldenLotus from "@/components/templates/GoldenLotus";
import MinimalGrace from "@/components/templates/MinimalGrace";
import TropicalParadise from "@/components/templates/TropicalParadise";
import EternalNight from "@/components/templates/EternalNight";
import SinhalaMangalya from "@/components/templates/SinhalaMangalya";
import VintageBotanical from "@/components/templates/VintageBotanical";
import RoseGarden from "@/components/templates/RoseGarden";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const templateComponents: Record<string, React.ComponentType<any>> = {
  "royal-elegance": RoyalElegance,
  "modern-bloom": ModernBloom,
  "golden-lotus": GoldenLotus,
  "minimal-grace": MinimalGrace,
  "tropical-paradise": TropicalParadise,
  "eternal-night": EternalNight,
  "sinhala-mangalya": SinhalaMangalya,
  "vintage-botanical": VintageBotanical,
  "rose-garden": RoseGarden,
};

async function getInvitation(code: string) {
  try {
    return await prisma.invitation.findUnique({
      where: { slug: code },
      include: { events: { orderBy: { sortOrder: "asc" } } },
    });
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await params;
  const invitation = await getInvitation(code);
  if (!invitation) return {};

  const title = `${invitation.groomName} & ${invitation.brideName} Wedding Invitation`;
  const description = `You are invited to the wedding of ${invitation.groomName} & ${invitation.brideName}. ${invitation.venue}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://invitation.lk/i/${code}`,
      type: "website",
    },
  };
}

export default async function InvitationPreviewPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const invitation = await getInvitation(code);
  if (!invitation) notFound();

  const TemplateComponent = templateComponents[invitation.templateSlug];
  if (!TemplateComponent) notFound();

  const data: InvitationData = {
    groomName: invitation.groomName,
    brideName: invitation.brideName,
    weddingDate: invitation.weddingDate.toISOString().split("T")[0],
    weddingTime: invitation.weddingDate.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }),
    venue: invitation.venue,
    venueAddress: invitation.venueAddress || "",
    events: invitation.events.map((e) => ({
      title: e.title,
      time: e.time,
      venue: e.venue || undefined,
      description: e.description || undefined,
    })),
  };

  return <TemplateComponent data={data} />;
}
