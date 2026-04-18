"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { Heart, MapPin, Mail, Phone, Camera, ChevronDown, Flame } from "lucide-react";
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
    primaryColor: "#d4a853",
    secondaryColor: "#1a0a0a",
    backgroundColor: "#1a0a0a",
    textColor: "#f5e6d3",
    accentColor: "#e8a838",
    fontFamily: "serif",
  },
  sections: [...DEFAULT_SECTIONS],
  content: {
    hero: { subtitle: "Shubh Vivah", message: "Cordially invite you to celebrate their sacred union" },
    story: { title: "Our Story" },
    rsvp: { title: "Honour Us With Your Presence", deadline: "Please respond by September 10, 2026" },
    footer: { message: "" },
  },
};

/* ── Rotating SVG Mandala ── */
function Mandala({ size = 500, className = "", color = "#d4a853" }: { size?: number; className?: string; color?: string }) {
  const petals = 12;
  return (
    <motion.svg
      viewBox={`0 0 ${size} ${size}`}
      className={`absolute pointer-events-none ${className}`}
      style={{ width: size, height: size }}
      animate={{ rotate: 360 }}
      transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
    >
      {Array.from({ length: petals }).map((_, i) => {
        const angle = (360 / petals) * i;
        return (
          <g key={i} transform={`rotate(${angle} ${size / 2} ${size / 2})`}>
            <ellipse
              cx={size / 2} cy={size * 0.2}
              rx={size * 0.04} ry={size * 0.12}
              fill="none" stroke={color} strokeWidth="0.5"
              opacity="0.2"
            />
            <ellipse
              cx={size / 2} cy={size * 0.28}
              rx={size * 0.02} ry={size * 0.06}
              fill="none" stroke={color} strokeWidth="0.3"
              opacity="0.15"
            />
          </g>
        );
      })}
      {[0.35, 0.42, 0.48].map((r, i) => (
        <circle
          key={i}
          cx={size / 2} cy={size / 2}
          r={size * r}
          fill="none" stroke={color}
          strokeWidth={0.5 - i * 0.1}
          opacity={0.15 - i * 0.03}
          strokeDasharray={i === 1 ? "4 4" : "none"}
        />
      ))}
    </motion.svg>
  );
}

/* ── Floating embers ── */
function FloatingEmbers({ count = 20, color = "#d4a853" }: { count?: number; color?: string }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: count }).map((_, i) => {
        const size = 2 + (i % 3);
        return (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: size, height: size,
              left: `${(i * 41 + 13) % 100}%`,
              bottom: -10,
              background: `radial-gradient(circle, ${color} 0%, ${color} 50%, transparent 100%)`,
              boxShadow: `0 0 4px 1px ${withOpacity(color, 0.3)}`,
            }}
            animate={{
              y: [0, -(600 + i * 30)],
              x: [0, Math.sin(i * 0.7) * 50],
              opacity: [0, 0.8, 0.6, 0],
              scale: [0.5, 1, 0.8, 0],
            }}
            transition={{
              duration: 6 + (i % 4) * 2,
              repeat: Infinity,
              delay: (i * 0.8) % 6,
              ease: "easeOut",
            }}
          />
        );
      })}
    </div>
  );
}

