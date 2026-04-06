"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { Heart, MapPin, Mail, Phone, Music, Camera, ChevronDown } from "lucide-react";
import Countdown from "./shared/Countdown";
import { useState, useRef } from "react";
import type { InvitationData } from "@/types/invitation";
import { deepMerge } from "@/lib/deep-merge";
import { withOpacity, lighten } from "@/lib/with-opacity";
import type { TemplateConfig, ThemeConfig } from "@/types/template-config";
import { DEFAULT_SECTIONS } from "@/types/template-config";

export const DEFAULT_CONFIG: TemplateConfig = {
  theme: {
    primaryColor: "#c9a96e",
    secondaryColor: "#5c2828",
    backgroundColor: "#fdf8f4",
    textColor: "#3d1f1f",
    accentColor: "#8b5e5e",
    fontFamily: "serif",
  },
  sections: [...DEFAULT_SECTIONS],
  content: {
    hero: { subtitle: "TOGETHER WITH THEIR FAMILIES", message: "Request the honour of your presence at the celebration of their marriage" },
    story: { title: "Our Love Story" },
    rsvp: { title: "Will You Join Us?", deadline: "Kindly respond by May 15, 2026" },
    footer: { message: "" },
  },
};

/* ── Floating golden sparkles ── */
function GoldParticles({ count = 30, color = "#c9a96e" }: { count?: number; color?: string }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: count }).map((_, i) => {
        const size = 2 + (i % 4);
        const left = (i * 31 + 7) % 100;
        const delay = (i * 0.7) % 8;
        const dur = 6 + (i % 5) * 2;
        return (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: size,
              height: size,
              left: `${left}%`,
              bottom: -10,
              background: `radial-gradient(circle, ${color} 0%, ${color} 50%, transparent 100%)`,
              boxShadow: `0 0 6px 2px ${withOpacity(color, 0.4)}`,
            }}
            animate={{
              y: [0, -800 - i * 20],
              x: [0, Math.sin(i) * 60],
              opacity: [0, 1, 1, 0],
              scale: [0, 1, 1, 0],
            }}
            transition={{
              duration: dur,
              repeat: Infinity,
              delay: delay,
              ease: "easeOut",
            }}
          />
        );
      })}
    </div>
  );
}

/* ── Animated ornate corner ── */
function OrnateCorner({ position, color = "#c9a96e" }: { position: string; color?: string }) {
  const rotation =
    position === "top-left" ? "rotate-0" :
    position === "top-right" ? "rotate-90" :
    position === "bottom-right" ? "rotate-180" :
    "-rotate-90";

  return (
    <motion.div
      className={`absolute w-24 h-24 ${
        position === "top-left" ? "top-6 left-6" :
        position === "top-right" ? "top-6 right-6" :
        position === "bottom-right" ? "bottom-6 right-6" :
        "bottom-6 left-6"
      }`}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.2, delay: 0.5 }}
    >
      <svg viewBox="0 0 100 100" className={`w-full h-full ${rotation}`}>
        <path d="M0 0 L40 0 Q30 10 30 20 L30 30 Q20 30 10 30 L0 40 Z" fill="none" stroke={color} strokeWidth="1" opacity="0.6" />
        <path d="M0 0 L25 0 Q18 8 18 15 L18 18 Q8 18 0 25 Z" fill="none" stroke={color} strokeWidth="0.5" opacity="0.3" />
        <circle cx="5" cy="5" r="2" fill={color} opacity="0.5" />
      </svg>
    </motion.div>
  );
}

