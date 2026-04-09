"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Heart, MapPin, Mail, Phone, Camera, ChevronDown } from "lucide-react";
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
    primaryColor: "#c2185b",
    secondaryColor: "#d81b60",
    backgroundColor: "#fff8f9",
    textColor: "#1f2937",
    accentColor: "#ad1457",
    fontFamily: "serif",
  },
  sections: [...DEFAULT_SECTIONS],
  content: {
    hero: { subtitle: "ශ්‍රී සුභ මංගලම් !", message: "සමග අබියස ගයිමේ ප්‍රීතිය හිමිකරගන්න" },
    story: { title: "උත්සව විස්තර" },
    rsvp: { title: "Will You Join Us?", deadline: "" },
    footer: { message: "" },
  },
};

/* ── Detailed Mandala SVG ── */
function DetailedMandala({ size = 400, className = "", animate = true, color = "#c2185b" }: { size?: number; className?: string; animate?: boolean; color?: string }) {
  const petals = 16;
  const c = size / 2;

  const svgContent = (
    <>
      {Array.from({ length: 32 }).map((_, i) => {
        const angle = (360 / 32) * i;
        const rad = (angle * Math.PI) / 180;
        const r = c * 0.92;
        const x = c + Math.cos(rad) * r;
        const y = c + Math.sin(rad) * r;
        return <circle key={`outer-${i}`} cx={x} cy={y} r={i % 2 === 0 ? 3 : 2} fill={color} opacity={i % 2 === 0 ? 0.35 : 0.2} />;
      })}
      {Array.from({ length: petals }).map((_, i) => {
        const angle = (360 / petals) * i;
        return (
          <g key={`petal-${i}`} transform={`rotate(${angle} ${c} ${c})`}>
            <ellipse cx={c} cy={c * 0.25} rx={c * 0.08} ry={c * 0.22} fill="none" stroke={color} strokeWidth="1.2" opacity="0.3" />
            <ellipse cx={c} cy={c * 0.35} rx={c * 0.05} ry={c * 0.14} fill="none" stroke={color} strokeWidth="0.8" opacity="0.25" />
            <circle cx={c} cy={c * 0.15} r="2.5" fill={color} opacity="0.25" />
          </g>
        );
      })}
      {Array.from({ length: petals }).map((_, i) => {
        const angle = (360 / petals) * i + 360 / petals / 2;
        return (
          <g key={`petal2-${i}`} transform={`rotate(${angle} ${c} ${c})`}>
            <ellipse cx={c} cy={c * 0.38} rx={c * 0.04} ry={c * 0.1} fill="none" stroke={color} strokeWidth="0.7" opacity="0.2" />
            <circle cx={c} cy={c * 0.3} r="1.5" fill={color} opacity="0.15" />
          </g>
        );
      })}
      {[0.85, 0.72, 0.6, 0.5, 0.4, 0.3, 0.2, 0.12].map((r, i) => (
        <circle key={`ring-${i}`} cx={c} cy={c} r={c * r} fill="none" stroke={i % 2 === 0 ? color : color} strokeWidth={i < 2 ? 1 : 0.5} opacity={0.18 - i * 0.01} strokeDasharray={i === 2 || i === 5 ? "3 3" : "none"} />
      ))}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (360 / 8) * i;
        const rad = (angle * Math.PI) / 180;
        const r = c * 0.55;
        const x = c + Math.cos(rad) * r;
        const y = c + Math.sin(rad) * r;
        return (
          <g key={`inner-dec-${i}`}>
            <circle cx={x} cy={y} r="5" fill="none" stroke={color} strokeWidth="0.8" opacity="0.25" />
            <circle cx={x} cy={y} r="2" fill={color} opacity="0.12" />
          </g>
        );
      })}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (360 / 8) * i;
        return (
          <g key={`lotus-${i}`} transform={`rotate(${angle} ${c} ${c})`}>
            <path d={`M${c} ${c - 15} Q${c + 8} ${c - 8} ${c} ${c} Q${c - 8} ${c - 8} ${c} ${c - 15}`} fill={color} opacity="0.1" stroke={color} strokeWidth="0.5" />
          </g>
        );
      })}
      <circle cx={c} cy={c} r="4" fill={color} opacity="0.18" />
      <circle cx={c} cy={c} r="2" fill={color} opacity="0.22" />
    </>
  );

  if (animate) {
    return (
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 120, repeat: Infinity, ease: "linear" }} style={{ width: size, height: size }} className={className}>
        <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full pointer-events-none">{svgContent}</svg>
      </motion.div>
    );
  }
  return <svg viewBox={`0 0 ${size} ${size}`} className={`pointer-events-none ${className}`} style={{ width: size, height: size }}>{svgContent}</svg>;
}

