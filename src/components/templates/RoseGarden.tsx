"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Heart, MapPin, Mail, Phone, Camera, ChevronDown, Calendar as CalendarIcon, Clock, Music, Utensils, GlassWater } from "lucide-react";
import Link from "next/link";
import Countdown from "./shared/Countdown";
import { useState, useRef } from "react";
import type { InvitationData } from "@/types/invitation";
import { deepMerge } from "@/lib/deep-merge";
import { withOpacity } from "@/lib/with-opacity";
import type { TemplateConfig, ThemeConfig } from "@/types/template-config";
import { DEFAULT_SECTIONS } from "@/types/template-config";

export const DEFAULT_CONFIG: TemplateConfig = {
  theme: {
    primaryColor: "#e11d48",
    secondaryColor: "#be123c",
    backgroundColor: "#fff5f5",
    textColor: "#1f2937",
    accentColor: "#f43f5e",
    fontFamily: "serif",
  },
  sections: [...DEFAULT_SECTIONS],
  content: {
    hero: { subtitle: "Homecoming", message: "Request the pleasure of the company of" },
    story: { title: "Our Love Story" },
    rsvp: { title: "RSVP", deadline: "Kindly respond by October 20, 2026" },
    footer: { message: "" },
  },
};

/* ── CSS Rose decoration ── */
function CSSRose({ size = 60, className = "", color = "#e11d48" }: { size?: number; className?: string; color?: string }) {
  const petalSize = size * 0.4;
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
        <div key={i} className="absolute rounded-full" style={{
          width: petalSize, height: petalSize * 1.3,
          background: i % 2 === 0 ? `radial-gradient(ellipse, ${color} 0%, ${withOpacity(color, 0.7)} 60%, ${withOpacity(color, 0.4)} 100%)` : `radial-gradient(ellipse, ${withOpacity(color, 0.9)} 0%, ${color} 60%, ${withOpacity(color, 0.7)} 100%)`,
          top: "50%", left: "50%",
          transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-${size * 0.18}px)`,
          borderRadius: "50% 50% 50% 50%", opacity: 0.85,
        }} />
      ))}
      <div className="absolute rounded-full" style={{ width: size * 0.25, height: size * 0.25, background: `radial-gradient(circle, ${withOpacity(color, 0.5)}, ${color})`, top: "50%", left: "50%", transform: "translate(-50%, -50%)" }} />
    </div>
  );
}

/* ── Floating rose petals animation ── */
function FloatingPetals({ color = "#e11d48" }: { color?: string }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 10 }).map((_, i) => {
        const size = 8 + (i % 4) * 4;
        return (
          <motion.div key={i} className="absolute" style={{ left: `${(i * 31 + 5) % 100}%`, top: -20, width: size, height: size * 0.7, background: withOpacity(color, 0.1 + (i % 3) * 0.05), borderRadius: "50% 50% 50% 0" }}
            animate={{ y: [0, 800 + i * 20], x: [0, Math.sin(i * 0.8) * 80, Math.cos(i) * 50], rotate: [0, 360 * (i % 2 === 0 ? 1 : -1)], opacity: [0, 0.6, 0.4, 0] }}
            transition={{ duration: 14 + i * 1.2, repeat: Infinity, delay: i * 0.9, ease: "easeIn" }} />
        );
      })}
    </div>
  );
}

/* ── Decorative vine/stem line ── */
function VineDivider({ color = "#fb7185" }: { color?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 my-6">
      <svg width="80" height="20" viewBox="0 0 80 20" style={{ color }}>
        <path d="M0 10 Q20 0 40 10 Q60 20 80 10" fill="none" stroke="currentColor" strokeWidth="1" />
        <circle cx="20" cy="5" r="2" fill="currentColor" opacity="0.5" />
        <circle cx="60" cy="15" r="2" fill="currentColor" opacity="0.5" />
      </svg>
      <Heart className="w-3 h-3" style={{ color, fill: color }} />
      <svg width="80" height="20" viewBox="0 0 80 20" className="scale-x-[-1]" style={{ color }}>
        <path d="M0 10 Q20 0 40 10 Q60 20 80 10" fill="none" stroke="currentColor" strokeWidth="1" />
        <circle cx="20" cy="5" r="2" fill="currentColor" opacity="0.5" />
        <circle cx="60" cy="15" r="2" fill="currentColor" opacity="0.5" />
      </svg>
    </div>
  );
}

/* ── Rose Corner decoration ── */
function RoseCorner({ position, color = "#be123c" }: { position: "top-right" | "bottom-left" | "top-left" | "bottom-right"; color?: string }) {
  const posClass = { "top-right": "top-0 right-0", "bottom-left": "bottom-0 left-0 rotate-180", "top-left": "top-0 left-0 scale-x-[-1]", "bottom-right": "bottom-0 right-0 rotate-180 scale-x-[-1]" }[position];
  return (
    <div className={`absolute ${posClass} w-28 h-28 sm:w-48 sm:h-48 pointer-events-none`}>
      <svg viewBox="0 0 200 200" className="w-full h-full">
        <circle cx="160" cy="40" r="30" fill={color} opacity="0.3" />
        <circle cx="160" cy="40" r="20" fill={withOpacity(color, 0.8)} opacity="0.25" />
        <circle cx="160" cy="40" r="10" fill={withOpacity(color, 0.5)} opacity="0.3" />
        <circle cx="125" cy="65" r="20" fill={color} opacity="0.25" />
        <circle cx="125" cy="65" r="12" fill={withOpacity(color, 0.5)} opacity="0.2" />
        <circle cx="175" cy="75" r="15" fill={color} opacity="0.2" />
        <ellipse cx="140" cy="45" rx="8" ry="16" fill="#166534" opacity="0.2" transform="rotate(-30 140 45)" />
        <ellipse cx="180" cy="55" rx="6" ry="13" fill="#166534" opacity="0.15" transform="rotate(20 180 55)" />
        <path d="M160 70 Q150 100 120 120" fill="none" stroke="#166534" strokeWidth="1" opacity="0.15" />
      </svg>
    </div>
  );
}

/* ── Mini Calendar ── */
function MiniCalendar({ dateObj, color = "#e11d48" }: { dateObj: Date; color?: string }) {
  const month = dateObj.toLocaleDateString("en-US", { month: "long" });
  const year = dateObj.getFullYear();
  const highlightDay = dateObj.getDate();
  const days = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  const firstDay = new Date(year, dateObj.getMonth(), 1).getDay();
  const daysInMonth = new Date(year, dateObj.getMonth() + 1, 0).getDate();

  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="bg-white rounded-2xl p-6 shadow-lg inline-block" style={{ borderWidth: 1, borderStyle: "solid", borderColor: withOpacity(color, 0.15) }}>
      <div className="flex items-center justify-center gap-2 mb-4">
        <CalendarIcon className="w-4 h-4" style={{ color }} />
        <p className="text-center font-bold" style={{ color }}>{month} {year}</p>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {days.map((d) => <div key={d} className="font-semibold py-1" style={{ color: withOpacity("#000", 0.5) }}>{d}</div>)}
        {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const isHighlight = day === highlightDay;
          return (
            <motion.div key={day} whileHover={isHighlight ? { scale: 1.2 } : {}}
              className={`py-1 rounded-lg text-xs ${isHighlight ? "text-white font-bold shadow-md" : "hover:bg-rose-50"}`}
              style={isHighlight ? { backgroundColor: color, color: "#fff", boxShadow: `0 4px 15px ${withOpacity(color, 0.3)}` } : { color: withOpacity("#000", 0.6) }}>
              {isHighlight ? <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}><Heart className="w-3 h-3 mx-auto fill-white" /></motion.div> : day}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

export default function RoseGarden({ data, config }: { data?: InvitationData; config?: TemplateConfig } = {}) {
  const merged = deepMerge(DEFAULT_CONFIG as Record<string, unknown>, (config || {}) as Record<string, unknown>) as TemplateConfig;
  const theme = merged.theme as ThemeConfig;
  const sections = (merged.sections || DEFAULT_SECTIONS).filter(s => s.visible).sort((a, b) => a.order - b.order);
  const content = merged.content || {};

  const groom = data?.groomName || "Susantha";
  const bride = data?.brideName || "Nadee";
  const date = data?.weddingDate || "2026-11-05";
  const time = data?.weddingTime || "6:00 PM";
  const venue = data?.venue || "583, Singharupagama, Bentota";
  const venueAddr = data?.venueAddress || "Southern Province, Sri Lanka";
  const events = data?.events || [
    { title: "Welcome Drinks", time: "6:00 PM", description: "Arrival and welcome cocktails" },
    { title: "Dinner", time: "7:00 PM", description: "Elegant sit-down dinner" },
    { title: "Entertainment", time: "8:30 PM", description: "Live music and performances" },
    { title: "Dance Floor", time: "10:00 PM", description: "Dancing under the stars" },
  ];

  const dateObj = new Date(date + "T00:00:00");
  const formattedDate = dateObj.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  const storyItems = content.story?.items || [
    { year: "2020", title: "First Meeting", description: "In the warm glow of a December evening, Susantha first caught a glimpse of Nadee at a mutual friend's gathering." },
    { year: "2022", title: "Falling in Love", description: "What started as stolen glances blossomed into deep conversations under starlit skies." },
    { year: "2025", title: "The Proposal", description: "Through seasons of joy and growth, their love only grew stronger." },
    { year: "2026", title: "The Wedding", description: "Leading them to this beautiful chapter of their lives together." },
  ];

  const [rsvpSent, setRsvpSent] = useState(false);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.6], [1, 0.95]);

  const HeroSection = () => (
    <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 overflow-hidden">
      <RoseCorner position="top-right" color={theme.secondaryColor} />
      <RoseCorner position="bottom-left" color={theme.secondaryColor} />
      <RoseCorner position="top-left" color={theme.secondaryColor} />
      <RoseCorner position="bottom-right" color={theme.secondaryColor} />
      <FloatingPetals color={theme.accentColor} />
      <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, ${withOpacity(theme.accentColor, 0.05)}, ${theme.backgroundColor}, ${withOpacity(theme.accentColor, 0.03)})` }} />
      <div className="absolute inset-6 sm:inset-10 pointer-events-none rounded-lg" style={{ borderWidth: 1, borderStyle: "solid", borderColor: withOpacity(theme.accentColor, 0.15) }} />
      <div className="absolute inset-8 sm:inset-12 pointer-events-none rounded-lg" style={{ borderWidth: 1, borderStyle: "solid", borderColor: withOpacity(theme.accentColor, 0.1) }} />

      <motion.div style={{ opacity: heroOpacity, scale: heroScale }} className="relative z-10 max-w-xl">
        <motion.div className="flex justify-center mb-6" initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, type: "spring" }}>
          <CSSRose size={50} color={theme.accentColor} />
        </motion.div>
        <motion.h2 className="text-3xl sm:text-4xl font-bold mb-2" style={{ color: theme.primaryColor, fontFamily: "'Dancing Script', cursive, serif" }} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          {content.hero?.subtitle || "Homecoming"}
        </motion.h2>
        <VineDivider color={withOpacity(theme.accentColor, 0.6)} />
        <motion.p className="text-sm mb-6" style={{ color: withOpacity(theme.textColor, 0.5) }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          {content.hero?.message || "Request the pleasure of the company of"}
        </motion.p>
        <motion.p className="text-sm mb-6" style={{ color: withOpacity(theme.textColor, 0.5) }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
          Mr. &amp; Mrs. / Mr./Mrs./Miss. ........................
        </motion.p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-8 mb-6">
          <motion.h1 className="text-4xl sm:text-6xl font-bold" style={{ color: theme.primaryColor, fontFamily: "'Dancing Script', cursive, serif" }} initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5, duration: 0.8 }}>{groom}</motion.h1>
          <motion.div className="relative" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.7 }}>
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center shadow-lg" style={{ background: `linear-gradient(to bottom right, ${withOpacity(theme.accentColor, 0.15)}, ${withOpacity(theme.accentColor, 0.3)})`, boxShadow: `0 4px 15px ${withOpacity(theme.accentColor, 0.2)}` }}>
              <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
                <Heart className="w-5 h-5 sm:w-7 sm:h-7" style={{ color: theme.accentColor, fill: theme.accentColor }} />
              </motion.div>
            </div>
          </motion.div>
          <motion.h1 className="text-4xl sm:text-6xl font-bold" style={{ color: theme.primaryColor, fontFamily: "'Dancing Script', cursive, serif" }} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5, duration: 0.8 }}>{bride}</motion.h1>
        </div>

        <motion.p className="text-sm mb-8" style={{ color: withOpacity(theme.textColor, 0.6) }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
          On the occasion of our Homecoming Function
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }} className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <div className="text-center bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm" style={{ borderWidth: 1, borderStyle: "solid", borderColor: withOpacity(theme.accentColor, 0.15) }}>
            <Clock className="w-4 h-4 mx-auto mb-2" style={{ color: theme.accentColor }} />
            <p className="text-sm font-medium mb-1" style={{ color: theme.accentColor }}>From</p>
            <p className="text-lg font-bold" style={{ color: theme.textColor }}>{time}</p>
          </div>
          <MiniCalendar dateObj={dateObj} color={theme.primaryColor} />
          <div className="text-center bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm" style={{ borderWidth: 1, borderStyle: "solid", borderColor: withOpacity(theme.accentColor, 0.15) }}>
            <MapPin className="w-4 h-4 mx-auto mb-2" style={{ color: theme.accentColor }} />
            <p className="text-sm font-medium mb-1" style={{ color: theme.accentColor }}>At</p>
            <p className="text-sm" style={{ color: theme.textColor }}>{venue}</p>
          </div>
        </motion.div>
      </motion.div>
      <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }} className="absolute bottom-8 z-10">
        <ChevronDown className="w-6 h-6" style={{ color: theme.accentColor }} />
      </motion.div>
    </section>
  );

  const CountdownSection = () => (
    <section className="relative py-24 text-white text-center overflow-hidden" style={{ background: `linear-gradient(to right, ${theme.primaryColor}, ${theme.secondaryColor}, ${theme.accentColor})` }}>
      <FloatingPetals color={theme.accentColor} />
      <div className="relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 2, repeat: Infinity }} className="mb-6">
            <Heart className="w-8 h-8 mx-auto" style={{ color: withOpacity("#ffffff", 0.6), fill: withOpacity("#ffffff", 0.6) }} />
          </motion.div>
          <p className="tracking-[0.3em] uppercase text-xs mb-2" style={{ color: withOpacity("#ffffff", 0.7) }}>The Celebration Begins In</p>
          <p className="text-2xl font-light mb-8 text-white/90">{formattedDate}</p>
          <Countdown targetDate={`${date}T18:00:00`} valueClassName="text-4xl sm:text-5xl font-light text-white"
            labelClassName="text-[10px] tracking-wider uppercase mt-2" labelStyle={{ color: withOpacity("#ffffff", 0.6) }}
            boxClassName="flex flex-col items-center bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl px-2 sm:px-6 py-3 sm:py-4 min-w-[55px] sm:min-w-[90px]"
            separatorClassName="text-xl sm:text-3xl font-light text-white/20 mx-1 self-start mt-2" />
        </motion.div>
      </div>
    </section>
  );

  const StorySection = () => (
    <section className="py-28 px-4 relative">
      <div className="max-w-2xl mx-auto text-center">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <p className="tracking-[0.3em] uppercase text-xs mb-4" style={{ color: theme.accentColor }}>{content.story?.title || "Our Love Story"}</p>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: theme.primaryColor, fontFamily: "'Dancing Script', cursive, serif" }}>How We Met</h2>
          <VineDivider color={withOpacity(theme.accentColor, 0.6)} />
          {storyItems.map((item, i) => (
            <motion.p key={i} className="text-lg leading-loose mb-6" style={{ color: withOpacity(theme.textColor, 0.6) }} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: i * 0.2 }}>
              <span className="font-semibold" style={{ color: theme.primaryColor }}>{item.year}:</span> {item.description}
            </motion.p>
          ))}
        </motion.div>
        <div className="absolute top-20 left-4 opacity-20"><CSSRose size={40} color={theme.accentColor} /></div>
        <div className="absolute bottom-20 right-4 opacity-20"><CSSRose size={35} color={theme.accentColor} /></div>
      </div>
    </section>
  );

  const EventsSection = () => (
    <section className="py-28 px-4" style={{ background: `linear-gradient(to bottom, ${withOpacity(theme.accentColor, 0.03)}, ${theme.backgroundColor})` }}>
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
          <p className="tracking-[0.3em] uppercase text-xs mb-4" style={{ color: theme.accentColor }}>Celebration</p>
          <h2 className="text-3xl sm:text-4xl font-bold" style={{ color: theme.primaryColor, fontFamily: "'Dancing Script', cursive, serif" }}>Evening Programme</h2>
          <VineDivider color={withOpacity(theme.accentColor, 0.6)} />
        </motion.div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {events.map((event, i) => {
            const icons = [GlassWater, Utensils, Music, Heart];
            const EventIcon = icons[i % icons.length];
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.6 }}
                whileHover={{ y: -6, boxShadow: `0 20px 40px -12px ${withOpacity(theme.secondaryColor, 0.12)}` }}
                className="bg-white rounded-2xl p-6 text-center shadow-sm transition-all" style={{ borderWidth: 1, borderStyle: "solid", borderColor: withOpacity(theme.accentColor, 0.15) }}>
                <motion.div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: withOpacity(theme.accentColor, 0.08) }} whileHover={{ rotate: 12, scale: 1.1 }}>
                  <EventIcon className="w-6 h-6" style={{ color: theme.accentColor }} />
                </motion.div>
                <p className="text-sm font-semibold mb-1" style={{ color: theme.accentColor }}>{event.time}</p>
                <h3 className="font-bold text-lg mb-2" style={{ color: theme.textColor }}>{event.title}</h3>
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
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-14">
          <p className="tracking-[0.3em] uppercase text-xs mb-4" style={{ color: theme.accentColor }}>Gallery</p>
          <h2 className="text-3xl sm:text-4xl font-bold mb-2" style={{ color: theme.primaryColor, fontFamily: "'Dancing Script', cursive, serif" }}>Our Moments</h2>
          <VineDivider color={withOpacity(theme.accentColor, 0.6)} />
        </motion.div>
        {content.gallery?.images?.length ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {content.gallery.images.map((src: string, i: number) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} whileHover={{ scale: 1.03, zIndex: 10 }} className="rounded-2xl overflow-hidden aspect-[4/3]">
                <img src={src} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover" />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} whileHover={{ scale: 1.03, zIndex: 10 }}
                className={`${i === 0 || i === 5 ? "row-span-2" : ""} rounded-2xl min-h-[140px] flex items-center justify-center cursor-pointer group relative overflow-hidden`}
                style={{ background: `linear-gradient(to bottom right, ${withOpacity(theme.accentColor, 0.1)}, ${withOpacity(theme.primaryColor, 0.05)})`, borderWidth: 1, borderStyle: "solid", borderColor: withOpacity(theme.accentColor, 0.15) }}>
                <Camera className="w-6 h-6 group-hover:opacity-70 transition-colors" style={{ color: withOpacity(theme.accentColor, 0.3) }} />
                <div className="absolute inset-0 group-hover:opacity-100 opacity-0 transition-opacity" style={{ backgroundColor: withOpacity(theme.accentColor, 0.05) }} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );

  const VenueSection = () => (
    <section className="py-28 px-4" style={{ backgroundColor: withOpacity(theme.accentColor, 0.03) }}>
      <div className="max-w-3xl mx-auto text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="tracking-[0.3em] uppercase text-xs mb-4" style={{ color: theme.accentColor }}>Location</p>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: theme.primaryColor, fontFamily: "'Dancing Script', cursive, serif" }}>Venue</h2>
          <VineDivider color={withOpacity(theme.accentColor, 0.6)} />
          <div className="flex items-center justify-center gap-2 mb-2 mt-6">
            <MapPin className="w-5 h-5" style={{ color: theme.accentColor }} />
            <h3 className="text-xl font-semibold" style={{ color: theme.textColor }}>{venue}</h3>
          </div>
          <p className="mb-8" style={{ color: withOpacity(theme.textColor, 0.5) }}>{venueAddr}</p>
          {(content.venue?.mapUrl || venue || venueAddr) ? (
            <iframe src={`https://maps.google.com/maps?q=${encodeURIComponent(content.venue?.mapUrl && content.venue.mapUrl.includes("google") ? content.venue.mapUrl : [venue, venueAddr].filter(Boolean).join(", "))}&output=embed`}
              className="w-full h-64 sm:h-72 rounded-2xl border-0" loading="lazy" allowFullScreen title="Wedding Venue Map" />
          ) : (
            <div className="rounded-2xl h-64 sm:h-72 flex items-center justify-center shadow-inner" style={{ background: `linear-gradient(to bottom right, ${withOpacity(theme.accentColor, 0.08)}, ${withOpacity(theme.primaryColor, 0.05)})`, borderWidth: 1, borderStyle: "solid", borderColor: withOpacity(theme.accentColor, 0.2) }}>
              <MapPin className="w-10 h-10" style={{ color: withOpacity(theme.accentColor, 0.3) }} />
            </div>
          )}
          {content.venue?.mapUrl && (
            <a href={content.venue.mapUrl.startsWith("http") ? content.venue.mapUrl : `https://maps.google.com/maps?q=${encodeURIComponent(content.venue.mapUrl)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full text-sm" style={{ color: theme.accentColor, border: `1px solid ${withOpacity(theme.accentColor, 0.3)}` }}>
              <MapPin className="w-4 h-4" /> Open in Google Maps
            </a>
          )}
          <motion.div whileHover={{ y: -2 }} className="mt-8 bg-white rounded-xl p-5 inline-block shadow-sm" style={{ borderWidth: 1, borderStyle: "solid", borderColor: withOpacity(theme.accentColor, 0.15) }}>
            <p className="text-sm mb-1" style={{ color: withOpacity(theme.textColor, 0.5) }}>Dress Code</p>
            <p className="font-medium text-lg" style={{ color: theme.primaryColor }}>Semi-Formal &middot; Evening Attire</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );

  const RsvpSection = () => (
    <section className="relative py-28 text-white px-4 overflow-hidden" style={{ background: `linear-gradient(to bottom, ${theme.primaryColor}, ${theme.secondaryColor}, ${theme.accentColor})` }}>
      <FloatingPetals color={theme.accentColor} />
      <div className="max-w-md mx-auto text-center relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 2, repeat: Infinity }}>
            <Heart className="w-8 h-8 mx-auto mb-6" style={{ color: withOpacity("#ffffff", 0.6), fill: withOpacity("#ffffff", 0.6) }} />
          </motion.div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-2" style={{ fontFamily: "'Dancing Script', cursive, serif" }}>{content.rsvp?.title || "RSVP"}</h2>
          <p className="text-sm mb-10" style={{ color: withOpacity("#ffffff", 0.7) }}>{content.rsvp?.deadline || "Kindly respond by October 20, 2026"}</p>
          {rsvpSent ? (
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white/10 rounded-2xl p-10 backdrop-blur-sm border border-white/10">
              <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
                <Heart className="w-14 h-14 mx-auto mb-4" style={{ color: withOpacity("#ffffff", 0.7), fill: withOpacity("#ffffff", 0.7) }} />
              </motion.div>
              <p className="text-2xl font-light">Thank you!</p>
              <p className="mt-2 text-sm" style={{ color: withOpacity("#ffffff", 0.7) }}>We look forward to celebrating with you.</p>
            </motion.div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); setRsvpSent(true); }} className="space-y-4">
              <input type="text" placeholder="Full Name" required className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/50 focus:outline-none focus:border-white/50 text-sm backdrop-blur-sm transition-all" />
              <input type="tel" placeholder="Phone Number" className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/50 focus:outline-none focus:border-white/50 text-sm backdrop-blur-sm transition-all" />
              <select className="w-full px-5 py-4 border border-white/20 rounded-xl text-white focus:outline-none focus:border-white/50 text-sm" style={{ backgroundColor: theme.accentColor }}>
                <option value="">Will you attend?</option>
                <option value="yes">Yes, I&apos;ll be there!</option>
                <option value="no">Sorry, can&apos;t make it</option>
              </select>
              <input type="number" min="1" max="10" placeholder="Number of guests" className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/50 focus:outline-none focus:border-white/50 text-sm backdrop-blur-sm transition-all" />
              <textarea placeholder="Any message for the couple..." rows={3} className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/50 focus:outline-none focus:border-white/50 text-sm resize-none backdrop-blur-sm transition-all" />
              <motion.button type="submit" whileHover={{ scale: 1.02, boxShadow: "0 8px 30px rgba(255,255,255,0.15)" }} whileTap={{ scale: 0.98 }} className="w-full py-4 rounded-xl font-semibold shadow-lg" style={{ backgroundColor: "#ffffff", color: theme.primaryColor }}>
                Send RSVP
              </motion.button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );

  const FooterSection = () => (
    <footer className="py-16 text-center px-4" style={{ backgroundColor: theme.backgroundColor }}>
      <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
        <CSSRose size={40} className="mx-auto mb-4" color={theme.accentColor} />
        <p className="text-2xl font-bold" style={{ color: theme.primaryColor, fontFamily: "'Dancing Script', cursive, serif" }}>{groom} & {bride}</p>
        <p className="text-sm mt-2" style={{ color: withOpacity(theme.textColor, 0.5) }}>{formattedDate} &middot; {venue}</p>
        <VineDivider color={withOpacity(theme.accentColor, 0.6)} />
        <div className="flex justify-center gap-3 mt-4 mb-6">
          {[Phone, Mail].map((Icon, i) => (
            <motion.div key={i} whileHover={{ scale: 1.15 }} className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-colors" style={{ borderWidth: 1, borderStyle: "solid", borderColor: withOpacity(theme.accentColor, 0.2) }}>
              <Icon className="w-4 h-4" style={{ color: theme.accentColor }} />
            </motion.div>
          ))}
        </div>
        <p className="text-xs" style={{ color: withOpacity(theme.textColor, 0.4) }}>
          Created with <Heart className="w-3 h-3 inline" style={{ color: theme.accentColor, fill: theme.accentColor }} /> by{" "}
          <Link href="/" style={{ color: theme.accentColor }} className="hover:underline">INVITATION.LK</Link>
        </p>
      </motion.div>
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
