"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { Heart, MapPin, Mail, Phone, Camera, ChevronDown, Sun, Waves } from "lucide-react";
import Countdown from "./shared/Countdown";
import SecondaryVenue from "./shared/SecondaryVenue";
import { useState, useRef } from "react";
import type { InvitationData } from "@/types/invitation";
import { deepMerge } from "@/lib/deep-merge";
import { withOpacity } from "@/lib/with-opacity";
import type { TemplateConfig, ThemeConfig } from "@/types/template-config";
import { DEFAULT_SECTIONS } from "@/types/template-config";

export const DEFAULT_CONFIG: TemplateConfig = {
  theme: {
    primaryColor: "#0d9488",
    secondaryColor: "#115e59",
    backgroundColor: "#fefcf8",
    textColor: "#1f2937",
    accentColor: "#f97316",
    fontFamily: "sans-serif",
  },
  sections: [...DEFAULT_SECTIONS],
  content: {
    hero: { subtitle: "A Beach Wedding", message: "" },
    story: { title: "Our Story" },
    rsvp: { title: "Join Us at the Beach!", deadline: "RSVP by February 28, 2026" },
    footer: { message: "" },
  },
};

/* ── CSS-based ocean waves ── */
function OceanWaves({ variant = "light", color = "#0d9488" }: { variant?: "light" | "dark"; color?: string }) {
  const baseColor = variant === "dark" ? "rgba(255,255,255,0.08)" : withOpacity(color, 0.08);
  const midColor = variant === "dark" ? "rgba(255,255,255,0.05)" : withOpacity(color, 0.05);
  const topColor = variant === "dark" ? "rgba(255,255,255,0.03)" : withOpacity(color, 0.03);

  return (
    <div className="absolute bottom-0 left-0 right-0 h-32 overflow-hidden pointer-events-none">
      <div className="absolute bottom-0 left-0 w-full h-16" style={{ background: baseColor, borderRadius: "100% 100% 0 0", animation: "waveMove1 8s ease-in-out infinite" }} />
      <div className="absolute bottom-2 left-0 w-full h-20" style={{ background: midColor, borderRadius: "60% 80% 0 0", animation: "waveMove2 10s ease-in-out infinite" }} />
      <div className="absolute bottom-4 left-0 w-full h-24" style={{ background: topColor, borderRadius: "80% 60% 0 0", animation: "waveMove3 12s ease-in-out infinite" }} />
      <style>{`
        @keyframes waveMove1 { 0%, 100% { border-radius: 100% 100% 0 0; transform: translateX(0); } 50% { border-radius: 60% 80% 0 0; transform: translateX(-2%); } }
        @keyframes waveMove2 { 0%, 100% { border-radius: 60% 80% 0 0; transform: translateX(0); } 50% { border-radius: 100% 60% 0 0; transform: translateX(2%); } }
        @keyframes waveMove3 { 0%, 100% { border-radius: 80% 60% 0 0; transform: translateX(0); } 50% { border-radius: 50% 100% 0 0; transform: translateX(-1%); } }
      `}</style>
    </div>
  );
}

/* ── Floating bubbles ── */
function Bubbles({ count = 8, color = "#0d9488" }: { count?: number; color?: string }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: count }).map((_, i) => {
        const size = 4 + (i % 5) * 3;
        return (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{ width: size, height: size, left: `${(i * 43 + 7) % 100}%`, bottom: -20, borderWidth: 1, borderStyle: "solid", borderColor: withOpacity(color, 0.2) }}
            animate={{ y: [0, -(500 + i * 30)], x: [0, Math.sin(i) * 30], opacity: [0, 0.3, 0.2, 0] }}
            transition={{ duration: 10 + (i % 4) * 2, repeat: Infinity, delay: (i * 1.5) % 8, ease: "easeOut" }}
          />
        );
      })}
    </div>
  );
}

