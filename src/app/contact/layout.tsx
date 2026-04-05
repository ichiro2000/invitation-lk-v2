import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us | Get Help with Your Wedding Invitation",
  description:
    "Get in touch with INVITATION.LK. We're here to help with your digital wedding invitation. Based in Colombo, Sri Lanka. Email, WhatsApp, or visit us.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact INVITATION.LK",
    description: "Get help with your digital wedding invitation. Based in Colombo, Sri Lanka.",
    url: "https://invitation.lk/contact",
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
