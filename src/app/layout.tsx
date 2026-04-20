import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Script from "next/script";
import SessionProvider from "@/components/auth/SessionProvider";
import JsonLd from "@/components/seo/JsonLd";
import "./globals.css";

const GA_MEASUREMENT_ID = "G-4S358FFMM7";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://invitation.lk"),
  title: {
    default: "INVITATION.LK | Beautiful Digital Wedding Invitations in Sri Lanka",
    template: "%s | INVITATION.LK",
  },
  description:
    "Create stunning digital wedding invitation websites for Sri Lankan weddings. Beautiful templates in Sinhala, Tamil & English. RSVP tracking, countdown timer, guest management, WhatsApp sharing. Starting from Rs. 2,500.",
  keywords: [
    "wedding invitation Sri Lanka",
    "digital wedding invitation",
    "online wedding invitation",
    "wedding website Sri Lanka",
    "wedding invitation Colombo",
    "Sinhala wedding invitation",
    "Tamil wedding invitation",
    "wedding RSVP",
    "WhatsApp wedding invitation",
    "wedding card online",
    "e-invitation Sri Lanka",
    "wedding guest management",
    "Sri Lankan wedding",
    "Poruwa ceremony invitation",
    "wedding countdown timer",
  ],
  authors: [{ name: "INVITATION.LK" }],
  creator: "INVITATION.LK",
  publisher: "INVITATION.LK",
  formatDetection: { telephone: true, email: true },
  alternates: { canonical: "/" },
  openGraph: {
    title: "INVITATION.LK | Digital Wedding Invitations for Sri Lankan Weddings",
    description:
      "Create beautiful digital wedding invitations in Sinhala, Tamil & English. RSVP, countdown, guest management & WhatsApp sharing. Trusted by 500+ Sri Lankan couples.",
    url: "https://invitation.lk",
    siteName: "INVITATION.LK",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "INVITATION.LK - Digital Wedding Invitations in Sri Lanka",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "INVITATION.LK | Digital Wedding Invitations",
    description:
      "Create stunning wedding invitations for Sri Lankan weddings. Sinhala, Tamil & English support.",
    images: ["/og-image.svg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  other: {
    "geo.region": "LK-11",
    "geo.placename": "Colombo, Sri Lanka",
    "geo.position": "6.9271;79.8612",
    ICBM: "6.9271, 79.8612",
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "INVITATION.LK",
  url: "https://invitation.lk",
  logo: "https://invitation.lk/og-image.svg",
  contactPoint: {
    "@type": "ContactPoint",
    email: "hello@invitation.lk",
    contactType: "customer service",
    availableLanguage: ["English", "Sinhala", "Tamil"],
    areaServed: "LK",
  },
};

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "INVITATION.LK",
  url: "https://invitation.lk",
  image: "https://invitation.lk/og-image.svg",
  description:
    "Digital wedding invitation platform for Sri Lankan weddings. Create beautiful wedding websites in Sinhala, Tamil & English.",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Colombo",
    addressRegion: "Western Province",
    addressCountry: "LK",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 6.9271,
    longitude: 79.8612,
  },
  priceRange: "Rs. 2,500 - Rs. 10,000",
  currenciesAccepted: "LKR",
  openingHours: "Mo-Sa 09:00-18:00",
  areaServed: {
    "@type": "Country",
    name: "Sri Lanka",
  },
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "INVITATION.LK",
  url: "https://invitation.lk",
  inLanguage: ["en", "si", "ta"],
  description:
    "Create beautiful digital wedding invitations for Sri Lankan weddings.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <head>
        <JsonLd data={organizationSchema} />
        <JsonLd data={localBusinessSchema} />
        <JsonLd data={websiteSchema} />
      </head>
      <body className="min-h-full flex flex-col">
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