/* ── Palm tree silhouette SVG ── */
function PalmSilhouette({ className, color = "#0d9488" }: { className: string; color?: string }) {
  return (
    <svg className={`absolute pointer-events-none ${className}`} viewBox="0 0 100 200" width="120">
      <path d="M50 200 Q48 150 50 100 Q52 80 55 60" stroke={withOpacity(color, 0.1)} fill="none" strokeWidth="3" />
      <path d="M55 60 Q30 40 10 55" stroke={withOpacity(color, 0.07)} fill="none" strokeWidth="2" />
      <path d="M55 60 Q80 35 95 45" stroke={withOpacity(color, 0.07)} fill="none" strokeWidth="2" />
      <path d="M55 60 Q40 30 20 30" stroke={withOpacity(color, 0.07)} fill="none" strokeWidth="2" />
      <path d="M55 60 Q70 25 90 20" stroke={withOpacity(color, 0.07)} fill="none" strokeWidth="2" />
      <path d="M55 60 Q55 20 60 10" stroke={withOpacity(color, 0.07)} fill="none" strokeWidth="2" />
    </svg>
  );
}

export default function TropicalParadise({ data, config }: { data?: InvitationData; config?: TemplateConfig } = {}) {
  const merged = deepMerge(DEFAULT_CONFIG as Record<string, unknown>, (config || {}) as Record<string, unknown>) as TemplateConfig;
  const theme = merged.theme as ThemeConfig;
  const sections = (merged.sections || DEFAULT_SECTIONS).filter(s => s.visible).sort((a, b) => a.order - b.order);
  const content = merged.content || {};

  const groom = data?.groomName || "Dinesh";
  const bride = data?.brideName || "Ishara";
  const date = data?.weddingDate || "2026-03-28";
  const time = data?.weddingTime || "4:00 PM";
  const venue = data?.venue || "Mirissa Beach Resort";
  const venueAddr = data?.venueAddress || "Mirissa, Southern Province, Sri Lanka";
  const events = data?.events || [
    { title: "Beach Ceremony", time: "4:00 PM", description: "Vows on the sand as the sun begins to set" },
    { title: "Sunset Cocktails", time: "5:30 PM", description: "Drinks and canapes on the beach deck" },
    { title: "Seafood Feast", time: "7:00 PM", description: "Fresh Sri Lankan seafood dinner under the stars" },
    { title: "Bonfire Party", time: "9:00 PM", description: "Live music, dancing, and a bonfire on the beach" },
  ];

  const dateObj = new Date(date + "T00:00:00");
  const formattedDate = dateObj.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  const storyItems = content.story?.items || [
    { year: "2020", title: "First Meeting", description: "Ishara and Dinesh met during a surfing class in Arugam Bay." },
    { year: "2021", title: "Started Dating", description: "She offered to teach him, and by the end of that golden afternoon, he had found someone extraordinary." },
    { year: "2024", title: "The Proposal", description: "One unforgettable proposal at Mirissa whale watching — yes, a whale breached at the exact moment!" },
    { year: "2026", title: "The Wedding", description: "They are ready to say 'I do' with their feet in the sand." },
  ];

  const [rsvpSent, setRsvpSent] = useState(false);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const HeroSection = () => (
    <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 overflow-hidden">
      <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, ${withOpacity(theme.primaryColor, 0.08)}, ${theme.backgroundColor}, ${theme.backgroundColor})` }} />
      <PalmSilhouette className="top-0 left-0" color={theme.primaryColor} />
      <PalmSilhouette className="bottom-20 right-0 scale-x-[-1]" color={theme.primaryColor} />
      <Bubbles count={8} color={theme.primaryColor} />
      <OceanWaves variant="light" color={theme.primaryColor} />

      <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10">
        <motion.div className="flex items-center justify-center gap-4 mb-10" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
          <motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 2, repeat: Infinity }}>
            <Waves className="w-6 h-6" style={{ color: theme.primaryColor }} />
          </motion.div>
          <motion.div animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.1, 1] }} transition={{ duration: 4, repeat: Infinity }}>
            <Sun className="w-8 h-8" style={{ color: theme.accentColor }} />
          </motion.div>
          <motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}>
            <Waves className="w-6 h-6" style={{ color: theme.primaryColor }} />
          </motion.div>
        </motion.div>

        <motion.p className="tracking-[0.3em] uppercase text-sm mb-10 font-light" style={{ color: theme.primaryColor }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          {content.hero?.subtitle || "A Beach Wedding"}
        </motion.p>

        <motion.h1 className="text-6xl sm:text-8xl lg:text-9xl font-light leading-none" style={{ color: theme.secondaryColor }} initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, delay: 0.3 }}>{bride}</motion.h1>

        <motion.div className="flex items-center justify-center gap-4 my-4" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 1, delay: 0.8 }}>
          <div className="w-14 h-px" style={{ background: `linear-gradient(to right, transparent, ${withOpacity(theme.primaryColor, 0.5)})` }} />
          <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
            <Heart className="w-5 h-5" style={{ color: theme.accentColor, fill: theme.accentColor }} />
          </motion.div>
          <div className="w-14 h-px" style={{ background: `linear-gradient(to left, transparent, ${withOpacity(theme.primaryColor, 0.5)})` }} />
        </motion.div>

        <motion.h1 className="text-6xl sm:text-8xl lg:text-9xl font-light leading-none" style={{ color: theme.secondaryColor }} initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, delay: 0.6 }}>{groom}</motion.h1>

        <motion.div className="mt-12 rounded-full px-10 py-4 inline-flex items-center gap-6 text-sm" style={{ backgroundColor: withOpacity(theme.primaryColor, 0.08), color: theme.primaryColor }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.5 }}>
          <span>{formattedDate}</span>
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: withOpacity(theme.primaryColor, 0.5) }} />
          <span>{venue}</span>
        </motion.div>
      </motion.div>

      <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }} className="absolute bottom-8 z-10">
        <ChevronDown className="w-6 h-6" style={{ color: withOpacity(theme.primaryColor, 0.5) }} />
      </motion.div>
    </section>
  );

  const CountdownSection = () => (
    <section className="relative py-20 text-center text-white overflow-hidden" style={{ background: `linear-gradient(to right, ${theme.primaryColor}, ${theme.secondaryColor})` }}>
      <Bubbles count={6} color={theme.primaryColor} />
      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="relative z-10">
        <p className="tracking-[0.3em] uppercase text-xs mb-8" style={{ color: withOpacity("#ffffff", 0.7) }}>Toes in the sand in</p>
        <Countdown
          targetDate={`${date}T16:00:00`}
          valueClassName="text-3xl sm:text-6xl font-light text-white"
          labelClassName="text-[10px] tracking-[0.2em] uppercase mt-3"
          labelStyle={{ color: withOpacity("#ffffff", 0.6) }}
          boxClassName="flex flex-col items-center bg-white/10 rounded-xl sm:rounded-2xl px-3 sm:px-6 py-5 min-w-[60px] sm:min-w-[90px] backdrop-blur-sm"
          separatorClassName="text-xl sm:text-3xl font-light text-white/20 mx-1 self-start mt-3"
        />
      </motion.div>
    </section>
  );

  const StorySection = () => (
    <section className="py-28 px-4 max-w-3xl mx-auto text-center">
      <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
        <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 3, repeat: Infinity }}>
          <Waves className="w-10 h-10 mx-auto mb-8" style={{ color: withOpacity(theme.primaryColor, 0.5) }} />
        </motion.div>
        <h2 className="text-4xl sm:text-5xl font-light mb-10" style={{ color: theme.secondaryColor }}>{content.story?.title || "Our Story"}</h2>

        {storyItems.map((item, i) => (
          <motion.p key={i} className="text-lg leading-loose mb-8" style={{ color: withOpacity(theme.textColor, 0.6) }} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.2 }}>
            <span className="font-semibold" style={{ color: theme.primaryColor }}>{item.year} - {item.title}:</span> {item.description}
          </motion.p>
        ))}
      </motion.div>
    </section>
  );

  const EventsSection = () => (
    <section className="relative py-28 px-4 overflow-hidden" style={{ backgroundColor: withOpacity(theme.primaryColor, 0.05) }}>
      <Bubbles count={4} color={theme.primaryColor} />
      <div className="max-w-5xl mx-auto relative z-10">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
          <p className="tracking-[0.3em] uppercase text-xs mb-4" style={{ color: theme.primaryColor }}>Beach Day Schedule</p>
          <h2 className="text-4xl sm:text-5xl font-light" style={{ color: theme.secondaryColor }}>Wedding Events</h2>
        </motion.div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {events.map((event, i) => {
            const icons = [Sun, Waves, Heart, Sun];
            const EventIcon = icons[i % icons.length];
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.12 }} whileHover={{ y: -8, boxShadow: `0 20px 40px -12px ${withOpacity(theme.primaryColor, 0.12)}` }} className="bg-white rounded-2xl p-6 text-center shadow-sm transition-all">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: withOpacity(theme.primaryColor, 0.08) }}>
                  <EventIcon className="w-6 h-6" style={{ color: i % 2 === 0 ? theme.accentColor : theme.primaryColor }} />
                </div>
                <p className="text-sm font-medium mb-1" style={{ color: theme.accentColor }}>{event.time}</p>
                <h3 className="font-semibold mb-2" style={{ color: theme.secondaryColor }}>{event.title}</h3>
                <p className="text-sm" style={{ color: withOpacity(theme.textColor, 0.5) }}>{event.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );

  const GallerySection = () => (
    <section className="py-28 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
          <p className="tracking-[0.3em] uppercase text-xs mb-4" style={{ color: theme.primaryColor }}>Gallery</p>
          <h2 className="text-4xl sm:text-5xl font-light" style={{ color: theme.secondaryColor }}>Sun-Kissed Memories</h2>
        </motion.div>

        {content.gallery?.images?.length ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {content.gallery.images.map((src: string, i: number) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.05 }} whileHover={{ scale: 1.05, zIndex: 10 }} className="rounded-xl overflow-hidden aspect-[4/3]">
                <img src={src} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover" />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.05 }} whileHover={{ scale: 1.05, zIndex: 10 }}
                className={`${i === 4 ? "sm:row-span-2" : ""} rounded-xl min-h-[130px] flex items-center justify-center cursor-pointer group`}
                style={{ background: `linear-gradient(to bottom right, ${withOpacity(theme.primaryColor, 0.1)}, ${withOpacity(theme.accentColor, 0.05)})` }}>
                <Camera className="w-6 h-6 group-hover:opacity-60 transition-colors" style={{ color: withOpacity(theme.primaryColor, 0.3) }} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );

  const VenueSection = () => (
    <section className="py-28 px-4" style={{ backgroundColor: withOpacity(theme.primaryColor, 0.05) }}>
      <div className="max-w-4xl mx-auto text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="tracking-[0.3em] uppercase text-xs mb-4" style={{ color: theme.primaryColor }}>Location</p>
          <h2 className="text-4xl sm:text-5xl font-light mb-2" style={{ color: theme.secondaryColor }}>{venue}</h2>
          <p className="mb-10" style={{ color: withOpacity(theme.textColor, 0.5) }}>{venueAddr}</p>
          {(content.venue?.mapUrl || venue || venueAddr) ? (
            <iframe
              src={`https://maps.google.com/maps?q=${encodeURIComponent(content.venue?.mapUrl && content.venue.mapUrl.includes("google") ? content.venue.mapUrl : [venue, venueAddr].filter(Boolean).join(", "))}&output=embed`}
              className="w-full h-64 rounded-2xl border-0" loading="lazy" allowFullScreen title="Wedding Venue Map"
            />
          ) : (
            <div className="rounded-2xl h-72 sm:h-80 flex items-center justify-center" style={{ background: `linear-gradient(to bottom right, ${withOpacity(theme.primaryColor, 0.1)}, ${withOpacity(theme.accentColor, 0.05)})` }}>
              <MapPin className="w-10 h-10" style={{ color: withOpacity(theme.primaryColor, 0.3) }} />
            </div>
          )}
          {content.venue?.mapUrl && (
            <a href={content.venue.mapUrl.startsWith("http") ? content.venue.mapUrl : `https://maps.google.com/maps?q=${encodeURIComponent(content.venue.mapUrl)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full text-sm" style={{ color: theme.primaryColor, border: `1px solid ${withOpacity(theme.primaryColor, 0.3)}` }}>
              <MapPin className="w-4 h-4" /> Open in Google Maps
            </a>
          )}
          <motion.div whileHover={{ y: -2 }} className="mt-8 bg-white rounded-xl p-6 inline-block shadow-sm">
            <p className="text-sm mb-2" style={{ color: withOpacity(theme.textColor, 0.5) }}>Dress Code</p>
            <p className="font-medium text-lg" style={{ color: theme.secondaryColor }}>Beach Formal &middot; Light Colors Encouraged</p>
            <p className="text-xs mt-1" style={{ color: withOpacity(theme.textColor, 0.4) }}>Flat shoes or bare feet recommended for the sand ceremony!</p>
          </motion.div>
          <SecondaryVenue second={content.venue?.second} primaryColor={theme.primaryColor} secondaryColor={theme.secondaryColor} accentColor={theme.accentColor} />
        </motion.div>
      </div>
    </section>
  );

  const RsvpSection = () => (
    <section className="relative py-28 text-white px-4 overflow-hidden" style={{ background: `linear-gradient(to bottom, ${theme.primaryColor}, ${theme.secondaryColor})` }}>
      <Bubbles count={6} color={theme.primaryColor} />
      <OceanWaves variant="dark" color={theme.primaryColor} />
      <div className="max-w-md mx-auto text-center relative z-10">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 4, repeat: Infinity }}>
            <Sun className="w-10 h-10 mx-auto mb-8" style={{ color: theme.accentColor }} />
          </motion.div>
          <h2 className="text-4xl sm:text-5xl font-light mb-4">{content.rsvp?.title || "Join Us at the Beach!"}</h2>
          <p className="text-sm mb-12" style={{ color: withOpacity("#ffffff", 0.7) }}>{content.rsvp?.deadline || "RSVP by February 28, 2026"}</p>

          {rsvpSent ? (
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white/10 rounded-2xl p-10 backdrop-blur-sm">
              <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                <Sun className="w-12 h-12 mx-auto mb-4" style={{ color: theme.accentColor }} />
              </motion.div>
              <p className="text-2xl font-light">See you at the beach!</p>
              <p className="mt-2 text-sm" style={{ color: withOpacity("#ffffff", 0.7) }}>We can&apos;t wait to celebrate with you.</p>
            </motion.div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); setRsvpSent(true); }} className="space-y-4">
              <input type="text" placeholder="Your Name" required className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-white/50 text-sm backdrop-blur-sm" />
              <input type="email" placeholder="Email Address" className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-white/50 text-sm backdrop-blur-sm" />
              <select className="w-full px-5 py-4 border border-white/20 rounded-xl text-white focus:outline-none focus:border-white/50 text-sm" style={{ backgroundColor: theme.secondaryColor }}>
                <option value="">Will you be there?</option>
                <option value="yes">Yes, count me in!</option>
                <option value="no">Sorry, I can&apos;t make it</option>
              </select>
              <input type="number" min="1" max="4" placeholder="Number of guests" className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-white/50 text-sm backdrop-blur-sm" />
              <textarea placeholder="Dietary needs or message..." rows={3} className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-white/50 text-sm resize-none backdrop-blur-sm" />
              <motion.button type="submit" whileHover={{ scale: 1.02, boxShadow: "0 8px 30px rgba(0,0,0,0.15)" }} whileTap={{ scale: 0.98 }} className="w-full py-4 rounded-xl font-semibold shadow-lg" style={{ backgroundColor: "#ffffff", color: theme.primaryColor }}>
                RSVP Now
              </motion.button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );

  const FooterSection = () => (
    <footer className="py-14 text-center px-4" style={{ backgroundColor: theme.backgroundColor }}>
      <div className="flex items-center justify-center gap-3 mb-4">
        <Waves className="w-4 h-4" style={{ color: withOpacity(theme.primaryColor, 0.5) }} />
        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
          <Heart className="w-5 h-5" style={{ color: theme.accentColor, fill: theme.accentColor }} />
        </motion.div>
        <Waves className="w-4 h-4" style={{ color: withOpacity(theme.primaryColor, 0.5) }} />
      </div>
      <p className="text-xl font-light" style={{ color: theme.secondaryColor }}>{bride} & {groom}</p>
      <p className="text-sm mt-2" style={{ color: withOpacity(theme.textColor, 0.4) }}>{formattedDate} &middot; {venue}</p>
      <div className="flex justify-center gap-3 mt-6 mb-6">
        {[Phone, Mail].map((Icon, i) => (
          <motion.div key={i} whileHover={{ scale: 1.15 }} className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer" style={{ borderWidth: 1, borderStyle: "solid", borderColor: withOpacity(theme.primaryColor, 0.3) }}>
            <Icon className="w-4 h-4" style={{ color: theme.primaryColor }} />
          </motion.div>
        ))}
      </div>
      <p className="text-xs" style={{ color: withOpacity(theme.textColor, 0.4) }}>
        Created with <Heart className="w-3 h-3 inline" style={{ color: theme.accentColor, fill: theme.accentColor }} /> by{" "}
        <Link href="/" style={{ color: theme.primaryColor }} className="hover:underline">INVITATION.LK</Link>
      </p>
    </footer>
  );

  const renderSection = (sectionId: string) => {
    switch (sectionId) {
      case "hero": return <HeroSection key="hero" />;
      case "countdown": return <CountdownSection key="countdown" />;
      case "story": return <StorySection key="story" />;
      case "events": return <EventsSection key="events" />;
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