export default function GoldenLotus({ data, config }: { data?: InvitationData; config?: TemplateConfig } = {}) {
  const merged = deepMerge(DEFAULT_CONFIG as Record<string, unknown>, (config || {}) as Record<string, unknown>) as TemplateConfig;
  const theme = merged.theme as ThemeConfig;
  const sections = (merged.sections || DEFAULT_SECTIONS).filter(s => s.visible).sort((a, b) => a.order - b.order);
  const content = merged.content || {};

  const groom = data?.groomName || "Aravind";
  const bride = data?.brideName || "Priya";
  const date = data?.weddingDate || "2026-10-10";
  const time = data?.weddingTime || "9:00 AM";
  const venue = data?.venue || "Nallur Kandaswamy Kovil";
  const venueAddr = data?.venueAddress || "Main Street, Nallur, Jaffna, Sri Lanka";
  const events = data?.events || [
    { title: "Nichayathartham", time: "10:00 AM", venue: "Nallur Kandaswamy Kovil", description: "Formal engagement ceremony with exchange of rings and blessings from elders" },
    { title: "Mehendi & Sangeet", time: "6:00 PM", venue: "Bride's Residence", description: "An evening of henna, music, and dance celebrating the bride-to-be" },
    { title: "Muhurtham", time: "9:00 AM", venue: "Nallur Kandaswamy Kovil", description: "The sacred Hindu wedding ceremony with tying of the Thali at the auspicious hour" },
    { title: "Wedding Reception", time: "7:00 PM", venue: "Jaffna Heritage Hotel", description: "Grand reception dinner with traditional feast, music, and celebrations" },
  ];

  const dateObj = new Date(date + "T00:00:00");
  const formattedDate = dateObj.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  const storyItems = content.story?.items || [
    { year: "2020", title: "First Meeting", description: "A connection so deep at a temple festival in Nallur, it felt like they had known each other across lifetimes." },
    { year: "2021", title: "Falling in Love", description: "Three years of shared laughter, family dinners, and dreams." },
    { year: "2024", title: "The Proposal", description: "Aravind proposed with his grandmother's gold ring at Jaffna Fort during a crimson sunset." },
    { year: "2026", title: "The Wedding", description: "They invite you to witness the sacred beginning of their journey together." },
  ];

  const [rsvpSent, setRsvpSent] = useState(false);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.85]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const HeroSection = () => (
    <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 overflow-hidden">
      <Mandala size={600} className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-30 max-w-[90vw] max-h-[90vw]" color={theme.primaryColor} />
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] sm:w-[700px] h-[90vw] sm:h-[700px] rounded-full pointer-events-none"
        animate={{
          boxShadow: [
            `inset 0 0 80px 20px ${withOpacity(theme.primaryColor, 0.03)}`,
            `inset 0 0 120px 40px ${withOpacity(theme.primaryColor, 0.06)}`,
            `inset 0 0 80px 20px ${withOpacity(theme.primaryColor, 0.03)}`,
          ],
        }}
        transition={{ duration: 5, repeat: Infinity }}
      />

      <FloatingEmbers count={15} color={theme.accentColor} />

      <motion.div style={{ scale: heroScale, opacity: heroOpacity }} className="relative z-10">
        <motion.div
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-10"
          style={{ borderWidth: 2, borderStyle: "solid", borderColor: theme.primaryColor }}
          animate={{
            borderColor: [withOpacity(theme.primaryColor, 0.5), withOpacity(theme.primaryColor, 0.8), withOpacity(theme.primaryColor, 0.5)],
            boxShadow: [
              `0 0 0 0 ${withOpacity(theme.primaryColor, 0)}`,
              `0 0 20px 5px ${withOpacity(theme.primaryColor, 0.15)}`,
              `0 0 0 0 ${withOpacity(theme.primaryColor, 0)}`,
            ],
          }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <motion.div
            animate={{ scale: [1, 1.15, 1], y: [0, -2, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Flame className="w-8 h-8" style={{ color: theme.primaryColor }} />
          </motion.div>
        </motion.div>

        <motion.p
          className="tracking-[0.5em] uppercase text-xs mb-10"
          style={{ color: theme.primaryColor }}
          initial={{ opacity: 0, letterSpacing: "0.1em" }}
          animate={{ opacity: 1, letterSpacing: "0.5em" }}
          transition={{ duration: 2 }}
        >
          {content.hero?.subtitle || "Shubh Vivah"}
        </motion.p>

        <motion.h1
          className="text-6xl sm:text-8xl lg:text-9xl font-light leading-none"
          style={{ color: theme.primaryColor }}
          initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1.2, delay: 0.3 }}
        >
          {bride}
        </motion.h1>

        <motion.div
          className="flex items-center justify-center gap-8 my-5"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.2, delay: 0.8 }}
        >
          <motion.div
            className="w-24 h-px"
            style={{ background: `linear-gradient(to right, transparent, ${theme.primaryColor})` }}
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          <span className="text-3xl font-light" style={{ color: theme.primaryColor }}>&amp;</span>
          <motion.div
            className="w-24 h-px"
            style={{ background: `linear-gradient(to left, transparent, ${theme.primaryColor})` }}
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
          />
        </motion.div>

        <motion.h1
          className="text-6xl sm:text-8xl lg:text-9xl font-light leading-none"
          style={{ color: theme.primaryColor }}
          initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1.2, delay: 0.6 }}
        >
          {groom}
        </motion.h1>

        <motion.div
          className="mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
        >
          <p className="text-lg mb-1" style={{ color: withOpacity(theme.textColor, 0.6) }}>{content.hero?.message || "Cordially invite you to celebrate"}</p>
        </motion.div>

        <motion.div
          className="mt-10 rounded-xl px-12 py-6 inline-block backdrop-blur-sm"
          style={{ borderWidth: 1, borderStyle: "solid", borderColor: withOpacity(theme.primaryColor, 0.3), backgroundColor: withOpacity(theme.primaryColor, 0.05) }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.8, type: "spring" }}
        >
          <p className="text-sm tracking-[0.3em] uppercase" style={{ color: theme.primaryColor }}>{formattedDate}</p>
          <p className="text-xs mt-1 tracking-[0.2em]" style={{ color: withOpacity(theme.textColor, 0.4) }}>{venue}</p>
        </motion.div>
      </motion.div>

      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 z-10"
      >
        <ChevronDown className="w-6 h-6" style={{ color: withOpacity(theme.primaryColor, 0.4) }} />
      </motion.div>
    </section>
  );

  const CountdownSection = () => (
    <section className="relative py-24 text-center overflow-hidden" style={{ backgroundColor: theme.primaryColor, color: theme.secondaryColor }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative z-10"
      >
        <p className="tracking-[0.4em] uppercase text-xs mb-10" style={{ color: withOpacity(theme.secondaryColor, 0.5) }}>The Celebration Begins In</p>
        <Countdown
          targetDate={`${date}T09:00:00`}
          valueClassName="text-3xl sm:text-6xl font-light"
          valueStyle={{ color: theme.secondaryColor }}
          labelClassName="text-[10px] tracking-[0.3em] uppercase mt-3"
          labelStyle={{ color: withOpacity(theme.secondaryColor, 0.4) }}
          boxClassName="flex flex-col items-center bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl px-3 sm:px-6 py-5 min-w-[60px] sm:min-w-[90px]"
          separatorClassName="text-2xl sm:text-4xl font-light mx-1 self-start mt-2"
          separatorStyle={{ color: withOpacity(theme.secondaryColor, 0.15) }}
        />
      </motion.div>
    </section>
  );

  const StorySection = () => (
    <section className="py-28 px-4 max-w-3xl mx-auto text-center">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <motion.div
          className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-8"
          style={{ borderWidth: 1, borderStyle: "solid", borderColor: withOpacity(theme.primaryColor, 0.3) }}
          animate={{ borderColor: [withOpacity(theme.primaryColor, 0.2), withOpacity(theme.primaryColor, 0.5), withOpacity(theme.primaryColor, 0.2)] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <Heart className="w-6 h-6" style={{ color: theme.primaryColor }} />
        </motion.div>
        <h2 className="text-4xl sm:text-5xl font-light mb-10" style={{ color: theme.primaryColor }}>{content.story?.title || "Our Story"}</h2>

        {storyItems.map((item, i) => (
          <motion.p
            key={i}
            className="text-lg leading-loose mb-8"
            style={{ color: withOpacity(theme.textColor, 0.5) }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.2 }}
          >
            <span className="font-semibold" style={{ color: theme.primaryColor }}>{item.year} - {item.title}:</span> {item.description}
          </motion.p>
        ))}
      </motion.div>
    </section>
  );

  const EventsSection = () => (
    <section className="relative py-28 px-4 overflow-hidden" style={{ backgroundColor: withOpacity(theme.primaryColor, 0.05) }}>
      <FloatingEmbers count={8} color={theme.accentColor} />
      <div className="max-w-5xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="tracking-[0.4em] uppercase text-xs mb-4" style={{ color: theme.primaryColor }}>Ceremonies</p>
          <h2 className="text-4xl sm:text-5xl font-light" style={{ color: theme.primaryColor }}>Wedding Events</h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {events.map((event, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30, rotateX: -10 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.15 }}
              whileHover={{
                y: -6,
                borderColor: withOpacity(theme.primaryColor, 0.3),
                boxShadow: `0 20px 40px -12px ${withOpacity(theme.primaryColor, 0.1)}`,
              }}
              className="rounded-2xl p-8 transition-all"
              style={{ backgroundColor: theme.secondaryColor, borderWidth: 1, borderStyle: "solid", borderColor: withOpacity(theme.primaryColor, 0.15) }}
            >
              <h3 className="text-xl font-semibold mb-3" style={{ color: theme.primaryColor }}>{event.title}</h3>
              <div className="flex items-center gap-3 text-sm mb-4" style={{ color: withOpacity(theme.textColor, 0.4) }}>
                <span>{event.time}</span>
                {event.venue && <>
                  <span className="w-1 h-1 rounded-full" style={{ backgroundColor: withOpacity(theme.primaryColor, 0.3) }} />
                  <span>{event.venue}</span>
                </>}
              </div>
              <p className="text-sm leading-relaxed" style={{ color: withOpacity(theme.textColor, 0.3) }}>{event.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );

  const GallerySection = () => (
    <section className="py-28 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="tracking-[0.4em] uppercase text-xs mb-4" style={{ color: theme.primaryColor }}>Gallery</p>
          <h2 className="text-4xl sm:text-5xl font-light" style={{ color: theme.primaryColor }}>Precious Moments</h2>
        </motion.div>

        {content.gallery?.images?.length ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {content.gallery.images.map((src: string, i: number) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.85 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                whileHover={{ scale: 1.04 }}
                className="rounded-2xl overflow-hidden aspect-[4/3]"
              >
                <img src={src} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover" />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.85 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                whileHover={{ scale: 1.04 }}
                className={`${i === 1 || i === 4 ? "row-span-2" : ""} rounded-2xl min-h-[160px] flex items-center justify-center cursor-pointer group overflow-hidden`}
                style={{ background: `linear-gradient(to bottom right, ${withOpacity(theme.primaryColor, 0.1)}, ${withOpacity(theme.primaryColor, 0.05)})`, borderWidth: 1, borderStyle: "solid", borderColor: withOpacity(theme.primaryColor, 0.1) }}
              >
                <Camera className="w-8 h-8 group-hover:opacity-50 transition-colors" style={{ color: withOpacity(theme.primaryColor, 0.15) }} />
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="tracking-[0.4em] uppercase text-xs mb-4" style={{ color: theme.primaryColor }}>Venue</p>
          <h2 className="text-4xl sm:text-5xl font-light mb-2" style={{ color: theme.primaryColor }}>{venue}</h2>
          <p className="mb-10" style={{ color: withOpacity(theme.textColor, 0.4) }}>{venueAddr}</p>
          {(content.venue?.mapUrl || venue || venueAddr) ? (
            <iframe
              src={`https://maps.google.com/maps?q=${encodeURIComponent(
                content.venue?.mapUrl && content.venue.mapUrl.includes("google")
                  ? content.venue.mapUrl
                  : [venue, venueAddr].filter(Boolean).join(", ")
              )}&output=embed`}
              className="w-full h-64 rounded-2xl border-0"
              loading="lazy"
              allowFullScreen
              title="Wedding Venue Map"
            />
          ) : (
            <div className="rounded-2xl h-72 sm:h-80 flex items-center justify-center" style={{ background: `linear-gradient(to bottom right, ${withOpacity(theme.primaryColor, 0.1)}, ${theme.secondaryColor})`, borderWidth: 1, borderStyle: "solid", borderColor: withOpacity(theme.primaryColor, 0.1) }}>
              <MapPin className="w-10 h-10" style={{ color: withOpacity(theme.primaryColor, 0.2) }} />
            </div>
          )}
          {content.venue?.mapUrl && (
            <a
              href={content.venue.mapUrl.startsWith("http") ? content.venue.mapUrl : `https://maps.google.com/maps?q=${encodeURIComponent(content.venue.mapUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full text-sm"
              style={{ color: theme.primaryColor, border: `1px solid ${withOpacity(theme.primaryColor, 0.3)}` }}
            >
              <MapPin className="w-4 h-4" /> Open in Google Maps
            </a>
          )}
          <SecondaryVenue second={content.venue?.second} primaryColor={theme.primaryColor} secondaryColor={theme.secondaryColor} accentColor={theme.accentColor} />
        </motion.div>
      </div>
    </section>
  );

  const RsvpSection = () => (
    <section className="relative py-28 px-4 overflow-hidden">
      <FloatingEmbers count={10} color={theme.accentColor} />
      <div className="max-w-lg mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1], y: [0, -3, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Flame className="w-10 h-10 mx-auto mb-8" style={{ color: theme.primaryColor }} />
          </motion.div>
          <h2 className="text-4xl sm:text-5xl font-light mb-4" style={{ color: theme.primaryColor }}>{content.rsvp?.title || "Honour Us With Your Presence"}</h2>
          <p className="text-sm mb-12" style={{ color: withOpacity(theme.textColor, 0.3) }}>{content.rsvp?.deadline || "Please respond by September 10, 2026"}</p>

          {rsvpSent ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="rounded-2xl p-10"
              style={{ borderWidth: 1, borderStyle: "solid", borderColor: withOpacity(theme.primaryColor, 0.3), backgroundColor: withOpacity(theme.primaryColor, 0.05) }}
            >
              <Flame className="w-12 h-12 mx-auto mb-4" style={{ color: theme.primaryColor }} />
              <p className="text-2xl font-light" style={{ color: theme.primaryColor }}>Blessings received!</p>
              <p className="mt-2" style={{ color: withOpacity(theme.textColor, 0.3) }}>We are honoured by your response.</p>
            </motion.div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); setRsvpSent(true); }} className="space-y-4">
              <input type="text" placeholder="Full Name" required className="w-full px-5 py-4 bg-transparent rounded-xl text-sm transition-all" style={{ color: theme.textColor, borderWidth: 1, borderStyle: "solid", borderColor: withOpacity(theme.primaryColor, 0.2) }} />
              <input type="tel" placeholder="Phone Number" className="w-full px-5 py-4 bg-transparent rounded-xl text-sm transition-all" style={{ color: theme.textColor, borderWidth: 1, borderStyle: "solid", borderColor: withOpacity(theme.primaryColor, 0.2) }} />
              <select className="w-full px-5 py-4 rounded-xl text-sm" style={{ backgroundColor: theme.secondaryColor, color: withOpacity(theme.textColor, 0.5), borderWidth: 1, borderStyle: "solid", borderColor: withOpacity(theme.primaryColor, 0.2) }}>
                <option value="">Will you attend?</option>
                <option value="yes">Happily Accept</option>
                <option value="no">Regretfully Decline</option>
              </select>
              <select className="w-full px-5 py-4 rounded-xl text-sm" style={{ backgroundColor: theme.secondaryColor, color: withOpacity(theme.textColor, 0.5), borderWidth: 1, borderStyle: "solid", borderColor: withOpacity(theme.primaryColor, 0.2) }}>
                <option value="">Which ceremonies?</option>
                <option value="all">All Events</option>
                <option value="wedding">Muhurtham Only</option>
                <option value="reception">Reception Only</option>
              </select>
              <input type="number" min="1" max="5" placeholder="Number of guests" className="w-full px-5 py-4 bg-transparent rounded-xl text-sm transition-all" style={{ color: theme.textColor, borderWidth: 1, borderStyle: "solid", borderColor: withOpacity(theme.primaryColor, 0.2) }} />
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02, boxShadow: `0 0 40px ${withOpacity(theme.primaryColor, 0.2)}` }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 rounded-xl font-semibold tracking-[0.2em] uppercase text-sm shadow-lg"
                style={{ background: `linear-gradient(to right, ${theme.primaryColor}, ${theme.accentColor})`, color: theme.secondaryColor }}
              >
                Send Response
              </motion.button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );

  const FooterSection = () => (
    <footer className="py-14 text-center px-4" style={{ borderTop: `1px solid ${withOpacity(theme.primaryColor, 0.1)}` }}>
      <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}>
        <Flame className="w-5 h-5 mx-auto mb-4" style={{ color: theme.primaryColor }} />
      </motion.div>
      <p className="text-xl font-light" style={{ color: theme.primaryColor }}>{bride} & {groom}</p>
      <p className="text-sm mt-2" style={{ color: withOpacity(theme.textColor, 0.2) }}>{formattedDate} &middot; {venue}</p>
      <div className="flex justify-center gap-3 mt-6 mb-6">
        {[Phone, Mail].map((Icon, i) => (
          <motion.div key={i} whileHover={{ scale: 1.15, borderColor: withOpacity(theme.primaryColor, 0.4) }} className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-colors" style={{ borderWidth: 1, borderStyle: "solid", borderColor: withOpacity(theme.primaryColor, 0.15) }}>
            <Icon className="w-4 h-4" style={{ color: withOpacity(theme.primaryColor, 0.5) }} />
          </motion.div>
        ))}
      </div>
      <p className="text-xs" style={{ color: withOpacity(theme.textColor, 0.15) }}>
        Created with <Heart className="w-3 h-3 inline" style={{ color: withOpacity(theme.primaryColor, 0.5) }} /> by{" "}
        <Link href="/" style={{ color: withOpacity(theme.primaryColor, 0.4) }} className="hover:underline">INVITATION.LK</Link>
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
