"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { Heart, MapPin, Mail, Phone, Camera, ChevronDown, Star, Sparkles, Moon } from "lucide-react";
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
    primaryColor: "#c4a35a",
    secondaryColor: "#1a2744",
    backgroundColor: "#0a0e1a",
    textColor: "#ffffff",
    accentColor: "#6366f1",
    fontFamily: "sans-serif",
  },
  sections: [...DEFAULT_SECTIONS],
  content: {
    hero: { subtitle: "Under the Stars", message: "Two souls, one eternal night of celebration" },
    story: { title: "Written in the Stars" },
    rsvp: { title: "Join Our Celebration", deadline: "Please respond by December 1, 2026" },
    footer: { message: "" },
  },
};

/* ── Animated starfield with shooting stars ── */
function StarField() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 80 }).map((_, i) => (
        <motion.div
          key={`star-${i}`}
          className="absolute rounded-full bg-white"
          style={{
            width: i % 5 === 0 ? 3 : i % 3 === 0 ? 2 : 1,
            height: i % 5 === 0 ? 3 : i % 3 === 0 ? 2 : 1,
            left: `${(i * 29 + 11) % 100}%`,
            top: `${(i * 17 + 3) % 100}%`,
          }}
          animate={{ opacity: [0.1, i % 3 === 0 ? 1 : 0.6, 0.1], scale: [1, i % 5 === 0 ? 1.5 : 1.2, 1] }}
          transition={{ duration: 2 + (i % 4), repeat: Infinity, delay: (i * 0.3) % 5 }}
        />
      ))}
      {[0, 1, 2].map((i) => (
        <motion.div key={`shoot-${i}`} className="absolute w-px h-px" style={{ left: `${20 + i * 30}%`, top: `${10 + i * 15}%` }}>
          <motion.div
            className="absolute w-24 h-px bg-gradient-to-l from-white via-white/50 to-transparent origin-right"
            style={{ rotate: `${30 + i * 10}deg` }}
            animate={{ x: [0, -300], y: [0, 200], opacity: [0, 1, 1, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 3 + i * 5, repeatDelay: 8 + i * 3 }}
          />
        </motion.div>
      ))}
      <motion.div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl"
        animate={{ background: [`radial-gradient(circle, ${withOpacity("#6366f1", 0.04)} 0%, transparent 70%)`, `radial-gradient(circle, ${withOpacity("#8b5cf6", 0.06)} 0%, transparent 70%)`, `radial-gradient(circle, ${withOpacity("#6366f1", 0.04)} 0%, transparent 70%)`] }}
        transition={{ duration: 8, repeat: Infinity }} />
      <motion.div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl"
        animate={{ background: [`radial-gradient(circle, ${withOpacity("#c4a35a", 0.04)} 0%, transparent 70%)`, `radial-gradient(circle, ${withOpacity("#c4a35a", 0.08)} 0%, transparent 70%)`, `radial-gradient(circle, ${withOpacity("#c4a35a", 0.04)} 0%, transparent 70%)`] }}
        transition={{ duration: 10, repeat: Infinity, delay: 2 }} />
    </div>
  );
}

/* ── Constellation connecting dots ── */
function Constellation({ color = "#c4a35a" }: { color?: string }) {
  const points = [{ x: 15, y: 20 }, { x: 25, y: 15 }, { x: 35, y: 22 }, { x: 30, y: 35 }, { x: 20, y: 30 }];
  return (
    <svg className="absolute top-10 right-10 w-60 h-60 opacity-20 hidden lg:block" viewBox="0 0 50 50">
      {points.map((p, i) => (
        <motion.circle key={i} cx={p.x} cy={p.y} r="0.8" fill={color} animate={{ opacity: [0.3, 1, 0.3], r: [0.6, 1, 0.6] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }} />
      ))}
      {points.map((p, i) => {
        const next = points[(i + 1) % points.length];
        return <motion.line key={`l-${i}`} x1={p.x} y1={p.y} x2={next.x} y2={next.y} stroke={color} strokeWidth="0.3" initial={{ pathLength: 0 }} animate={{ pathLength: 1, opacity: [0.1, 0.4, 0.1] }} transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }} />;
      })}
    </svg>
  );
}

