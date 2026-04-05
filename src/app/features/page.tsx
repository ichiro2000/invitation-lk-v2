import Navbar from "@/components/landing/Navbar";
import Features from "@/components/landing/Features";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Features | RSVP, Countdown Timer, WhatsApp Sharing & More",
  description:
    "Discover all features of INVITATION.LK — RSVP tracking, countdown timers, WhatsApp sharing, guest management, personalized links, Google Maps, and Sinhala/Tamil support for Sri Lankan weddings.",
  alternates: { canonical: "/features" },
  openGraph: {
    title: "Wedding Invitation Features | INVITATION.LK",
    description: "RSVP, countdown, WhatsApp sharing, guest management & more for Sri Lankan weddings.",
    url: "https://invitation.lk/features",
  },
};

export default function FeaturesPage() {
  return (
    <>
      <Navbar />
      <main className="pt-20">
        <Features />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
