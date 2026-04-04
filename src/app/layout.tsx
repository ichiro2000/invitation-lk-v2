import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "INVITATION.LK | Beautiful Digital Wedding Invitations in Sri Lanka",
  description: "Create stunning digital wedding invitation websites for Sri Lankan weddings. Custom designs with RSVP, countdown timer, guest management, and WhatsApp sharing.",
  keywords: "wedding invitation, digital invitation, Sri Lanka, wedding website, RSVP, Sinhala, Tamil",
  openGraph: {
    title: "INVITATION.LK | Digital Wedding Invitations",
    description: "Create stunning digital wedding invitation websites for Sri Lankan weddings.",
    url: "https://invitation.lk",
    siteName: "INVITATION.LK",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