export default function EternalNight({ data, config }: { data?: InvitationData; config?: TemplateConfig } = {}) {
  const merged = deepMerge(DEFAULT_CONFIG as Record<string, unknown>, (config || {}) as Record<string, unknown>) as TemplateConfig;
  const theme = merged.theme as ThemeConfig;
  const sections = (merged.sections || DEFAULT_SECTIONS).filter(s => s.visible).sort((a, b) => a.order - b.order);
  const content = merged.content || {};

  const groom = data?.groomName || "Nuwan";
  const bride = data?.brideName || "Chamari";
  const date = data?.weddingDate || "2026-12-31";
  const time = data?.weddingTime || "8:00 PM";
  const venue = data?.venue || "Vivanta Bentota";
  const venueAddr = data?.venueAddress || "National Holiday Resort, Bentota, Sri Lanka";
  const events = data?.events || [
    { title: "Guests Arrive", time: "6:00 PM", description: "Welcome cocktails and stargazing on the garden terrace" },
    { title: "Ceremony Under the Stars", time: "7:30 PM", description: "Exchange of vows in the moonlit garden with fairy lights" },
    { title: "Grand Dinner", time: "8:30 PM", description: "An exquisite five-course dinner paired with the finest wines" },
    { title: "Dancing & Celebrations", time: "10:30 PM", description: "Live band and DJ take us into the new year" },
    { title: "Midnight Fireworks", time: "12:00 AM", description: "Ring in 2027 with a spectacular fireworks display and champagne toast" },
  ];

  const dateObj = new Date(date + "T00:00:00");
  const formattedDate = dateObj.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  const storyItems = content.story?.items || [
    { year: "2023", title: "First Meeting", description: "Their love story began at a New Year's Eve rooftop party in Colombo, under a sky ablaze with fireworks." },
    { year: "2024", title: "Falling in Love", description: "He asked her to dance; she asked him his star sign. From that moment, they were inseparable." },
    { year: "2025", title: "The Proposal", description: "A surprise proposal on a starlit beach in Bentota." },
    { year: "2026", title: "The Wedding", description: "They will exchange vows under the same December sky." },
  ];

  const [rsvpSent, setRsvpSent] = useState(false);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.9]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const HeroSection = () => (
    <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 overflow-hidden">
      <StarField />
      <Constellation color={theme.primaryColor} />
      <motion.div style={{ scale: heroScale, opacity: heroOpacity }} className="relative z-10">
        <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ duration: 1.5, type: "spring" }}>
          <Moon className="w-10 h-10 mx-auto mb-8" style={{ color: theme.primaryColor }} />
        </motion.div>
        <motion.p className="tracking-[0.5em] uppercase text-xs mb-12" style={{ color: theme.primaryColor }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.5 }}>
          {content.hero?.subtitle || "Under the Stars"}
        </motion.p>
        <motion.h1 className="text-6xl sm:text-8xl lg:text-9xl font-extralight tracking-wider sm:tracking-widest leading-none mb-2" initial={{ opacity: 0, y: 50, filter: "blur(15px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 1.2, delay: 0.8 }}>{bride}</motion.h1>
        <motion.div className="flex items-center justify-center gap-6 my-5" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 1, delay: 1.2 }}>
          <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }}><Sparkles className="w-4 h-4" style={{ color: theme.primaryColor }} /></motion.div>
          <span className="text-3xl font-extralight" style={{ color: theme.primaryColor }}>&amp;</span>
          <motion.div animate={{ rotate: [360, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }}><Sparkles className="w-4 h-4" style={{ color: theme.primaryColor }} /></motion.div>
        </motion.div>
        <motion.h1 className="text-6xl sm:text-8xl lg:text-9xl font-extralight tracking-wider sm:tracking-widest leading-none" initial={{ opacity: 0, y: 50, filter: "blur(15px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 1.2, delay: 1 }}>{groom}</motion.h1>
        <motion.div className="mt-14 flex flex-col sm:flex-row items-center justify-center gap-4 text-sm" style={{ color: withOpacity(theme.primaryColor, 0.6) }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8 }}>
          <span>{formattedDate}</span>
          <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }}>
            <Star className="w-3 h-3 hidden sm:block" style={{ color: theme.primaryColor, fill: theme.primaryColor }} />
          </motion.div>
          <span>{venue}</span>
        </motion.div>
        <motion.p className="mt-6 text-sm italic" style={{ color: withOpacity(theme.textColor, 0.2) }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.2 }}>
          &quot;{content.hero?.message || "Two souls, one eternal night of celebration"}&quot;
        </motion.p>
      </motion.div>
      <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 2.5, repeat: Infinity }} className="absolute bottom-8 z-10">
        <ChevronDown className="w-6 h-6" style={{ color: withOpacity(theme.primaryColor, 0.3) }} />
      </motion.div>
    </section>
  );

  const CountdownSection = () => (
    <section className="relative py-24 text-center overflow-hidden" style={{ background: `linear-gradient(to bottom, ${theme.backgroundColor}, ${theme.secondaryColor}, ${theme.backgroundColor})` }}>
      <StarField />
      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="relative z-10">
        <p className="tracking-[0.4em] uppercase text-xs mb-10" style={{ color: theme.primaryColor }}>The Night Begins In</p>
        <Countdown
          targetDate={`${date}T20:00:00`}
          valueClassName="text-3xl sm:text-6xl font-extralight text-white"
          labelClassName="text-[10px] tracking-[0.3em] uppercase mt-3"
          labelStyle={{ color: withOpacity(theme.primaryColor, 0.5) }}
          boxClassName="flex flex-col items-center bg-white/[0.03] border border-white/5 rounded-xl sm:rounded-2xl px-3 sm:px-6 py-5 min-w-[60px] sm:min-w-[110px] backdrop-blur-sm"
          separatorClassName="text-xl sm:text-3xl font-extralight mx-1 self-start mt-3"
          separatorStyle={{ color: withOpacity(theme.primaryColor, 0.15) }}
        />
      </motion.div>
    </section>
  );

  const StorySection = () => (
    <section className="py-28 px-4 max-w-3xl mx-auto text-center relative">
      <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1 }}>
        <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 4, repeat: Infinity }}>
          <Star className="w-8 h-8 mx-auto mb-8" style={{ color: theme.primaryColor }} />
        </motion.div>
        <h2 className="text-4xl sm:text-5xl font-extralight mb-10">{content.story?.title || "Written in the Stars"}</h2>
        {storyItems.map((item, i) => (
          <motion.p key={i} className="text-lg leading-loose mb-8" style={{ color: withOpacity(theme.textColor, 0.35) }} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.2 }}>
            <span className="font-semibold" style={{ color: theme.primaryColor }}>{item.year} - {item.title}:</span> {item.description}
          </motion.p>
        ))}
      </motion.div>
    </section>
  );

  const EventsSection = () => (
    <section className="relative py-28 px-4 overflow-hidden" style={{ backgroundColor: withOpacity(theme.secondaryColor, 0.8) }}>
      <StarField />
      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
          <p className="tracking-[0.4em] uppercase text-xs mb-4" style={{ color: theme.primaryColor }}>Program</p>
          <h2 className="text-4xl sm:text-5xl font-extralight">Evening Schedule</h2>
        </motion.div>
        <div className="space-y-6">
          {events.map((event, i) => {
            const icons = [Star, Moon, Sparkles, Heart, Star];
            const EventIcon = icons[i % icons.length];
            return (
              <motion.div key={i} initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.1 }}
                whileHover={{ borderColor: withOpacity(theme.primaryColor, 0.3), boxShadow: `0 0 40px ${withOpacity(theme.primaryColor, 0.05)}`, x: 8 }}
                className="flex items-start gap-6 p-6 rounded-2xl border border-white/5 bg-white/[0.02] transition-all cursor-default">
                <motion.div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: withOpacity(theme.primaryColor, 0.1) }} whileHover={{ rotate: 12, scale: 1.1 }}>
                  <EventIcon className="w-5 h-5" style={{ color: theme.primaryColor }} />
                </motion.div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-sm font-medium" style={{ color: theme.primaryColor }}>{event.time}</span>
                    <div className="w-8 h-px" style={{ backgroundColor: withOpacity(theme.primaryColor, 0.2) }} />
                  </div>
                  <h3 className="font-medium text-lg mb-1">{event.title}</h3>
                  <p className="text-sm" style={{ color: withOpacity(theme.textColor, 0.25) }}>{event.description}</p>
                </div>
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
          <p className="tracking-[0.4em] uppercase text-xs mb-4" style={{ color: theme.primaryColor }}>Gallery</p>
          <h2 className="text-4xl sm:text-5xl font-extralight">Starlit Moments</h2>
        </motion.div>
        {content.gallery?.images?.length ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {content.gallery.images.map((src: string, i: number) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.1 }} whileHover={{ scale: 1.05, zIndex: 10 }} className="rounded-2xl overflow-hidden aspect-[4/3]">
                <img src={src} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover" />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.1 }} whileHover={{ scale: 1.05, zIndex: 10 }}
                className={`${i === 0 || i === 5 ? "md:col-span-2 h-64" : "h-56"} rounded-2xl flex items-center justify-center border border-white/5 cursor-pointer group relative overflow-hidden`}
                style={{ background: `linear-gradient(to bottom right, ${theme.secondaryColor}, ${theme.backgroundColor})` }}>
                <Camera className="w-6 h-6 group-hover:opacity-60 transition-colors" style={{ color: withOpacity(theme.primaryColor, 0.15) }} />
                <div className="absolute inset-0 group-hover:opacity-100 opacity-0 transition-opacity" style={{ backgroundColor: withOpacity(theme.primaryColor, 0.05) }} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );

  const VenueSection = () => (
    <section className="py-28 px-4" style={{ backgroundColor: withOpacity(theme.secondaryColor, 0.8) }}>
      <div className="max-w-4xl mx-auto text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="tracking-[0.4em] uppercase text-xs mb-4" style={{ color: theme.primaryColor }}>Venue</p>
          <h2 className="text-4xl sm:text-5xl font-extralight mb-2">{venue}</h2>
          <p className="mb-10" style={{ color: withOpacity(theme.textColor, 0.25) }}>{venueAddr}</p>
          {(content.venue?.mapUrl || venue || venueAddr) ? (
            <iframe
              src={`https://maps.google.com/maps?q=${encodeURIComponent(content.venue?.mapUrl && content.venue.mapUrl.includes("google") ? content.venue.mapUrl : [venue, venueAddr].filter(Boolean).join(", "))}&output=embed`}
              className="w-full h-64 rounded-2xl border-0" loading="lazy" allowFullScreen title="Wedding Venue Map"
            />
          ) : (
            <div className="rounded-2xl h-72 sm:h-80 flex items-center justify-center border border-white/5" style={{ background: `linear-gradient(to bottom right, ${theme.secondaryColor}, ${theme.backgroundColor})` }}>
              <MapPin className="w-10 h-10" style={{ color: withOpacity(theme.primaryColor, 0.15) }} />
            </div>
          )}
          {content.venue?.mapUrl && (
            <a href={content.venue.mapUrl.startsWith("http") ? content.venue.mapUrl : `https://maps.google.com/maps?q=${encodeURIComponent(content.venue.mapUrl)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full text-sm" style={{ color: theme.primaryColor, border: `1px solid ${withOpacity(theme.primaryColor, 0.3)}` }}>
              <MapPin className="w-4 h-4" /> Open in Google Maps
            </a>
          )}
          <motion.div whileHover={{ borderColor: withOpacity(theme.primaryColor, 0.3) }} className="mt-8 rounded-xl p-6 inline-block transition-colors" style={{ borderWidth: 1, borderStyle: "solid", borderColor: withOpacity(theme.primaryColor, 0.1) }}>
            <p className="text-sm mb-1" style={{ color: withOpacity(theme.textColor, 0.3) }}>Dress Code</p>
            <p className="font-medium text-lg" style={{ color: theme.primaryColor }}>Black Tie &middot; Celestial Glamour</p>
          </motion.div>
          <SecondaryVenue second={content.venue?.second} primaryColor={theme.primaryColor} secondaryColor={theme.secondaryColor} accentColor={theme.accentColor} />
        </motion.div>
      </div>
    </section>
  );

  const RsvpSection = () => (
    <section className="relative py-28 px-4 overflow-hidden">
      <StarField />
      <div className="max-w-lg mx-auto text-center relative z-10">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity }}>
            <Moon className="w-10 h-10 mx-auto mb-8" style={{ color: theme.primaryColor }} />
          </motion.div>
          <h2 className="text-4xl sm:text-5xl font-extralight mb-4">{content.rsvp?.title || "Join Our Celebration"}</h2>
          <p className="text-sm mb-12" style={{ color: withOpacity(theme.textColor, 0.25) }}>{content.rsvp?.deadline || "Please respond by December 1, 2026"}</p>
          {rsvpSent ? (
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="rounded-2xl p-10 backdrop-blur-sm" style={{ borderWidth: 1, borderStyle: "solid", borderColor: withOpacity(theme.primaryColor, 0.2), backgroundColor: withOpacity(theme.primaryColor, 0.05) }}>
              <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }}><Sparkles className="w-12 h-12 mx-auto mb-4" style={{ color: theme.primaryColor }} /></motion.div>
              <p className="text-2xl font-extralight">Thank you!</p>
              <p className="mt-2" style={{ color: withOpacity(theme.textColor, 0.25) }}>See you under the stars.</p>
            </motion.div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); setRsvpSent(true); }} className="space-y-4">
              <input type="text" placeholder="Full Name" required className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/25 focus:outline-none text-sm backdrop-blur-sm transition-colors" />
              <input type="email" placeholder="Email Address" className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/25 focus:outline-none text-sm backdrop-blur-sm transition-colors" />
              <select className="w-full px-5 py-4 border border-white/10 rounded-xl text-white/50 focus:outline-none text-sm transition-colors" style={{ backgroundColor: theme.backgroundColor }}>
                <option value="">Will you attend?</option>
                <option value="yes">Wouldn&apos;t miss it!</option>
                <option value="no">Unfortunately, no</option>
              </select>
              <input type="number" min="1" max="4" placeholder="Number of guests" className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/25 focus:outline-none text-sm backdrop-blur-sm transition-colors" />
              <textarea placeholder="Song request or message..." rows={3} className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/25 focus:outline-none text-sm resize-none backdrop-blur-sm transition-colors" />
              <motion.button type="submit" whileHover={{ scale: 1.02, boxShadow: `0 0 40px ${withOpacity(theme.primaryColor, 0.2)}` }} whileTap={{ scale: 0.98 }}
                className="w-full py-4 rounded-xl font-semibold transition-all" style={{ background: `linear-gradient(to right, ${theme.primaryColor}, ${withOpacity(theme.primaryColor, 0.8)})`, color: theme.backgroundColor }}>
                Send RSVP
              </motion.button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );

  const FooterSection = () => (
    <footer className="py-14 text-center border-t border-white/5 px-4">
      <div className="flex items-center justify-center gap-3 mb-4">
        <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity }}><Star className="w-3 h-3" style={{ color: theme.primaryColor, fill: theme.primaryColor }} /></motion.div>
        <Moon className="w-5 h-5" style={{ color: theme.primaryColor }} />
        <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity, delay: 1 }}><Star className="w-3 h-3" style={{ color: theme.primaryColor, fill: theme.primaryColor }} /></motion.div>
      </div>
      <p className="font-extralight text-xl">{bride} & {groom}</p>
      <p className="text-sm mt-2" style={{ color: withOpacity(theme.textColor, 0.15) }}>{formattedDate} &middot; {venue}</p>
      <div className="flex justify-center gap-4 mt-6 mb-6">
        {[Phone, Mail].map((Icon, i) => (
          <motion.div key={i} whileHover={{ scale: 1.15, borderColor: withOpacity(theme.primaryColor, 0.4) }} className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center cursor-pointer transition-colors">
            <Icon className="w-4 h-4" style={{ color: withOpacity(theme.primaryColor, 0.4) }} />
          </motion.div>
        ))}
      </div>
      <p className="text-xs" style={{ color: withOpacity(theme.textColor, 0.1) }}>
        Created with <Heart className="w-3 h-3 inline" style={{ color: withOpacity(theme.primaryColor, 0.4) }} /> by{" "}
        <Link href="/" style={{ color: withOpacity(theme.primaryColor, 0.3) }} className="hover:opacity-60 transition-colors">INVITATION.LK</Link>
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
