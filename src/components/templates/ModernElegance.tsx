"use client";

import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowDown, MapPin } from "lucide-react";
import Countdown from "./shared/Countdown";
import { useState, useRef } from "react";
import type { InvitationData } from "@/types/invitation";
import { deepMerge } from "@/lib/deep-merge";
import { withOpacity } from "@/lib/with-opacity";
import type { TemplateConfig, ThemeConfig } from "@/types/template-config";
import { DEFAULT_SECTIONS } from "@/types/template-config";

export const DEFAULT_CONFIG: TemplateConfig = {
  theme: {
    primaryColor: "#c5a47e",
    secondaryColor: "#2d2d2d",
    backgroundColor: "#faf8f5",
    textColor: "#3d3d3d",
    accentColor: "#8a9a7b",
    fontFamily: "serif",
  },
  sections: [...DEFAULT_SECTIONS],
  content: {
    hero: { subtitle: "We're Getting Married" },
    rsvp: { title: "RSVP", deadline: "" },
    footer: { message: "" },
  },
};

/* ── Modern Envelope Intro Screen ── */
function EnvelopeIntro({ onOpen, primaryColor, textColor, bgColor, bride, groom }: {
  onOpen: () => void; primaryColor: string; textColor: string; bgColor: string; bride: string; groom: string;
}) {
  const [opening, setOpening] = useState(false);

  const handleClick = () => {
    setOpening(true);
    setTimeout(onOpen, 1400);
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center cursor-pointer overflow-hidden"
      style={{ background: `linear-gradient(160deg, ${bgColor} 0%, ${withOpacity(primaryColor, 0.08)} 50%, ${bgColor} 100%)`, backgroundColor: bgColor }}
      onClick={handleClick}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      {/* Background glow orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div className="absolute rounded-full blur-3xl" style={{ width: 400, height: 400, top: "10%", left: "-10%", background: withOpacity(primaryColor, 0.06) }}
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }} transition={{ duration: 8, repeat: Infinity }} />
        <motion.div className="absolute rounded-full blur-3xl" style={{ width: 300, height: 300, bottom: "10%", right: "-5%", background: withOpacity(primaryColor, 0.08) }}
          animate={{ x: [0, -20, 0], y: [0, 30, 0] }} transition={{ duration: 10, repeat: Infinity }} />
      </div>

      {/* Main card */}
      <motion.div
        className="relative z-10"
        animate={opening ? { scale: 0.85, y: -60, opacity: 0 } : {}}
        transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* Glass card */}
        <motion.div
          className="relative rounded-3xl overflow-hidden"
          style={{
            width: 300, padding: "48px 32px",
            background: bgColor,
            border: `1px solid ${withOpacity(primaryColor, 0.15)}`,
            boxShadow: `0 8px 40px ${withOpacity(primaryColor, 0.1)}, 0 0 80px ${withOpacity(primaryColor, 0.05)}`,
          }}
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          {/* Top accent line */}
          <motion.div
            className="absolute top-0 left-1/2 -translate-x-1/2 h-px"
            style={{ background: `linear-gradient(to right, transparent, ${primaryColor}, transparent)` }}
            initial={{ width: 0 }}
            animate={{ width: 120 }}
            transition={{ duration: 1.5, delay: 0.5 }}
          />

          <div className="text-center">
            {/* Monogram circle */}
            <motion.div
              className="mx-auto rounded-full flex items-center justify-center mb-8"
              style={{
                width: 72, height: 72,
                border: `1.5px solid ${withOpacity(primaryColor, 0.3)}`,
                background: withOpacity(primaryColor, 0.05),
              }}
              animate={opening ? { scale: 1.2, opacity: 0 } : { boxShadow: [`0 0 0px ${withOpacity(primaryColor, 0)}`, `0 0 30px ${withOpacity(primaryColor, 0.15)}`, `0 0 0px ${withOpacity(primaryColor, 0)}`] }}
              transition={opening ? { duration: 0.5 } : { duration: 3, repeat: Infinity }}
            >
              <span style={{ fontSize: 22, color: primaryColor, fontFamily: "serif", fontWeight: 300, letterSpacing: 2 }}>
                {bride.charAt(0)}<span style={{ fontSize: 14, opacity: 0.5 }}>&</span>{groom.charAt(0)}
              </span>
            </motion.div>

            <p className="text-[10px] tracking-[0.4em] uppercase mb-6" style={{ color: withOpacity(textColor, 0.35) }}>
              You&apos;re Invited To
            </p>

            <p className="text-3xl sm:text-4xl font-light mb-1" style={{ color: textColor, fontFamily: "serif" }}>
              {bride}
            </p>
            <p className="text-lg mb-1" style={{ color: primaryColor, fontFamily: "serif" }}>&</p>
            <p className="text-3xl sm:text-4xl font-light" style={{ color: textColor, fontFamily: "serif" }}>
              {groom}
            </p>

            {/* Divider */}
            <div className="flex items-center justify-center gap-3 my-8">
              <div className="w-8 h-px" style={{ background: withOpacity(primaryColor, 0.25) }} />
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: withOpacity(primaryColor, 0.4) }} />
              <div className="w-8 h-px" style={{ background: withOpacity(primaryColor, 0.25) }} />
            </div>

            {/* CTA */}
            <motion.div
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full"
              style={{
                border: `1px solid ${withOpacity(primaryColor, 0.25)}`,
                background: withOpacity(primaryColor, 0.05),
              }}
              animate={{ boxShadow: [`0 0 0px ${withOpacity(primaryColor, 0)}`, `0 0 20px ${withOpacity(primaryColor, 0.1)}`, `0 0 0px ${withOpacity(primaryColor, 0)}`] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            >
              <span className="text-[11px] tracking-[0.25em] uppercase" style={{ color: withOpacity(primaryColor, 0.7) }}>
                Open Invitation
              </span>
              <motion.span
                style={{ color: primaryColor, fontSize: 14 }}
                animate={{ y: [0, 3, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                ↓
              </motion.span>
            </motion.div>
          </div>

          {/* Bottom accent line */}
          <motion.div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 h-px"
            style={{ background: `linear-gradient(to right, transparent, ${primaryColor}, transparent)` }}
            initial={{ width: 0 }}
            animate={{ width: 120 }}
            transition={{ duration: 1.5, delay: 0.7 }}
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

/* ── Floating gold sparkle particles ── */
function Sparkles({ color = "#c5a47e" }: { color?: string }) {
  const dots = [
    { left: "20%", delay: 0, dur: 7, drift: 40 },
    { left: "55%", delay: 2, dur: 9, drift: -30 },
    { left: "75%", delay: 4, dur: 8, drift: 25 },
    { left: "40%", delay: 1.5, dur: 10, drift: -45 },
  ];
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {dots.map((d, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: 4, height: 4, left: d.left, top: "60%",
            background: color,
            boxShadow: `0 0 8px 2px ${withOpacity(color, 0.5)}`,
          }}
          animate={{ y: [0, -200], x: [0, d.drift], opacity: [0, 1, 1, 0] }}
          transition={{ duration: d.dur, repeat: Infinity, delay: d.delay, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

/* ── Diamond ornament ── */
function Diamond({ color = "#c5a47e" }: { color?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 my-6">
      <div className="w-12 h-px" style={{ background: `linear-gradient(to right, transparent, ${withOpacity(color, 0.4)})` }} />
      <div className="w-2 h-2 rotate-45" style={{ border: `1px solid ${withOpacity(color, 0.6)}` }} />
      <div className="w-12 h-px" style={{ background: `linear-gradient(to left, transparent, ${withOpacity(color, 0.4)})` }} />
    </div>
  );
}

/* ── Section fade-in wrapper ── */
function FadeIn({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.8, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function ModernElegance({ data, config }: { data?: InvitationData; config?: TemplateConfig } = {}) {
  const merged = deepMerge(DEFAULT_CONFIG as Record<string, unknown>, (config || {}) as Record<string, unknown>) as TemplateConfig;
  const theme = merged.theme as ThemeConfig;

  const groom = data?.groomName || "Groom";
  const bride = data?.brideName || "Bride";
  const date = data?.weddingDate || "2026-06-15";
  const time = data?.weddingTime || "2:30 PM";
  const venue = data?.venue || "The Grand Estate";
  const venueAddr = data?.venueAddress || "123 Wedding Lane";
  const events = data?.events || [
    { title: "Arrival", time: "2:00 PM" },
    { title: "Ceremony", time: "2:30 PM" },
    { title: "Cocktails", time: "4:00 PM" },
    { title: "Dinner", time: "6:00 PM" },
    { title: "Party", time: "9:00 PM" },
  ];

  const [isOpen, setIsOpen] = useState(false);
  const [rsvpSent, setRsvpSent] = useState(false);
  const [guests, setGuests] = useState(1);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.6], [1, 0.97]);

  const dateObj = new Date(date + "T00:00:00");
  const formattedDate = dateObj.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }).toUpperCase();

  return (
    <div className="overflow-hidden" style={{ backgroundColor: theme.backgroundColor, color: theme.textColor, fontFamily: theme.fontFamily }}>

      {/* ═══ ENVELOPE INTRO ═══ */}
      {!isOpen ? (
        <EnvelopeIntro
          onOpen={() => setIsOpen(true)}
          primaryColor={theme.primaryColor}
          textColor={theme.textColor}
          bgColor={theme.backgroundColor}
          bride={bride}
          groom={groom}
        />
      ) : null}

      <div style={{ display: isOpen ? "block" : "none" }}>
      {/* ═══ HERO ═══ */}
      <section ref={heroRef} className="min-h-screen flex flex-col items-center justify-center text-center px-4 relative">
        <Sparkles color={theme.primaryColor} />
        <motion.div style={{ opacity: heroOpacity, scale: heroScale }} className="relative z-10">
          <motion.p
            className="text-xs sm:text-sm tracking-[0.5em] uppercase mb-12 sm:mb-16"
            style={{ color: withOpacity(theme.textColor, 0.5) }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            We&apos;re Getting Married
          </motion.p>

          <motion.h1
            className="text-5xl sm:text-8xl font-light tracking-tight leading-none"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
          >
            {bride}
          </motion.h1>

          <motion.span
            className="block text-2xl sm:text-3xl font-light my-3 sm:my-5"
            style={{ color: theme.primaryColor }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 1.2 }}
          >
            &amp;
          </motion.span>

          <motion.h1
            className="text-5xl sm:text-8xl font-light tracking-tight leading-none"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1 }}
          >
            {groom}
          </motion.h1>

          {/* Gold line divider */}
          <div className="flex justify-center my-10 sm:my-14">
            <motion.div
              className="h-px w-0"
              style={{ backgroundColor: theme.primaryColor }}
              animate={{ width: 80 }}
              transition={{ duration: 1.2, delay: 1.5 }}
            />
          </div>

          <motion.p
            className="text-xs sm:text-sm tracking-[0.4em] uppercase"
            style={{ color: withOpacity(theme.textColor, 0.5) }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8 }}
          >
            {formattedDate}
          </motion.p>
        </motion.div>

        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2.5, repeat: Infinity }}
          className="absolute bottom-10"
        >
          <ArrowDown className="w-4 h-4" style={{ color: withOpacity(theme.textColor, 0.3) }} />
        </motion.div>
      </section>

      {/* ═══ WELCOME ═══ */}
      <section className="py-24 sm:py-32 px-4 text-center">
        <FadeIn className="max-w-xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-light italic mb-8" style={{ color: theme.textColor }}>
            Welcome
          </h2>
          <p className="text-base sm:text-lg leading-relaxed italic font-light" style={{ color: withOpacity(theme.textColor, 0.6) }}>
            With joyful hearts, we invite you to celebrate the beginning of our forever.
            Your presence would mean the world to us as we join our lives in love and laughter.
          </p>
          <Diamond color={theme.primaryColor} />
        </FadeIn>
      </section>

      {/* ═══ COUNTDOWN ═══ */}
      <section className="py-20 sm:py-28 text-center" style={{ backgroundColor: withOpacity(theme.primaryColor, 0.08) }}>
        <FadeIn>
          <p className="text-xs tracking-[0.5em] uppercase mb-10" style={{ color: withOpacity(theme.textColor, 0.5) }}>
            Counting Down
          </p>
          <Countdown
            targetDate={`${date}T${time.includes("PM") ? (parseInt(time) + 12) % 24 : parseInt(time)}:${time.split(":")[1]?.replace(/\s*(AM|PM)/i, "") || "00"}:00`}
            valueClassName="text-4xl sm:text-6xl font-light"
            valueStyle={{ color: theme.textColor }}
            labelClassName="text-[9px] sm:text-[10px] tracking-[0.4em] uppercase mt-3"
            labelStyle={{ color: withOpacity(theme.textColor, 0.4) }}
            boxClassName="flex flex-col items-center min-w-[60px] sm:min-w-[100px]"
            separatorClassName="text-2xl sm:text-3xl font-light mx-2 sm:mx-4 self-start"
            separatorStyle={{ color: theme.primaryColor }}
          />
        </FadeIn>
      </section>

      {/* ═══ VENUE ═══ */}
      <section className="relative py-28 sm:py-36 px-4 text-center overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${withOpacity(theme.secondaryColor, 0.9)} 0%, ${withOpacity(theme.accentColor, 0.85)} 50%, ${withOpacity(theme.primaryColor, 0.8)} 100%)`,
          }}
        />
        <FadeIn className="relative z-10 max-w-2xl mx-auto">
          <p className="text-xs tracking-[0.5em] uppercase mb-6" style={{ color: withOpacity("#faf8f5", 0.6) }}>
            The Venue
          </p>
          <h2 className="text-3xl sm:text-5xl font-light mb-6" style={{ color: "#faf8f5" }}>
            {venue}
          </h2>
          <p className="text-sm sm:text-base mb-2" style={{ color: withOpacity("#faf8f5", 0.8) }}>
            {formattedDate} &middot; {time}
          </p>
          <p className="text-sm mb-10" style={{ color: withOpacity("#faf8f5", 0.6) }}>
            {venueAddr}
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-2 px-6 py-3 text-xs tracking-[0.3em] uppercase border rounded-none"
            style={{ color: "#faf8f5", borderColor: withOpacity("#faf8f5", 0.4) }}
          >
            <MapPin className="w-3.5 h-3.5" /> Open in Maps
          </motion.button>
        </FadeIn>
      </section>

      {/* ═══ DAY PROGRAMME / TIMELINE ═══ */}
      <section className="py-24 sm:py-32 px-4" style={{ backgroundColor: theme.backgroundColor }}>
        <FadeIn className="text-center mb-16">
          <p className="text-xs tracking-[0.5em] uppercase mb-4" style={{ color: withOpacity(theme.textColor, 0.5) }}>
            Day Programme
          </p>
          <div className="w-12 h-px mx-auto" style={{ backgroundColor: theme.primaryColor }} />
        </FadeIn>

        <div className="max-w-3xl mx-auto relative">
          {/* Centre gold line (desktop) */}
          <div className="hidden sm:block absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2" style={{ backgroundColor: withOpacity(theme.primaryColor, 0.3) }} />
          {/* Left gold line (mobile) */}
          <div className="sm:hidden absolute left-6 top-0 bottom-0 w-px" style={{ backgroundColor: withOpacity(theme.primaryColor, 0.3) }} />

          {events.map((evt, i) => {
            const isLeft = i % 2 === 0;
            return (
              <FadeIn key={i} delay={i * 0.1} className="relative mb-12 last:mb-0">
                {/* Desktop: alternating */}
                <div className="hidden sm:flex items-center">
                  <div className={`w-1/2 ${isLeft ? "pr-12 text-right" : "pl-12 text-left order-2"}`}>
                    <p className="text-xs tracking-[0.3em] uppercase mb-1" style={{ color: theme.primaryColor }}>{evt.time}</p>
                    <h3 className="text-lg font-light" style={{ color: theme.textColor }}>{evt.title}</h3>
                  </div>
                  <div className="absolute left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full border-2" style={{ borderColor: theme.primaryColor, backgroundColor: theme.backgroundColor }} />
                  <div className="w-1/2" />
                </div>
                {/* Mobile: single column */}
                <div className="sm:hidden flex items-start pl-14">
                  <div className="absolute left-6 -translate-x-1/2 w-2.5 h-2.5 rounded-full border-2 mt-1" style={{ borderColor: theme.primaryColor, backgroundColor: theme.backgroundColor }} />
                  <div>
                    <p className="text-xs tracking-[0.3em] uppercase mb-1" style={{ color: theme.primaryColor }}>{evt.time}</p>
                    <h3 className="text-base font-light" style={{ color: theme.textColor }}>{evt.title}</h3>
                  </div>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </section>

      {/* ═══ RSVP ═══ */}
      <section className="py-24 sm:py-32 px-4" style={{ backgroundColor: theme.secondaryColor }}>
        <FadeIn className="max-w-md mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-light mb-3" style={{ color: "#faf8f5" }}>RSVP</h2>
          <p className="text-sm mb-12" style={{ color: withOpacity("#faf8f5", 0.5) }}>
            Let us know if you can make it
          </p>

          {rsvpSent ? (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-lg font-light" style={{ color: "#faf8f5" }}>
              Thank you for your response.
            </motion.p>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); setRsvpSent(true); }} className="space-y-6 text-left">
              <input
                type="text" placeholder="Your Name" required
                className="w-full bg-transparent border-b py-3 text-sm focus:outline-none placeholder:opacity-40"
                style={{ color: "#faf8f5", borderColor: withOpacity("#faf8f5", 0.2) }}
              />
              <input
                type="email" placeholder="Email Address"
                className="w-full bg-transparent border-b py-3 text-sm focus:outline-none placeholder:opacity-40"
                style={{ color: "#faf8f5", borderColor: withOpacity("#faf8f5", 0.2) }}
              />
              <select
                className="w-full bg-transparent border-b py-3 text-sm focus:outline-none appearance-none"
                style={{ color: withOpacity("#faf8f5", 0.7), borderColor: withOpacity("#faf8f5", 0.2) }}
              >
                <option value="" style={{ color: "#333" }}>Attendance</option>
                <option value="yes" style={{ color: "#333" }}>Joyfully Accept</option>
                <option value="no" style={{ color: "#333" }}>Regretfully Decline</option>
              </select>

              {/* Guest stepper */}
              <div className="flex items-center justify-between border-b py-3" style={{ borderColor: withOpacity("#faf8f5", 0.2) }}>
                <span className="text-sm" style={{ color: withOpacity("#faf8f5", 0.7) }}>Number of Guests</span>
                <div className="flex items-center gap-4">
                  <button type="button" onClick={() => setGuests(Math.max(1, guests - 1))} className="w-7 h-7 rounded-full border text-sm" style={{ color: "#faf8f5", borderColor: withOpacity("#faf8f5", 0.3) }}>-</button>
                  <span className="text-sm w-4 text-center" style={{ color: "#faf8f5" }}>{guests}</span>
                  <button type="button" onClick={() => setGuests(Math.min(10, guests + 1))} className="w-7 h-7 rounded-full border text-sm" style={{ color: "#faf8f5", borderColor: withOpacity("#faf8f5", 0.3) }}>+</button>
                </div>
              </div>

              <textarea
                placeholder="Dietary Requirements" rows={2}
                className="w-full bg-transparent border-b py-3 text-sm focus:outline-none placeholder:opacity-40 resize-none"
                style={{ color: "#faf8f5", borderColor: withOpacity("#faf8f5", 0.2) }}
              />
              <textarea
                placeholder="Leave a Message" rows={2}
                className="w-full bg-transparent border-b py-3 text-sm focus:outline-none placeholder:opacity-40 resize-none"
                style={{ color: "#faf8f5", borderColor: withOpacity("#faf8f5", 0.2) }}
              />

              <motion.button
                type="submit"
                whileHover={{ scale: 1.02, backgroundColor: withOpacity(theme.primaryColor, 0.9) }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 text-xs tracking-[0.4em] uppercase mt-4"
                style={{ backgroundColor: theme.primaryColor, color: "#faf8f5" }}
              >
                Send RSVP
              </motion.button>
            </form>
          )}
        </FadeIn>
      </section>

      {/* ═══ FOOTER ═══ */}
      <section className="py-20 sm:py-24 px-4 text-center" style={{ backgroundColor: theme.backgroundColor }}>
        <FadeIn>
          <h3 className="text-2xl sm:text-3xl font-light tracking-wider mb-3" style={{ color: theme.textColor }}>
            {bride} &amp; {groom}
          </h3>
          <p className="text-xs tracking-[0.4em] uppercase mb-8" style={{ color: withOpacity(theme.textColor, 0.4) }}>
            {formattedDate}
          </p>
          <p className="text-[10px] tracking-[0.2em] uppercase" style={{ color: withOpacity(theme.textColor, 0.3) }}>
            Created with <span className="text-red-400">&hearts;</span> by{" "}
            <Link href="/" className="hover:opacity-70 transition-opacity">INVITATION.LK</Link>
          </p>
        </FadeIn>
      </section>
      </div>
    </div>
  );
}