/* ── Ornate border frame ── */
function OrnateFrame({ color = "#c2185b" }: { color?: string }) {
  return (
    <div className="absolute inset-6 sm:inset-10 pointer-events-none">
      <svg className="w-full h-full" preserveAspectRatio="none">
        <motion.rect x="0" y="0" width="100%" height="100%" fill="none" stroke={color} strokeWidth="1" opacity="0.2" strokeDasharray="12 6 4 6" animate={{ strokeDashoffset: [0, -56] }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }} />
        <rect x="8" y="8" width="calc(100% - 16)" height="calc(100% - 16)" rx="0" fill="none" stroke={color} strokeWidth="0.5" opacity="0.12" style={{ width: "calc(100% - 16px)", height: "calc(100% - 16px)" }} />
      </svg>
    </div>
  );
}

/* ── Floating sakura petals ── */
function SakuraPetals({ color = "#c2185b" }: { color?: string }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 12 }).map((_, i) => {
        const size = 10 + (i % 5) * 4;
        return (
          <motion.div key={i} className="absolute" style={{ left: `${(i * 37 + 11) % 100}%`, top: -20, width: size, height: size * 0.7, background: withOpacity(color, 0.12 + (i % 3) * 0.03), borderRadius: "50% 50% 50% 0" }}
            animate={{ y: [0, 900 + i * 30], x: [0, Math.sin(i * 0.6) * 100, Math.cos(i) * 60], rotate: [0, 540 * (i % 2 === 0 ? 1 : -1)], opacity: [0, 0.6, 0.4, 0] }}
            transition={{ duration: 12 + i * 1.5, repeat: Infinity, delay: i * 0.7, ease: "easeIn" }} />
        );
      })}
    </div>
  );
}

/* ── Glowing particles ── */
function GlowParticles({ color = "#c2185b" }: { color?: string }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 10 }).map((_, i) => (
        <motion.div key={i} className="absolute rounded-full" style={{ width: 3 + (i % 3) * 2, height: 3 + (i % 3) * 2, left: `${(i * 41 + 7) % 100}%`, top: `${(i * 29 + 13) % 100}%`, background: `radial-gradient(circle, ${withOpacity(color, 0.5)}, transparent)`, boxShadow: `0 0 8px 2px ${withOpacity(color, 0.2)}` }}
          animate={{ y: [0, -30, 0], opacity: [0.3, 0.7, 0.3], scale: [1, 1.5, 1] }}
          transition={{ duration: 3 + (i % 4), repeat: Infinity, delay: i * 0.4 }} />
      ))}
    </div>
  );
}

