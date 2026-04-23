import type { Metadata } from "next";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import Pricing from "@/components/landing/Pricing";
import FAQ from "@/components/landing/FAQ";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";
import JsonLd from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "Create Beautiful Digital Wedding Invitations in Sri Lanka",
  description:
    "Design stunning wedding invitation websites in Sinhala, Tamil & English. Share via WhatsApp, track RSVPs, manage guests. Trusted by 500+ Sri Lankan couples. Starting from Rs. 2,500.",
  alternates: { canonical: "/" },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Is it really free to start?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes! You can create your wedding invitation, choose a template, and preview it completely free. You only pay when you're ready to publish and share it with your guests.",
      },
    },
    {
      "@type": "Question",
      name: "How does the invitation link work?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Each guest gets a unique link (e.g., invitation.lk/i/kasun-dilini). With Standard and Premium plans, each guest sees their own name on the invitation for a personalized touch.",
      },
    },
    {
      "@type": "Question",
      name: "Can I add all my wedding events?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes! You can add multiple events like Poruwa Ceremony, Church Wedding, Reception, Homecoming, and more. Guests see the full schedule on your invitation page.",
      },
    },
    {
      "@type": "Question",
      name: "Do you support Sinhala and Tamil?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Absolutely! Your invitation can be in Sinhala, Tamil, English, or any combination. We fully support all three languages.",
      },
    },
    {
      "@type": "Question",
      name: "How long does my invitation stay active?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Your wedding invitation stays active for 6 months from the wedding date. Extensions are available if needed.",
      },
    },
    {
      "@type": "Question",
      name: "What's included in the free preview?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "You can create your full invitation, add details, choose a template, and see exactly how it looks. The preview shows a watermark. Once you pay, the watermark is removed and you get a shareable link.",
      },
    },
    {
      "@type": "Question",
      name: "Can I change my template later?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, you can switch between templates available in your plan at any time before publishing.",
      },
    },
  ],
};

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Digital Wedding Invitations",
  provider: {
    "@type": "Organization",
    name: "INVITATION.LK",
    url: "https://invitation.lk",
  },
  areaServed: { "@type": "Country", name: "Sri Lanka" },
  serviceType: "Digital Wedding Invitation",
  description:
    "Create beautiful digital wedding invitation websites with RSVP tracking, countdown timer, guest management, and WhatsApp sharing.",
  offers: {
    "@type": "AggregateOffer",
    priceCurrency: "LKR",
    lowPrice: "2500",
    highPrice: "10000",
    offerCount: "3",
    offers: [
      {
        "@type": "Offer",
        name: "Basic Plan",
        price: "2500",
        priceCurrency: "LKR",
        description: "Simple & elegant single page invitation with countdown timer and WhatsApp sharing.",
        url: "https://invitation.lk/pricing",
      },
      {
        "@type": "Offer",
        name: "Standard Plan",
        price: "5000",
        priceCurrency: "LKR",
        description: "Complete wedding website with guest management, Google Maps, personalized links, and add to calendar.",
        url: "https://invitation.lk/pricing",
      },
      {
        "@type": "Offer",
        name: "Premium Plan",
        price: "10000",
        priceCurrency: "LKR",
        description: "Full-featured wedding suite with template customization, wedding planning tools, budget management, and vendor tracking.",
        url: "https://invitation.lk/pricing",
      },
    ],
  },
};

export default function Home() {
  return (
    <>
      <JsonLd data={faqSchema} />
      <JsonLd data={serviceSchema} />
      <Navbar />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <Pricing />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
