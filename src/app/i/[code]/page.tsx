import { notFound } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
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
import WingsOfHonour from "@/components/templates/WingsOfHonour";
import BlossomWaltz from "@/components/templates/BlossomWaltz";

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
  "wings-of-honour": WingsOfHonour,
  "blossom-waltz": BlossomWaltz,
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

  // Drafts shouldn't leak names via OG cards or get indexed — strip PII and
  // tell crawlers to skip. Owner sees the same generic title; the page itself
  // is what matters to them.
  if (!invitation.isPublished) {
    return {
      title: "Private Invitation",
      robots: { index: false, follow: false },
    };
  }

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

  // Drafts are private until the owner publishes. The owner can still preview
  // their own draft (so the dashboard "Open Invitation" button keeps working);
  // anyone else gets a friendly login wall.
  if (!invitation.isPublished) {
    const session = await getServerSession(authOptions);
    if (session?.user?.id !== invitation.userId) {
      return <DraftLockedScreen code={code} />;
    }
  }

  const TemplateComponent = templateComponents[invitation.templateSlug];
  if (!TemplateComponent) notFound();

  // Extract date + time in the couple's timezone (Sri Lanka) so the published
  // invitation always matches what the editor showed, regardless of which
  // timezone the server happens to be running in.
  const TZ = "Asia/Colombo";
  const data: InvitationData = {
    groomName: invitation.groomName,
    brideName: invitation.brideName,
    // sv-SE locale outputs YYYY-MM-DD, which is what templates expect
    weddingDate: invitation.weddingDate.toLocaleDateString("sv-SE", { timeZone: TZ }),
    weddingTime: invitation.weddingDate.toLocaleTimeString("en-US", {
      timeZone: TZ,
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const config = (invitation as any).config as Record<string, unknown> | null;

  return <TemplateComponent data={data} config={config || undefined} />;
}

function DraftLockedScreen({ code }: { code: string }) {
  const callbackUrl = `/i/${code}`;
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-rose-50 via-white to-rose-50 px-6 py-16">
      <div className="max-w-md w-full bg-white rounded-2xl border border-rose-100 shadow-sm p-8 sm:p-10 text-center">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-5">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">This invitation isn&apos;t public yet</h1>
        <p className="text-sm text-gray-500 mb-6">
          The host hasn&apos;t published it. If you&apos;re the host, log in to preview your draft.
        </p>
        <Link
          href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}
          className="inline-flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium shadow-lg shadow-rose-600/20 transition-colors"
        >
          Log in to view
        </Link>
        <p className="mt-6 text-xs text-gray-400">
          Not the host? Ask them to publish the invitation and share the link again.
        </p>
      </div>
    </div>
  );
}