export default function SinhalaMangalya({ data, config }: { data?: InvitationData; config?: TemplateConfig } = {}) {
  const merged = deepMerge(DEFAULT_CONFIG as Record<string, unknown>, (config || {}) as Record<string, unknown>) as TemplateConfig;
  const theme = merged.theme as ThemeConfig;
  const sections = (merged.sections || DEFAULT_SECTIONS).filter(s => s.visible).sort((a, b) => a.order - b.order);
  const content = merged.content || {};

  const groom = data?.groomName || "කනේෂ්ක";
  const bride = data?.brideName || "දිනුෂා";
  const date = data?.weddingDate || "2026-08-18";
  const time = data?.weddingTime || "9:00 AM";
  const venue = data?.venue || "හොටෙල් සිහාරනම්";
  const venueAddr = data?.venueAddress || "පුත්තලම් පාර, ගොට්ටිනාපහම, අනුරාධපුර";
  const events = data?.events || [
    { title: "පොරුව උත්සවය", time: "පෙ.ව. 09:00 - පෙ.ව. 10:30", venue: "හොටෙල් සිහාරනම්", description: "සම්ප්‍රදායික පොරුව උත්සවය" },
    { title: "මංගල උත්සවය", time: "පෙ.ව. 10:30 - ප.ව. 03:30", venue: "හොටෙල් සිහාරනම්", description: "මංගල උත්සවය සහ සාද භෝජනය" },
  ];

  const dateObj = new Date(date + "T00:00:00");
  const formattedDate = dateObj.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  const [rsvpSent, setRsvpSent] = useState(false);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.7], [1, 0.95]);

  const HeroSection = () => (
    <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 overflow-hidden">
      <OrnateFrame color={theme.primaryColor} />
      <SakuraPetals color={theme.primaryColor} />
      <GlowParticles color={theme.primaryColor} />

      <div className="absolute top-0 left-0 -translate-x-1/4 -translate-y-1/4 hidden sm:block"><DetailedMandala size={350} className="opacity-25" color={theme.primaryColor} /></div>
      <div className="absolute top-0 right-0 translate-x-1/4 -translate-y-1/4 hidden sm:block"><DetailedMandala size={300} className="opacity-20" color={theme.primaryColor} /></div>
      <div className="absolute bottom-0 left-0 -translate-x-1/4 translate-y-1/4 hidden sm:block"><DetailedMandala size={380} className="opacity-25" color={theme.primaryColor} /></div>
      <div className="absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4 hidden sm:block"><DetailedMandala size={320} className="opacity-20" color={theme.primaryColor} /></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-w-[90vw] max-h-[90vw] sm:max-w-none sm:max-h-none"><DetailedMandala size={500} className="opacity-[0.07]" animate={true} color={theme.primaryColor} /></div>

      <motion.div style={{ opacity: heroOpacity, scale: heroScale }} className="relative z-10">
        <motion.h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: theme.primaryColor }} initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.2, type: "spring" }}>
          {content.hero?.subtitle || "ශ්‍රී සුභ මංගලම් !"}
        </motion.h2>

        <motion.div className="flex items-center justify-center gap-3 mb-8" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 1, delay: 0.5 }}>
          <div className="w-20 h-px" style={{ background: `linear-gradient(to right, transparent, ${theme.primaryColor})` }} />
          <motion.div animate={{ rotate: 360, scale: [1, 1.2, 1] }} transition={{ rotate: { duration: 20, repeat: Infinity, ease: "linear" }, scale: { duration: 2, repeat: Infinity } }}>
            <Heart className="w-4 h-4" style={{ color: theme.primaryColor, fill: theme.primaryColor }} />
          </motion.div>
          <div className="w-20 h-px" style={{ background: `linear-gradient(to left, transparent, ${theme.primaryColor})` }} />
        </motion.div>

        <motion.div className="w-36 h-36 mx-auto mb-8 relative" initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ duration: 1, delay: 0.3, type: "spring" }}>
          <div className="absolute inset-0 rounded-full shadow-xl" style={{ background: `linear-gradient(to bottom right, ${withOpacity(theme.primaryColor, 0.3)}, ${withOpacity(theme.primaryColor, 0.15)})`, boxShadow: `0 8px 30px ${withOpacity(theme.primaryColor, 0.2)}` }} />
          <div className="absolute inset-2 rounded-full flex items-center justify-center" style={{ background: `linear-gradient(to bottom right, ${withOpacity(theme.primaryColor, 0.05)}, white)` }}>
            <Heart className="w-16 h-16" style={{ color: theme.primaryColor, fill: theme.primaryColor }} />
          </div>
          {[0, 1, 2, 3].map((i) => (
            <motion.div key={i} className="absolute w-2 h-2 rounded-full" style={{ top: "50%", left: "50%", backgroundColor: theme.primaryColor }}
              animate={{ x: [Math.cos((i * Math.PI) / 2) * 75, Math.cos((i * Math.PI) / 2 + Math.PI * 2) * 75], y: [Math.sin((i * Math.PI) / 2) * 75, Math.sin((i * Math.PI) / 2 + Math.PI * 2) * 75], opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 8, repeat: Infinity, delay: i * 2, ease: "linear" }} />
          ))}
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-16 mb-8 max-w-lg mx-auto">
          <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8, duration: 0.8 }} className="text-center">
            <p className="text-sm mb-2 leading-relaxed" style={{ color: withOpacity(theme.textColor, 0.6) }}>ආනන්ද රත්නායක මහතාගේ සහ<br />එම මැතිනියගේ ආදරණීය දියණිය</p>
            <h2 className="text-4xl sm:text-5xl font-bold" style={{ color: theme.primaryColor }}>{bride}</h2>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1, duration: 0.8 }} className="text-center">
            <p className="text-sm mb-2 leading-relaxed" style={{ color: withOpacity(theme.textColor, 0.6) }}>චන්දසිරි කුමාරසිංහ මහතාගේ සහ<br />එම මැතිනියගේ ආදරණීය පුත්</p>
            <h2 className="text-4xl sm:text-5xl font-bold" style={{ color: theme.primaryColor }}>{groom}</h2>
          </motion.div>
        </div>

        <motion.div className="text-base leading-loose max-w-md mx-auto mb-8 italic" style={{ color: withOpacity(theme.textColor, 0.7) }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.3 }}>
          <p>විශ්ව සතු ගෙන බැඳුණු - වසන්තය ලග ලගම</p>
          <p>සුවිශාල මල් පිපුණු - සිහිනයයි එලි දැකිම</p>
          <p className="mt-2">ආකාර දින ගෙවුණු - සත් වසර ගිය දුරක</p>
          <p>එක හිතින් අත රැඳුණු - ගිණාවකි මේ දවස</p>
        </motion.div>

        <motion.div className="relative" initial={{ opacity: 0, y: 30, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: 1.6, type: "spring" }}>
          <div className="bg-white/90 backdrop-blur-md rounded-2xl px-8 py-6 shadow-xl" style={{ borderWidth: 1, borderStyle: "solid", borderColor: withOpacity(theme.primaryColor, 0.3), boxShadow: `0 8px 30px ${withOpacity(theme.primaryColor, 0.15)}` }}>
            <p className="text-sm font-medium mb-1" style={{ color: theme.primaryColor }}>{content.hero?.message || "සමග අබියස ගයිමේ ප්‍රීතිය හිමිකරගන්න"}</p>
            <p className="text-2xl sm:text-3xl font-bold mb-1" style={{ color: theme.textColor }}>{formattedDate}</p>
            <p className="font-semibold text-lg" style={{ color: theme.primaryColor }}>{venue}</p>
            <p className="text-sm mt-1" style={{ color: withOpacity(theme.textColor, 0.6) }}>{venueAddr}</p>
            <p className="text-sm mt-1" style={{ color: withOpacity(theme.textColor, 0.6) }}>උත්සව සැලසුම් පෙරවරය {time} සිට</p>
          </div>
          <div className="absolute -inset-4 rounded-3xl blur-xl -z-10" style={{ backgroundColor: withOpacity(theme.primaryColor, 0.08) }} />
        </motion.div>
      </motion.div>

      <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 2.5, repeat: Infinity }} className="absolute bottom-8 z-10">
        <ChevronDown className="w-6 h-6" style={{ color: theme.primaryColor }} />
      </motion.div>
    </section>
  );

  const CountdownSection = () => (
    <section className="relative py-24 text-white text-center overflow-hidden" style={{ background: `linear-gradient(to right, ${theme.primaryColor}, ${theme.secondaryColor}, ${theme.accentColor})` }}>
      <SakuraPetals color={theme.primaryColor} />
      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="relative z-10">
        <p className="tracking-[0.4em] uppercase text-xs mb-10" style={{ color: withOpacity("#ffffff", 0.7) }}>විවාහ දිනය දක්වා</p>
        <Countdown targetDate={`${date}T09:00:00`} valueClassName="text-3xl sm:text-6xl font-light text-white" labelClassName="text-[10px] tracking-[0.2em] uppercase mt-3" labelStyle={{ color: withOpacity("#ffffff", 0.6) }}
          boxClassName="flex flex-col items-center bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl px-3 sm:px-6 py-5 min-w-[60px] sm:min-w-[85px]" separatorClassName="text-xl sm:text-3xl font-light text-white/20 mx-1 self-start mt-3" />
      </motion.div>
    </section>
  );

  const EventsSection = () => (
    <section className="py-28 px-4 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"><DetailedMandala size={400} className="opacity-[0.05]" animate={false} color={theme.primaryColor} /></div>
      <div className="max-w-3xl mx-auto text-center relative z-10">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <p className="tracking-[0.4em] uppercase text-xs mb-4" style={{ color: theme.primaryColor }}>{content.story?.title || "උත්සව විස්තර"}</p>
          <h2 className="text-3xl sm:text-4xl font-bold mb-12" style={{ color: theme.primaryColor }}>Ceremony Schedule</h2>
        </motion.div>
        <div className="grid sm:grid-cols-2 gap-6">
          {events.map((event, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.2, duration: 0.7 }}
              whileHover={{ y: -6, boxShadow: `0 20px 40px -12px ${withOpacity(theme.primaryColor, 0.15)}` }}
              className="bg-white rounded-2xl p-7 shadow-sm transition-shadow" style={{ borderWidth: 1, borderStyle: "solid", borderColor: withOpacity(theme.primaryColor, 0.2) }}>
              <h3 className="text-xl font-bold mb-1" style={{ color: theme.primaryColor }}>{event.title}</h3>
              <p className="text-sm font-medium mb-1" style={{ color: theme.primaryColor }}>{event.time}</p>
              {event.venue && <p className="text-sm" style={{ color: withOpacity(theme.textColor, 0.7) }}>{event.venue}</p>}
              <p className="text-sm mt-3" style={{ color: withOpacity(theme.textColor, 0.5) }}>{event.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );

  const GallerySection = () => (
    <section className="py-28 px-4" style={{ backgroundColor: withOpacity(theme.primaryColor, 0.03) }}>
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-12">
          <p className="tracking-[0.4em] uppercase text-xs mb-4" style={{ color: theme.primaryColor }}>ඡායාරූප</p>
          <h2 className="text-3xl sm:text-4xl font-bold" style={{ color: theme.primaryColor }}>Our Moments</h2>
        </motion.div>
        {content.gallery?.images?.length ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {content.gallery.images.map((src: string, i: number) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.85 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} whileHover={{ scale: 1.04, zIndex: 10 }} className="rounded-2xl overflow-hidden aspect-[4/3]">
                <img src={src} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover" />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.85 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} whileHover={{ scale: 1.04, zIndex: 10 }}
                className={`${i === 0 || i === 5 ? "row-span-2" : ""} rounded-2xl min-h-[140px] flex items-center justify-center cursor-pointer group relative overflow-hidden`}
                style={{ background: `linear-gradient(to bottom right, ${withOpacity(theme.primaryColor, 0.1)}, ${withOpacity(theme.secondaryColor, 0.05)})` }}>
                <Camera className="w-6 h-6 group-hover:opacity-70 transition-colors" style={{ color: withOpacity(theme.primaryColor, 0.3) }} />
                <div className="absolute inset-0 group-hover:opacity-100 opacity-0 transition-opacity" style={{ backgroundColor: withOpacity(theme.primaryColor, 0.05) }} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );

  const VenueSection = () => (
    <section className="py-28 px-4 relative">
      <div className="max-w-3xl mx-auto text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="tracking-[0.4em] uppercase text-xs mb-4" style={{ color: theme.primaryColor }}>ස්ථානය</p>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: theme.primaryColor }}>Wedding Venue</h2>
          <div className="flex items-center justify-center gap-2 mb-2">
            <MapPin className="w-5 h-5" style={{ color: theme.primaryColor }} />
            <h3 className="text-xl font-semibold" style={{ color: theme.textColor }}>{venue}</h3>
          </div>
          <p className="mb-8" style={{ color: withOpacity(theme.textColor, 0.6) }}>{venueAddr}</p>
          {(content.venue?.mapUrl || venue || venueAddr) ? (
            <iframe src={`https://maps.google.com/maps?q=${encodeURIComponent(content.venue?.mapUrl && content.venue.mapUrl.includes("google") ? content.venue.mapUrl : [venue, venueAddr].filter(Boolean).join(", "))}&output=embed`}
              className="w-full h-64 rounded-2xl border-0" loading="lazy" allowFullScreen title="Wedding Venue Map" />
          ) : (
            <motion.div whileHover={{ scale: 1.01 }} className="rounded-2xl h-64 flex items-center justify-center shadow-inner" style={{ background: `linear-gradient(to bottom right, ${withOpacity(theme.primaryColor, 0.05)}, ${withOpacity(theme.secondaryColor, 0.05)})`, borderWidth: 1, borderStyle: "solid", borderColor: withOpacity(theme.primaryColor, 0.2) }}>
              <MapPin className="w-10 h-10" style={{ color: withOpacity(theme.primaryColor, 0.3) }} />
            </motion.div>
          )}
          {content.venue?.mapUrl && (
            <a href={content.venue.mapUrl.startsWith("http") ? content.venue.mapUrl : `https://maps.google.com/maps?q=${encodeURIComponent(content.venue.mapUrl)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full text-sm" style={{ color: theme.primaryColor, border: `1px solid ${withOpacity(theme.primaryColor, 0.3)}` }}>
              <MapPin className="w-4 h-4" /> Open in Google Maps
            </a>
          )}
        </motion.div>
      </div>
    </section>
  );

  const RsvpSection = () => (
    <section className="relative py-28 text-white px-4 overflow-hidden" style={{ background: `linear-gradient(to bottom, ${theme.primaryColor}, ${theme.secondaryColor}, ${theme.accentColor})` }}>
      <SakuraPetals color={theme.primaryColor} />
      <div className="max-w-md mx-auto text-center relative z-10">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="tracking-[0.3em] uppercase text-xs mb-4" style={{ color: withOpacity("#ffffff", 0.7) }}>ආරාධනය</p>
          <h2 className="text-3xl sm:text-4xl font-bold mb-2">{content.rsvp?.title || "Will You Join Us?"}</h2>
          <p className="mb-2" style={{ color: withOpacity("#ffffff", 0.7) }}>(ඔබට / ඔබ දෙපලට / ඔබ සමඟ)</p>
          {content.rsvp?.deadline && <p className="text-sm mb-10" style={{ color: withOpacity("#ffffff", 0.5) }}>{content.rsvp.deadline}</p>}
          <p className="text-sm mb-10" style={{ color: withOpacity("#ffffff", 0.6) }}>තොරතුරු ආරාධනා කරන්නෙමු</p>

          {rsvpSent ? (
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white/10 rounded-2xl p-10 backdrop-blur-sm border border-white/10">
              <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
                <Heart className="w-14 h-14 mx-auto mb-4" style={{ color: withOpacity("#ffffff", 0.8), fill: withOpacity("#ffffff", 0.8) }} />
              </motion.div>
              <p className="text-2xl font-light">ස්තුතියි!</p>
              <p className="mt-2 text-sm" style={{ color: withOpacity("#ffffff", 0.7) }}>ඔබේ සහභාගීත්වය අපට වටිනවා.</p>
            </motion.div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); setRsvpSent(true); }} className="space-y-4">
              <input type="text" placeholder="ඔබේ නම" required className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/50 focus:outline-none focus:border-white/50 text-sm backdrop-blur-sm transition-all" />
              <input type="tel" placeholder="දුරකථන අංකය" className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/50 focus:outline-none focus:border-white/50 text-sm backdrop-blur-sm transition-all" />
              <select className="w-full px-5 py-4 border border-white/20 rounded-xl text-white focus:outline-none focus:border-white/50 text-sm" style={{ backgroundColor: theme.accentColor }}>
                <option value="">සහභාගී වේද?</option>
                <option value="yes">ඔව්, පැමිණෙන්නෙමු</option>
                <option value="no">සමාවන්න, පැමිණිය නොහැක</option>
              </select>
              <input type="number" min="1" max="10" placeholder="පැමිණෙන සංඛ්‍යාව" className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/50 focus:outline-none focus:border-white/50 text-sm backdrop-blur-sm transition-all" />
              <motion.button type="submit" whileHover={{ scale: 1.02, boxShadow: "0 8px 30px rgba(255,255,255,0.15)" }} whileTap={{ scale: 0.98 }} className="w-full py-4 rounded-xl font-semibold shadow-xl" style={{ backgroundColor: "#ffffff", color: theme.primaryColor }}>
                යවන්න
              </motion.button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );

  const FooterSection = () => (
    <footer className="py-14 text-center px-4" style={{ backgroundColor: theme.backgroundColor }}>
      <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}>
          <Heart className="w-6 h-6 mx-auto mb-4" style={{ color: theme.primaryColor, fill: theme.primaryColor }} />
        </motion.div>
        <p className="text-xl font-bold" style={{ color: theme.primaryColor }}>{bride} & {groom}</p>
        <p className="text-sm mt-1" style={{ color: withOpacity(theme.textColor, 0.6) }}>{formattedDate} &middot; {venue}</p>
        <div className="flex justify-center gap-3 mt-6 mb-6">
          {[Phone, Mail].map((Icon, i) => (
            <motion.div key={i} whileHover={{ scale: 1.15 }} className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer" style={{ borderWidth: 1, borderStyle: "solid", borderColor: withOpacity(theme.primaryColor, 0.3) }}>
              <Icon className="w-4 h-4" style={{ color: theme.primaryColor }} />
            </motion.div>
          ))}
        </div>
        <p className="text-xs" style={{ color: withOpacity(theme.textColor, 0.5) }}>
          Created with <Heart className="w-3 h-3 inline" style={{ color: theme.primaryColor, fill: theme.primaryColor }} /> by{" "}
          <Link href="/" style={{ color: theme.primaryColor }} className="hover:underline">INVITATION.LK</Link>
        </p>
      </motion.div>
    </footer>
  );

  const renderSection = (sectionId: string) => {
    switch (sectionId) {
      case "hero": return <HeroSection key="hero" />;
      case "countdown": return <CountdownSection key="countdown" />;
      case "story": return <EventsSection key="story" />;
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
