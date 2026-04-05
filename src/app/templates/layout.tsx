import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Wedding Invitation Templates | Sinhala, Tamil & English Designs",
  description:
    "Browse beautiful wedding invitation templates designed for Sri Lankan weddings. Sinhala Mangalya, Vintage Botanical, Golden Glow, and more. Choose from Basic, Standard & Premium designs.",
  alternates: { canonical: "/templates" },
  openGraph: {
    title: "Wedding Invitation Templates | INVITATION.LK",
    description: "Beautiful wedding invitation templates for Sri Lankan weddings. Sinhala, Tamil & English designs.",
    url: "https://invitation.lk/templates",
  },
};

export default function TemplatesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