/* ── Animated divider ── */
function GoldenDivider({ color = "#c9a96e" }: { color?: string }) {
  return (
    <motion.div
      className="flex items-center justify-center gap-4 my-6"
      initial={{ scaleX: 0 }}
      animate={{ scaleX: 1 }}
      transition={{ duration: 1, delay: 0.8 }}
    >
      <motion.div
        className="h-px"
        style={{ width: 80, background: `linear-gradient(to right, transparent, ${color}, ${color})` }}
        animate={{ opacity: [0.3, 0.8, 0.3] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
      <motion.div
        animate={{ rotate: 360, scale: [1, 1.2, 1] }}
        transition={{ rotate: { duration: 20, repeat: Infinity, ease: "linear" }, scale: { duration: 2, repeat: Infinity } }}
      >
        <Heart className="w-5 h-5" style={{ color, fill: color }} />
      </motion.div>
      <motion.div
        className="h-px"
        style={{ width: 80, background: `linear-gradient(to left, transparent, ${color}, ${color})` }}
        animate={{ opacity: [0.3, 0.8, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
      />
    </motion.div>
  );
}

export default function RoyalElegance({ data, config }: { data?: InvitationData; config?: TemplateConfig } = {}) {
  const merged = deepMerge(DEFAULT_CONFIG as Record<string, unknown>, (config || {}) as Record<string, unknown>) as TemplateConfig;
  const theme = merged.theme as ThemeConfig;
  const sections = (merged.sections || DEFAULT_SECTIONS).filter(s => s.visible).sort((a, b) => a.order - b.order);
  const content = merged.content || {};

  const groom = data?.groomName || "Tharaka";
  const bride = data?.brideName || "Nadeesha";
  const date = data?.weddingDate || "2026-06-15";
  const time = data?.weddingTime || "4:00 PM";
  const venue = data?.venue || "Cinnamon Grand Colombo";
  const venueAddr = data?.venueAddress || "77 Galle Road, Colombo 03, Sri Lanka";
  const events = data?.events || [
    { title: "Poruwa Ceremony", time: "4:00 PM - 5:30 PM", venue: "Grand Ballroom", description: "Traditional Sinhalese wedding ceremony on the beautifully decorated Poruwa" },
    { title: "Wedding Reception", time: "6:30 PM - 11:00 PM", venue: "Royal Garden", description: "Dinner, dancing, and celebration with family and friends" },
    { title: "After Party", time: "11:00 PM onwards", venue: "Poolside Lounge", description: "Continue the celebration with music, drinks, and memories" },
  ];

  const [rsvpSent, setRsvpSent] = useState(false);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  /* ── Section renderers ── */

  const HeroSection = () => (
    <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 overflow-hidden">
      {/* Animated background gradient pulse */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: [
            `radial-gradient(ellipse at 50% 50%, ${withOpacity(theme.secondaryColor, 0.03)} 0%, transparent 70%)`,
            `radial-gradient(ellipse at 50% 50%, ${withOpacity(theme.primaryColor, 0.06)} 0%, transparent 70%)`,
            `radial-gradient(ellipse at 50% 50%, ${withOpacity(theme.secondaryColor, 0.03)} 0%, transparent 70%)`,
          ],
        }}
        transition={{ duration: 6, repeat: Infinity }}
      />

      <GoldParticles count={25} color={theme.primaryColor} />

      {/* Ornate corners */}
      {["top-left", "top-right", "bottom-right", "bottom-left"].map((pos) => (
        <OrnateCorner key={pos} position={pos} color={theme.primaryColor} />
      ))}

      {/* Animated border frame */}
      <motion.div
        className="absolute inset-8 sm:inset-12 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
      >
        <svg className="w-full h-full" preserveAspectRatio="none">
          <motion.rect
            x="0" y="0" width="100%" height="100%"
            fill="none" stroke={theme.primaryColor} strokeWidth="1" opacity="0.3"
            strokeDasharray="8 4"
            animate={{ strokeDashoffset: [0, -24] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
        </svg>
      </motion.div>

      <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10">
        <motion.p
          className="tracking-[0.4em] uppercase text-xs sm:text-sm mb-8"
          style={{ color: theme.primaryColor }}
          initial={{ opacity: 0, letterSpacing: "0.1em" }}
          animate={{ opacity: 1, letterSpacing: "0.4em" }}
          transition={{ duration: 1.5 }}
        >
          {content.hero?.subtitle || "TOGETHER WITH THEIR FAMILIES"}
        </motion.p>

        <motion.h1
          className="text-6xl sm:text-8xl lg:text-9xl font-light leading-none"
          style={{ color: theme.secondaryColor }}
          initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          {bride}
        </motion.h1>

        <GoldenDivider color={theme.primaryColor} />

        <motion.h1
          className="text-6xl sm:text-8xl lg:text-9xl font-light leading-none"
          style={{ color: theme.secondaryColor }}
          initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1, delay: 0.6 }}
        >
          {groom}
        </motion.h1>

        <motion.div
          className="mt-10"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          <p className="text-lg sm:text-xl mb-1" style={{ color: theme.accentColor }}>
            {content.hero?.message || "Request the honour of your presence at the celebration of their marriage"}
          </p>
        </motion.div>

        <motion.div
          className="mt-10 relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.5 }}
        >
          <div
            className="backdrop-blur-sm rounded-xl px-10 py-5"
            style={{
              backgroundColor: withOpacity(theme.secondaryColor, 0.05),
              borderWidth: 1,
              borderStyle: "solid",
              borderColor: withOpacity(theme.primaryColor, 0.2),
            }}
          >
            <p className="tracking-[0.3em] uppercase text-xs mb-1" style={{ color: theme.primaryColor }}>Saturday</p>
            <p className="text-3xl sm:text-4xl font-light" style={{ color: theme.secondaryColor }}>June 15, 2026</p>
            <p className="tracking-[0.2em] uppercase text-xs mt-1" style={{ color: theme.primaryColor }}>at four o&apos;clock in the afternoon</p>
          </div>
          {/* Glow effect */}
          <div className="absolute -inset-4 rounded-2xl blur-xl -z-10" style={{ backgroundColor: withOpacity(theme.primaryColor, 0.05) }} />
        </motion.div>
      </motion.div>

      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 z-10"
      >
        <ChevronDown className="w-6 h-6" style={{ color: theme.primaryColor }} />
      </motion.div>
    </section>
  );

  const CountdownSection = () => (
    <section className="relative py-24 text-white text-center overflow-hidden" style={{ backgroundColor: theme.secondaryColor }}>
      <GoldParticles count={15} color={theme.primaryColor} />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="relative z-10"
      >
        <p className="tracking-[0.4em] uppercase text-xs mb-10" style={{ color: theme.primaryColor }}>Counting Down To Our Big Day</p>
        <Countdown
          targetDate={`${date}T16:00:00`}
          valueClassName="text-3xl sm:text-6xl font-light text-white"
          labelClassName="tracking-[0.3em] uppercase mt-3"
          labelStyle={{ fontSize: 10, color: theme.primaryColor }}
          boxClassName="flex flex-col items-center min-w-[60px] sm:min-w-[100px]"
          separatorClassName="text-2xl sm:text-4xl font-light mx-1 sm:mx-2 self-start"
          separatorStyle={{ color: withOpacity(theme.primaryColor, 0.2) }}
        />
      </motion.div>
    </section>
  );

  const StorySection = () => (
    <section className="py-28 px-4 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="text-center mb-20"
      >
        <p className="tracking-[0.4em] uppercase text-xs mb-4" style={{ color: theme.primaryColor }}>{content.story?.title || "Our Love Story"}</p>
        <h2 className="text-4xl sm:text-5xl font-light" style={{ color: theme.secondaryColor }}>How We Met</h2>
      </motion.div>

      {/* Vertical timeline */}
      <div className="relative">
        {/* Animated center line */}
        <motion.div
          className="absolute left-6 md:left-1/2 top-0 w-px"
          style={{ background: `linear-gradient(to bottom, ${withOpacity(theme.primaryColor, 0.5)}, ${withOpacity(theme.primaryColor, 0.3)}, transparent)` }}
          initial={{ height: 0 }}
          whileInView={{ height: "100%" }}
          viewport={{ once: true }}
          transition={{ duration: 2 }}
        />

        {[
          { year: "2019", title: "First Meeting", desc: "We met at a mutual friend's birthday party in Colombo. A shared love for Sri Lankan cricket and hoppers sparked an instant connection.", emoji: "sparkles" },
          { year: "2021", title: "Started Dating", desc: "After two years of friendship, we realized our bond was something deeper. Our first date was a sunset walk along Galle Face Green.", emoji: "heart" },
          { year: "2024", title: "The Proposal", desc: "Tharaka proposed at Sigiriya during sunrise, surrounded by the ancient beauty of our homeland. She said yes before he could finish!", emoji: "ring" },
          { year: "2026", title: "The Wedding", desc: "We are thrilled to celebrate our union with a traditional Poruwa ceremony, surrounded by family and friends we love.", emoji: "celebration" },
        ].map((event, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: i * 0.15 }}
            className={`relative flex items-center gap-4 md:gap-8 mb-16 pl-16 md:pl-0 ${i % 2 === 1 ? "md:flex-row-reverse" : ""}`}
          >
            {/* Content */}
            <div className={`flex-1 text-left ${i % 2 === 1 ? "md:text-left" : "md:text-right"}`}>
              <motion.div
                whileHover={{ scale: 1.02, y: -4 }}
                className="bg-white p-6 rounded-xl shadow-sm transition-shadow"
                style={{
                  borderWidth: 1,
                  borderStyle: "solid",
                  borderColor: withOpacity(theme.primaryColor, 0.1),
                }}
              >
                <h3 className="text-xl font-semibold mb-2" style={{ color: theme.secondaryColor }}>{event.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: theme.accentColor }}>{event.desc}</p>
              </motion.div>
            </div>

            {/* Center dot */}
            <motion.div
              className="absolute left-0 md:relative z-10 w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center text-xs md:text-sm font-bold flex-shrink-0 shadow-lg"
              style={{ backgroundColor: theme.secondaryColor, color: theme.primaryColor }}
              whileHover={{ scale: 1.2 }}
              animate={{ boxShadow: [`0 0 0 0 ${withOpacity(theme.primaryColor, 0)}`, `0 0 0 8px ${withOpacity(theme.primaryColor, 0.2)}`, `0 0 0 0 ${withOpacity(theme.primaryColor, 0)}`] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
            >
              {event.year}
            </motion.div>

            {/* Spacer */}
            <div className="flex-1 hidden md:block" />
          </motion.div>
        ))}
      </div>
    </section>
  );

  const EventsSection = () => (
    <section className="py-28 px-4" style={{ backgroundColor: withOpacity(theme.secondaryColor, 0.05) }}>
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="tracking-[0.4em] uppercase text-xs mb-4" style={{ color: theme.primaryColor }}>Wedding Events</p>
          <h2 className="text-4xl sm:text-5xl font-light" style={{ color: theme.secondaryColor }}>Ceremony Schedule</h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: Music, title: "Poruwa Ceremony", time: "4:00 PM - 5:30 PM", venue: "Grand Ballroom", desc: "Traditional Sinhalese wedding ceremony on the beautifully decorated Poruwa" },
            { icon: Heart, title: "Wedding Reception", time: "6:30 PM - 11:00 PM", venue: "Royal Garden", desc: "Dinner, dancing, and celebration with family and friends" },
            { icon: Camera, title: "After Party", time: "11:00 PM onwards", venue: "Poolside Lounge", desc: "Continue the celebration with music, drinks, and memories" },
          ].map((event, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30, rotateY: -15 }}
              whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.2 }}
              whileHover={{ y: -8, boxShadow: `0 20px 40px -12px ${withOpacity(theme.secondaryColor, 0.15)}` }}
              className="bg-white rounded-2xl p-8 text-center shadow-sm cursor-default"
              style={{
                borderWidth: 1,
                borderStyle: "solid",
                borderColor: withOpacity(theme.primaryColor, 0.1),
              }}
            >
              <motion.div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg"
                style={{ background: `linear-gradient(to bottom right, ${theme.secondaryColor}, ${lighten(theme.secondaryColor, 0.15)})` }}
                whileHover={{ rotate: 12 }}
              >
                <event.icon className="w-7 h-7" style={{ color: theme.primaryColor }} />
              </motion.div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: theme.secondaryColor }}>{event.title}</h3>
              <p className="text-sm font-medium mb-1" style={{ color: theme.primaryColor }}>{event.time}</p>
              <p className="text-sm mb-3" style={{ color: theme.accentColor }}>{event.venue}</p>
              <div className="w-8 h-px mx-auto mb-3" style={{ backgroundColor: withOpacity(theme.primaryColor, 0.3) }} />
              <p className="text-sm" style={{ color: withOpacity(theme.accentColor, 0.7) }}>{event.desc}</p>
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
          <h2 className="text-4xl sm:text-5xl font-light" style={{ color: theme.secondaryColor }}>Our Moments</h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { h: "h-64 md:h-72", span: "md:col-span-2", gradient: `linear-gradient(to bottom right, ${withOpacity(theme.primaryColor, 0.3)}, ${withOpacity(theme.secondaryColor, 0.1)}, ${withOpacity(theme.primaryColor, 0.2)})` },
            { h: "h-64 md:h-72", span: "", gradient: `linear-gradient(to bottom right, ${withOpacity(theme.secondaryColor, 0.2)}, ${withOpacity(theme.primaryColor, 0.2)})` },
            { h: "h-56", span: "", gradient: `linear-gradient(to bottom right, ${withOpacity(theme.accentColor, 0.2)}, ${withOpacity(theme.primaryColor, 0.3)})` },
            { h: "h-56", span: "", gradient: `linear-gradient(to bottom right, ${withOpacity(theme.primaryColor, 0.25)}, ${withOpacity(theme.accentColor, 0.15)})` },
            { h: "h-56", span: "md:col-span-1", gradient: `linear-gradient(to bottom right, ${withOpacity(theme.secondaryColor, 0.25)}, ${withOpacity(theme.primaryColor, 0.15)})` },
            { h: "h-64 md:h-72", span: "col-span-2 md:col-span-3", gradient: `linear-gradient(to bottom right, ${withOpacity(theme.primaryColor, 0.15)}, ${withOpacity(theme.secondaryColor, 0.1)}, ${withOpacity(theme.primaryColor, 0.2)})` },
          ].map((img, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.85 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              whileHover={{ scale: 1.03 }}
              className={`${img.h} ${img.span} rounded-2xl overflow-hidden flex items-center justify-center cursor-pointer group relative`}
              style={{ background: img.gradient }}
            >
              <Camera className="w-8 h-8 group-hover:scale-110 transition-transform" style={{ color: withOpacity(theme.secondaryColor, 0.2) }} />
              <div className="absolute inset-0 group-hover:opacity-100 opacity-0 transition-opacity rounded-2xl" style={{ backgroundColor: withOpacity(theme.secondaryColor, 0.1) }} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );

  const VenueSection = () => (
    <section className="py-28 px-4" style={{ backgroundColor: withOpacity(theme.secondaryColor, 0.05) }}>
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="tracking-[0.4em] uppercase text-xs mb-4" style={{ color: theme.primaryColor }}>Location</p>
          <h2 className="text-4xl sm:text-5xl font-light mb-4" style={{ color: theme.secondaryColor }}>Wedding Venue</h2>
          <div className="flex items-center justify-center gap-2 mb-2">
            <MapPin className="w-5 h-5" style={{ color: theme.primaryColor }} />
            <h3 className="text-xl font-semibold" style={{ color: theme.secondaryColor }}>{venue}</h3>
          </div>
          <p className="mb-10" style={{ color: theme.accentColor }}>{venueAddr}</p>
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="rounded-2xl h-72 sm:h-80 flex items-center justify-center shadow-inner"
            style={{
              background: `linear-gradient(to bottom right, ${withOpacity(theme.primaryColor, 0.1)}, ${withOpacity(theme.secondaryColor, 0.1)})`,
              borderWidth: 1,
              borderStyle: "solid",
              borderColor: withOpacity(theme.primaryColor, 0.1),
            }}
          >
            <div className="text-center">
              <MapPin className="w-12 h-12 mx-auto mb-3" style={{ color: withOpacity(theme.primaryColor, 0.4) }} />
              <p className="text-sm" style={{ color: withOpacity(theme.accentColor, 0.5) }}>Interactive Map</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );

  const RsvpSection = () => (
    <section className="relative py-28 text-white px-4 overflow-hidden" style={{ backgroundColor: theme.secondaryColor }}>
      <GoldParticles count={12} color={theme.primaryColor} />
      <div className="max-w-lg mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="tracking-[0.4em] uppercase text-xs mb-4" style={{ color: theme.primaryColor }}>RSVP</p>
          <h2 className="text-4xl sm:text-5xl font-light mb-4">{content.rsvp?.title || "Will You Join Us?"}</h2>
          <p className="mb-12 text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>{content.rsvp?.deadline || "Kindly respond by May 15, 2026"}</p>

          {rsvpSent ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="backdrop-blur-sm rounded-2xl p-10"
              style={{
                backgroundColor: "rgba(255,255,255,0.1)",
                borderWidth: 1,
                borderStyle: "solid",
                borderColor: withOpacity(theme.primaryColor, 0.2),
              }}
            >
              <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
                <Heart className="w-14 h-14 mx-auto mb-4" style={{ color: theme.primaryColor, fill: theme.primaryColor }} />
              </motion.div>
              <p className="text-2xl font-light">Thank you!</p>
              <p className="mt-2" style={{ color: "rgba(255,255,255,0.5)" }}>We look forward to celebrating with you.</p>
            </motion.div>
          ) : (
            <motion.form
              onSubmit={(e) => { e.preventDefault(); setRsvpSent(true); }}
              className="space-y-4 text-left"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              {[
                { type: "text", placeholder: "Your Full Name", required: true },
                { type: "email", placeholder: "Email Address" },
              ].map((input, idx) => (
                <motion.input
                  key={idx}
                  type={input.type}
                  placeholder={input.placeholder}
                  required={input.required}
                  whileFocus={{ borderColor: theme.primaryColor, boxShadow: `0 0 20px ${withOpacity(theme.primaryColor, 0.15)}` }}
                  className="w-full px-5 py-4 rounded-xl text-white placeholder:text-white/30 focus:outline-none transition-all backdrop-blur-sm"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.05)",
                    borderWidth: 1,
                    borderStyle: "solid",
                    borderColor: withOpacity(theme.primaryColor, 0.2),
                  }}
                />
              ))}
              <select
                className="w-full px-5 py-4 rounded-xl text-white/80 focus:outline-none backdrop-blur-sm"
                style={{
                  backgroundColor: "rgba(255,255,255,0.05)",
                  borderWidth: 1,
                  borderStyle: "solid",
                  borderColor: withOpacity(theme.primaryColor, 0.2),
                }}
              >
                <option value="" className="text-gray-900">Will you attend?</option>
                <option value="yes" className="text-gray-900">Joyfully Accept</option>
                <option value="no" className="text-gray-900">Respectfully Decline</option>
              </select>
              <select
                className="w-full px-5 py-4 rounded-xl text-white/80 focus:outline-none backdrop-blur-sm"
                style={{
                  backgroundColor: "rgba(255,255,255,0.05)",
                  borderWidth: 1,
                  borderStyle: "solid",
                  borderColor: withOpacity(theme.primaryColor, 0.2),
                }}
              >
                <option value="" className="text-gray-900">Number of Guests</option>
                {[1, 2, 3, 4].map(n => <option key={n} value={n} className="text-gray-900">{n} {n === 1 ? "Guest" : "Guests"}</option>)}
              </select>
              <textarea
                placeholder="Any dietary requirements or message..."
                rows={3}
                className="w-full px-5 py-4 rounded-xl text-white placeholder:text-white/30 focus:outline-none resize-none backdrop-blur-sm"
                style={{
                  backgroundColor: "rgba(255,255,255,0.05)",
                  borderWidth: 1,
                  borderStyle: "solid",
                  borderColor: withOpacity(theme.primaryColor, 0.2),
                }}
              />
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02, boxShadow: `0 0 30px ${withOpacity(theme.primaryColor, 0.3)}` }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 rounded-xl font-semibold tracking-wider uppercase text-sm shadow-lg"
                style={{
                  background: `linear-gradient(to right, ${theme.primaryColor}, ${lighten(theme.primaryColor, 0.15)})`,
                  color: theme.textColor,
                }}
              >
                Send RSVP
              </motion.button>
            </motion.form>
          )}
        </motion.div>
      </div>
    </section>
  );

  const FooterSection = () => (
    <footer className="py-14 text-center px-4" style={{ backgroundColor: theme.backgroundColor }}>
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}>
          <Heart className="w-6 h-6 mx-auto mb-4" style={{ color: theme.primaryColor, fill: theme.primaryColor }} />
        </motion.div>
        <p className="text-xl font-light mb-2" style={{ color: theme.secondaryColor }}>{bride} & {groom}</p>
        <p className="text-sm mb-8" style={{ color: theme.accentColor }}>June 15, 2026 &middot; Colombo, Sri Lanka</p>
        <div className="flex items-center justify-center gap-4 mb-8">
          {[Phone, Mail].map((Icon, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.15, borderColor: theme.primaryColor }}
              className="w-11 h-11 rounded-full flex items-center justify-center cursor-pointer transition-colors"
              style={{
                borderWidth: 1,
                borderStyle: "solid",
                borderColor: withOpacity(theme.primaryColor, 0.3),
              }}
            >
              <Icon className="w-4 h-4" style={{ color: theme.primaryColor }} />
            </motion.div>
          ))}
        </div>
        <p className="text-xs" style={{ color: withOpacity(theme.accentColor, 0.4) }}>
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
