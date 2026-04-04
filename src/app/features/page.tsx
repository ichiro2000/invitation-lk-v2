import Navbar from "@/components/landing/Navbar";
import Features from "@/components/landing/Features";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Features | INVITATION.LK",
  description: "Discover all the features of INVITATION.LK — RSVP management, countdown timers, WhatsApp sharing, guest management, and more.",
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
