"use client";

import { motion } from "framer-motion";
import { Heart, MapPin, Mail, Phone, Camera, ChevronDown, Leaf } from "lucide-react";
import Link from "next/link";
import Countdown from "./shared/Countdown";
import SecondaryVenue from "./shared/SecondaryVenue";
import { useState } from "react";
import type { InvitationData } from "@/types/invitation";
import { deepMerge } from "@/lib/deep-merge";
import { withOpacity } from "@/lib/with-opacity";
import type { TemplateConfig, ThemeConfig } from "@/types/template-config";
import { DEFAULT_SECTIONS } from "@/types/template-config";

export const DEFAULT_CONFIG: TemplateConfig = {
  theme: {
    primaryColor: "#2d5a27",
    secondaryColor: "#166534",
    backgroundColor: "#fefdf9",
    textColor: "#1f2937",
    accentColor: "#16a34a",
    fontFamily: "serif",
  },
  sections: [...DEFAULT_SECTIONS],
  content: {
    hero: { subtitle: "සමග අබියස ගයිමේ ප්‍රීතිය හිමිකරගන්න", message: "" },
    story: { title: "Our Moments" },
    rsvp: { title: "RSVP", deadline: "Kindly respond by December 1, 2026" },
    footer: { message: "" },
  },
};

/* ── Floating leaves ── */
function FloatingLeaves({ color = "#2d5a27" }: { color?: string }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            left: i % 2 === 0 ? `${(i * 15) % 100}%` : "auto",
            right: i % 2 === 1 ? `${(i * 12) % 50}%` : "auto",
            top: -30,
          }}
          animate={{ y: [0, 800 + i * 20], x: [0, Math.sin(i * 0.5) * 60, Math.cos(i) * 40], rotate: [0, 180 * (i % 2 === 0 ? 1 : -1)], opacity: [0, 0.3, 0.2, 0] }}
          transition={{ duration: 12 + i * 2, repeat: Infinity, delay: i * 1.2 }}
        >
          <Leaf className="w-5 h-5" style={{ color: withOpacity(color, 0.25 + (i % 3) * 0.05) }} />
        </motion.div>
      ))}
    </div>
  );
}

