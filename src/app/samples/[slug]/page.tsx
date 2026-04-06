import { notFound } from "next/navigation";
import RoyalElegance from "@/components/templates/RoyalElegance";
import ModernBloom from "@/components/templates/ModernBloom";
import GoldenLotus from "@/components/templates/GoldenLotus";
import MinimalGrace from "@/components/templates/MinimalGrace";
import TropicalParadise from "@/components/templates/TropicalParadise";
import EternalNight from "@/components/templates/EternalNight";
import SinhalaMangalya from "@/components/templates/SinhalaMangalya";
import VintageBotanical from "@/components/templates/VintageBotanical";
import RoseGarden from "@/components/templates/RoseGarden";
import ModernElegance from "@/components/templates/ModernElegance";
import type { Metadata } from "next";

const templates: Record<string, { component: React.ComponentType; title: string; description: string }> = {
  "royal-elegance": {
    component: RoyalElegance,
    title: "Royal Elegance — Sample Wedding Invitation",
    description: "Traditional Sri Lankan wedding invitation with deep burgundy and gold theme.",
  },
  "modern-bloom": {
    component: ModernBloom,
    title: "Modern Bloom — Sample Wedding Invitation",
    description: "Modern floral wedding invitation with soft pink and blush tones.",
  },
  "golden-lotus": {
    component: GoldenLotus,
    title: "Golden Lotus — Sample Wedding Invitation",
    description: "Rich gold and maroon Hindu wedding invitation with mandala patterns.",
  },
  "minimal-grace": {
    component: MinimalGrace,
    title: "Minimal Grace — Sample Wedding Invitation",
    description: "Ultra-minimal black and white wedding invitation with clean typography.",
  },
  "tropical-paradise": {
    component: TropicalParadise,
    title: "Tropical Paradise — Sample Wedding Invitation",
    description: "Vibrant teal and coral beach wedding invitation with ocean waves.",
  },
  "eternal-night": {
    component: EternalNight,
    title: "Eternal Night — Sample Wedding Invitation",
    description: "Dark moody celestial wedding invitation with twinkling stars.",
  },
  "sinhala-mangalya": {
    component: SinhalaMangalya,
    title: "Sinhala Mangalya — Sample Wedding Invitation",
    description: "Traditional Sinhala wedding invitation with pink mandala patterns and Sinhala text.",
  },
  "vintage-botanical": {
    component: VintageBotanical,
    title: "Vintage Botanical — Sample Wedding Invitation",
    description: "Elegant botanical wedding invitation with green leaves and watercolor elements.",
  },
  "rose-garden": {
    component: RoseGarden,
    title: "Rose Garden — Sample Wedding Invitation",
    description: "Romantic homecoming invitation with red roses and interactive calendar.",
  },
  "modern-elegance": {
    component: ModernElegance,
    title: "Modern Elegance — Sample Wedding Invitation",
    description: "Premium modern luxury wedding invitation with clean typography and warm tones.",
  },
};

export function generateStaticParams() {
  return Object.keys(templates).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const template = templates[slug];
  if (!template) return {};
  return { title: template.title, description: template.description };
}

export default async function SamplePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const template = templates[slug];
  if (!template) notFound();

  const Component = template.component;
  return <Component />;
}
