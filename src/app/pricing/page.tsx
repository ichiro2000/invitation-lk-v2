import Navbar from "@/components/landing/Navbar";
import Pricing from "@/components/landing/Pricing";
import FAQ from "@/components/landing/FAQ";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing | Wedding Invitation Plans from Rs. 2,500",
  description:
    "Affordable digital wedding invitation plans for Sri Lankan weddings. Basic Rs. 2,500, Standard Rs. 5,000, Premium Rs. 10,000. One-time payment, no monthly fees. Start free!",
  alternates: { canonical: "/pricing" },
  openGraph: {
    title: "Wedding Invitation Pricing | INVITATION.LK",
    description: "Plans from Rs. 2,500. One-time payment for beautiful digital wedding invitations.",
    url: "https://invitation.lk/pricing",
  },
};

export default function PricingPage() {
  return (
    <>
      <Navbar />
      <main className="pt-20">
        <Pricing />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