export default function VintageBotanical({ data, config }: { data?: InvitationData; config?: TemplateConfig } = {}) {
  const merged = deepMerge(DEFAULT_CONFIG as Record<string, unknown>, (config || {}) as Record<string, unknown>) as TemplateConfig;
  const theme = merged.theme as ThemeConfig;
  const sections = (merged.sections || DEFAULT_SECTIONS).filter(s => s.visible).sort((a, b) => a.order - b.order);
  const content = merged.content || {};

  const groom = data?.groomName || "කසුන් දීපානායක";
  const bride = data?.brideName || "නයෝමි දීපානායක";
  const date = data?.weddingDate || "2026-12-21";
  const time = data?.weddingTime || "9:00 AM";
  const venue = data?.venue || "දේශානි උත්සව ශාලාව";
  const venueAddr = data?.venueAddress || "බටුගෙදර, රත්නපුර";
  const events = data?.events || [
    { title: "පොරුව උත්සවය", time: "10:50 AM", venue: "දේශානි උත්සව ශාලාව", description: "පෝරුව චාරිත්‍ර" },
    { title: "මංගල උත්සවය", time: "පෙ.ව. 09.00 - ප.ව. 03.30", venue: "දේශානි උත්සව ශාලාව", description: "මංගල උත්සවය සහ සාද භෝජනය" },
  ];

  const dateObj = new Date(date + "T00:00:00");
  const formattedDate = dateObj.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  const [rsvpSent, setRsvpSent] = useState(false);

  const HeroSection = () => (
    <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 overflow-hidden">
      <FloatingLeaves color={theme.primaryColor} />
      <div className="absolute top-0 right-0 w-64 h-96 opacity-10">
        <svg viewBox="0 0 200 400" className="w-full h-full">
          <motion.path d="M180 0 Q160 80 140 160 Q120 240 180 320 Q150 280 130 220 Q110 160 120 80 Q130 40 180 0" fill={theme.primaryColor} animate={{ d: ["M180 0 Q160 80 140 160 Q120 240 180 320 Q150 280 130 220 Q110 160 120 80 Q130 40 180 0", "M180 0 Q155 90 135 170 Q115 250 175 330 Q145 290 125 230 Q105 170 115 90 Q125 50 180 0", "M180 0 Q160 80 140 160 Q120 240 180 320 Q150 280 130 220 Q110 160 120 80 Q130 40 180 0"] }} transition={{ duration: 8, repeat: Infinity }} />
        </svg>
      </div>
      <div className="absolute bottom-0 left-0 w-64 h-96 opacity-10 scale-x-[-1]">
        <svg viewBox="0 0 200 400" className="w-full h-full">
          <path d="M180 400 Q160 320 140 240 Q120 160 180 80 Q150 120 130 180 Q110 240 120 320 Q130 360 180 400" fill={theme.primaryColor} />
        </svg>
      </div>

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} className="relative z-10 max-w-lg">
        <motion.div className="w-28 h-28 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ background: `linear-gradient(to bottom right, ${withOpacity(theme.primaryColor, 0.05)}, ${withOpacity(theme.secondaryColor, 0.05)})`, borderWidth: 2, borderStyle: "solid", borderColor: withOpacity(theme.primaryColor, 0.2) }} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.3 }}>
          <Heart className="w-12 h-12" style={{ color: theme.secondaryColor, fill: theme.secondaryColor }} />
        </motion.div>

        <motion.p className="text-xs leading-relaxed mb-2" style={{ color: withOpacity(theme.textColor, 0.5) }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          නිමේශිගලු වටාපන පදිංචි එම්.ජී. දිසානායක<br />මැතිතුමා හා එම මැතිනියගේ ආදරණීය දියණිය
        </motion.p>
        <motion.h1 className="text-4xl sm:text-5xl font-bold mb-4" style={{ color: theme.primaryColor }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>{bride}</motion.h1>

        <motion.p className="text-xs leading-relaxed mb-2" style={{ color: withOpacity(theme.textColor, 0.5) }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
          මැදගම මැතුලයගම පදිංචි සැසිරිය ඩී.එම්. ජයසේන<br />මැතිතුමාගේ හා සුජීවන් එම මැතිනියගේ ආදරණීය පුත්
        </motion.p>
        <motion.h1 className="text-4xl sm:text-5xl font-bold mb-8" style={{ color: theme.primaryColor }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}>{groom}</motion.h1>

        <motion.div className="bg-white rounded-2xl px-8 py-6 shadow-sm" style={{ borderWidth: 1, borderStyle: "solid", borderColor: withOpacity(theme.primaryColor, 0.15) }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }}>
          <p className="text-sm mb-1" style={{ color: theme.secondaryColor }}>{content.hero?.subtitle || "සමග අබියස ගයිමේ ප්‍රීතිය හිමිකරගන්න"}</p>
          <p className="text-2xl font-bold mb-1" style={{ color: theme.textColor }}>{formattedDate}</p>
          <p className="text-sm" style={{ color: withOpacity(theme.textColor, 0.5) }}>{time} සිට</p>
          <p className="text-sm mt-2" style={{ color: withOpacity(theme.textColor, 0.4) }}>(පෝරුව චාරිත්‍ර පෙරවරය 10.50 ට)</p>
          <div className="w-16 h-px mx-auto my-4" style={{ backgroundColor: withOpacity(theme.primaryColor, 0.2) }} />
          <p className="font-semibold" style={{ color: theme.secondaryColor }}>{venue}</p>
        </motion.div>

        <motion.div className="mt-6 pt-6" style={{ borderTop: `1px dashed ${withOpacity(theme.primaryColor, 0.2)}` }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }}>
          <p className="text-sm italic" style={{ color: withOpacity(theme.textColor, 0.5) }}>(ඔබට/ඔබ දෙපලට/ඔබ සමඟ)</p>
          <p className="text-sm italic" style={{ color: withOpacity(theme.textColor, 0.5) }}>තොරතුරු ආරාධනය කරන්නෙමු !</p>
        </motion.div>
      </motion.div>

      <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }} className="absolute bottom-8 z-10">
        <ChevronDown className="w-6 h-6" style={{ color: withOpacity(theme.primaryColor, 0.4) }} />
      </motion.div>
    </section>
  );

  const CountdownSection = () => (
    <section className="py-20 text-white text-center" style={{ background: `linear-gradient(to right, ${theme.secondaryColor}, ${theme.accentColor})` }}>
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <p className="tracking-[0.3em] uppercase text-xs mb-8" style={{ color: withOpacity("#ffffff", 0.7) }}>Counting Down</p>
        <Countdown targetDate={`${date}T09:00:00`} valueClassName="text-3xl sm:text-6xl font-light text-white" labelClassName="text-[10px] tracking-wider uppercase mt-2" labelStyle={{ color: withOpacity("#ffffff", 0.6) }}
          boxClassName="flex flex-col items-center bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl px-3 sm:px-5 py-4 min-w-[60px] sm:min-w-[85px]" separatorClassName="text-xl sm:text-3xl font-light text-white/30 mx-1 self-start mt-2" />
      </motion.div>
    </section>
  );

  const GallerySection = () => (
    <section className="py-24 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-3xl font-bold mb-12 text-center" style={{ color: theme.primaryColor }}>
          {content.story?.title || "Our Moments"}
        </motion.h2>
        {content.gallery?.images?.length ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {content.gallery.images.map((src: string, i: number) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} whileHover={{ scale: 1.03 }} className="rounded-2xl overflow-hidden aspect-[4/3]">
                <img src={src} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover" />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} whileHover={{ scale: 1.03 }}
                className={`${i === 1 || i === 4 ? "row-span-2" : ""} rounded-2xl min-h-[140px] flex items-center justify-center cursor-pointer group`}
                style={{ background: `linear-gradient(to bottom right, ${withOpacity(theme.primaryColor, 0.08)}, ${withOpacity(theme.secondaryColor, 0.05)})`, borderWidth: 1, borderStyle: "solid", borderColor: withOpacity(theme.primaryColor, 0.1) }}>
                <Camera className="w-6 h-6 group-hover:opacity-60 transition-colors" style={{ color: withOpacity(theme.primaryColor, 0.25) }} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );

  const VenueSection = () => (
    <section className="py-24 px-4" style={{ backgroundColor: withOpacity(theme.primaryColor, 0.03) }}>
      <div className="max-w-3xl mx-auto text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-3xl font-bold mb-4" style={{ color: theme.primaryColor }}>Venue</h2>
          <div className="flex items-center justify-center gap-2 mb-2">
            <MapPin className="w-5 h-5" style={{ color: theme.secondaryColor }} />
            <h3 className="text-xl font-semibold" style={{ color: theme.textColor }}>{venue}</h3>
          </div>
          <p className="mb-8" style={{ color: withOpacity(theme.textColor, 0.4) }}>{venueAddr}</p>
          {(content.venue?.mapUrl || venue || venueAddr) ? (
            <iframe src={`https://maps.google.com/maps?q=${encodeURIComponent(content.venue?.mapUrl && content.venue.mapUrl.includes("google") ? content.venue.mapUrl : [venue, venueAddr].filter(Boolean).join(", "))}&output=embed`}
              className="w-full h-64 rounded-2xl border-0" loading="lazy" allowFullScreen title="Wedding Venue Map" />
          ) : (
            <div className="rounded-2xl h-64 flex items-center justify-center" style={{ background: `linear-gradient(to bottom right, ${withOpacity(theme.primaryColor, 0.08)}, ${withOpacity(theme.secondaryColor, 0.05)})`, borderWidth: 1, borderStyle: "solid", borderColor: withOpacity(theme.primaryColor, 0.15) }}>
              <MapPin className="w-10 h-10" style={{ color: withOpacity(theme.primaryColor, 0.25) }} />
            </div>
          )}
          {content.venue?.mapUrl && (
            <a href={content.venue.mapUrl.startsWith("http") ? content.venue.mapUrl : `https://maps.google.com/maps?q=${encodeURIComponent(content.venue.mapUrl)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full text-sm" style={{ color: theme.secondaryColor, border: `1px solid ${withOpacity(theme.primaryColor, 0.3)}` }}>
              <MapPin className="w-4 h-4" /> Open in Google Maps
            </a>
          )}
          <SecondaryVenue second={content.venue?.second} primaryColor={theme.primaryColor} secondaryColor={theme.secondaryColor} accentColor={theme.accentColor} />
        </motion.div>
      </div>
    </section>
  );

  const RsvpSection = () => (
    <section className="py-24 text-white px-4" style={{ background: `linear-gradient(to bottom, ${theme.secondaryColor}, ${theme.accentColor})` }}>
      <div className="max-w-md mx-auto text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <Leaf className="w-8 h-8 mx-auto mb-6" style={{ color: withOpacity("#ffffff", 0.6) }} />
          <h2 className="text-3xl font-bold mb-4">{content.rsvp?.title || "RSVP"}</h2>
          <p className="text-sm mb-10" style={{ color: withOpacity("#ffffff", 0.7) }}>{content.rsvp?.deadline || "Kindly respond by December 1, 2026"}</p>
          {rsvpSent ? (
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="bg-white/10 rounded-2xl p-8 backdrop-blur-sm">
              <Heart className="w-12 h-12 mx-auto mb-4" style={{ color: withOpacity("#ffffff", 0.6), fill: withOpacity("#ffffff", 0.6) }} />
              <p className="text-xl">Thank you!</p>
            </motion.div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); setRsvpSent(true); }} className="space-y-4">
              <input type="text" placeholder="Full Name" required className="w-full px-5 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-white/50 text-sm backdrop-blur-sm" />
              <input type="tel" placeholder="Phone Number" className="w-full px-5 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-white/50 text-sm backdrop-blur-sm" />
              <select className="w-full px-5 py-3 border border-white/20 rounded-xl text-white focus:outline-none text-sm" style={{ backgroundColor: theme.secondaryColor }}>
                <option value="">Will you attend?</option>
                <option value="yes">Yes, I will attend</option>
                <option value="no">Sorry, cannot make it</option>
              </select>
              <input type="number" min="1" max="10" placeholder="Number of guests" className="w-full px-5 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-white/50 text-sm backdrop-blur-sm" />
              <motion.button type="submit" whileHover={{ scale: 1.02 }} className="w-full py-3 rounded-xl font-semibold shadow-lg" style={{ backgroundColor: "#ffffff", color: theme.secondaryColor }}>
                Send RSVP
              </motion.button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );

  const FooterSection = () => (
    <footer className="py-10 text-center px-4" style={{ backgroundColor: theme.backgroundColor }}>
      <Heart className="w-5 h-5 mx-auto mb-3" style={{ color: theme.secondaryColor, fill: theme.secondaryColor }} />
      <p className="text-lg font-bold" style={{ color: theme.primaryColor }}>{bride} & {groom}</p>
      <p className="text-sm mt-1" style={{ color: withOpacity(theme.textColor, 0.4) }}>{formattedDate} &middot; {venue}</p>
      <div className="flex justify-center gap-3 mt-4 mb-4">
        <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ borderWidth: 1, borderStyle: "solid", borderColor: withOpacity(theme.primaryColor, 0.2) }}><Phone className="w-4 h-4" style={{ color: theme.secondaryColor }} /></div>
        <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ borderWidth: 1, borderStyle: "solid", borderColor: withOpacity(theme.primaryColor, 0.2) }}><Mail className="w-4 h-4" style={{ color: theme.secondaryColor }} /></div>
      </div>
      <p className="text-xs" style={{ color: withOpacity(theme.textColor, 0.3) }}>
        Created with <Heart className="w-3 h-3 inline" style={{ color: theme.secondaryColor, fill: theme.secondaryColor }} /> by{" "}
        <Link href="/" style={{ color: theme.secondaryColor }} className="hover:underline">INVITATION.LK</Link>
      </p>
    </footer>
  );

  const renderSection = (sectionId: string) => {
    switch (sectionId) {
      case "hero": return <HeroSection key="hero" />;
      case "countdown": return <CountdownSection key="countdown" />;
      case "story": return <GallerySection key="story" />;
      case "events": return null;
      case "gallery": return <GallerySection key="gallery" />;
      case "venue": return <VenueSection key="venue" />;
      case "rsvp": return <RsvpSection key="rsvp" />;
      case "footer": return <FooterSection key="footer" />;
      default: return null;
    }
  };

  return (
    <div className="overflow-hidden" style={{ backgroundColor: theme.backgroundColor, color: theme.textColor, fontFamily: theme.fontFamily }}>
      {sections.map(s => renderSection(s.id))}
    </div>
  );
}
