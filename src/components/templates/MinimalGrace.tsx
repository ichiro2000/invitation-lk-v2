"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { Heart, MapPin, Mail, Phone, Camera, ArrowDown } from "lucide-react";
import Countdown from "./shared/Countdown";
import { useState, useRef } from "react";

/* ── Dramatic text reveal animation ── */
function RevealText({ children, delay = 0, className = "" }: { children: string; delay?: number; className?: string }) {
  return (
    <motion.div className={`overflow-hidden ${className}`}>
      <motion.div
        initial={{ y: "110%" }}
        animate={{ y: 0 }}
        transition={{ duration: 1.2, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

/* ── Thin decorative diamond ornament ── */
function DiamondOrnament({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`}>
      <div className="w-16 h-px bg-gradient-to-r from-transparent to-stone-300" />
      <div className="w-2 h-2 border border-stone-400 rotate-45" />
      <div className="w-16 h-px bg-gradient-to-l from-transparent to-stone-300" />
    </div>
  );
}


export default function MinimalGrace() {
  const [rsvpSent, setRsvpSent] = useState(false);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.6], [1, 0.95]);

  return (
    <div className="text-gray-900 font-sans overflow-hidden" style={{ backgroundColor: "#faf9f6" }}>
      {/* ═══ HERO — Split screen reveal ═══ */}
      <section ref={heroRef} className="min-h-screen flex flex-col items-center justify-center text-center px-4 relative">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: "linear-gradient(#c5c0b8 1px, transparent 1px), linear-gradient(90deg, #c5c0b8 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }} />

        <motion.div style={{ opacity: heroOpacity, scale: heroScale }} className="relative z-10">
          <motion.p
            className="text-stone-500 text-[10px] tracking-[0.7em] uppercase mb-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2, delay: 1.5 }}
          >
            The Wedding Of
          </motion.p>

          <RevealText delay={0.3} className="text-7xl sm:text-9xl lg:text-[10rem] font-extralight tracking-tight text-gray-900 leading-none">
            Amaya
          </RevealText>

          <motion.p
            className="text-stone-400 text-5xl font-extralight my-4"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 1, type: "spring" }}
          >
            &amp;
          </motion.p>

          <RevealText delay={0.6} className="text-7xl sm:text-9xl lg:text-[10rem] font-extralight tracking-tight text-gray-900 leading-none">
            Ruwan
          </RevealText>

          {/* Animated vertical line */}
          <div className="flex justify-center my-14">
            <motion.div
              className="w-px bg-stone-300"
              initial={{ height: 0 }}
              animate={{ height: 80 }}
              transition={{ duration: 1.5, delay: 1.2 }}
            />
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
          >
            <p className="text-stone-500 text-sm tracking-[0.4em]">
              12 &middot; 09 &middot; 2026
            </p>
            <p className="text-stone-400 text-[10px] tracking-[0.5em] mt-3">
              KANDY, SRI LANKA
            </p>
          </motion.div>
        </motion.div>

        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute bottom-10"
        >
          <ArrowDown className="w-4 h-4 text-stone-400" />
        </motion.div>
      </section>

      {/* ═══ COUNTDOWN — Ultra clean ═══ */}
      <section className="py-24 border-y border-stone-200 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          <DiamondOrnament className="mb-10" />
          <Countdown
            targetDate="2026-09-12T10:00:00"
            valueClassName="text-6xl sm:text-7xl font-extralight text-gray-900"
            labelClassName="text-[9px] text-stone-500 tracking-[0.4em] uppercase mt-4"
            boxClassName="flex flex-col items-center min-w-[80px] sm:min-w-[110px]"
            separatorClassName="text-4xl font-extralight text-stone-300 mx-4 self-start"
          />
          <DiamondOrnament className="mt-10" />
        </motion.div>
      </section>

      {/* ═══ STORY — Cinematic paragraphs ═══ */}
      <section className="py-36 px-4 max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <motion.p
            className="text-stone-500 text-[10px] tracking-[0.7em] uppercase mb-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Our Story
          </motion.p>

          <motion.p
            className="text-gray-600 text-xl sm:text-2xl leading-loose font-extralight"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            Sometimes the simplest moments hold the deepest meaning. Amaya and Ruwan found each other in the quiet corridors of the Kandy Public Library. She was reading Neruda; he was looking for Chekhov.
          </motion.p>

          <motion.div
            className="w-px h-16 bg-stone-300 mx-auto my-14"
            initial={{ height: 0 }}
            whileInView={{ height: 64 }}
            viewport={{ once: true }}
          />

          <motion.p
            className="text-gray-600 text-xl sm:text-2xl leading-loose font-extralight"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            Their hands reached for the same shelf, and in that small, unremarkable moment, everything changed. Five years later, they still share books, morning tea overlooking the hills, and an unshakeable certainty that they were meant to find each other.
          </motion.p>
        </motion.div>
      </section>

      {/* ═══ EVENTS — Clean list with animated lines ═══ */}
      <section className="py-28 px-4" style={{ backgroundColor: "#f5f4f0" }}>
        <div className="max-w-2xl mx-auto">
          <motion.p
            className="text-stone-500 text-[10px] tracking-[0.7em] uppercase text-center mb-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Schedule
          </motion.p>
          <DiamondOrnament className="mb-14" />

          <div className="space-y-0">
            {[
              { time: "10:00 AM", title: "Church Ceremony", venue: "Trinity College Chapel, Kandy" },
              { time: "12:30 PM", title: "Lunch Reception", venue: "The Radh Hotel, Peradeniya Road" },
              { time: "4:00 PM", title: "Garden Party", venue: "Royal Botanical Gardens" },
              { time: "7:00 PM", title: "Dinner & Dancing", venue: "The Radh Hotel, Grand Hall" },
            ].map((event, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                whileHover={{ x: 8, backgroundColor: "rgba(0,0,0,0.02)" }}
                className="flex items-baseline gap-8 py-7 border-b border-stone-200 cursor-default transition-all"
              >
                <span className="text-stone-500 text-sm font-light w-24 flex-shrink-0 tracking-wider">{event.time}</span>
                <div>
                  <h3 className="text-gray-900 font-medium text-lg">{event.title}</h3>
                  <p className="text-stone-500 text-sm mt-1">{event.venue}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ GALLERY — Minimal grid ═══ */}
      <section className="py-28 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.p
            className="text-stone-500 text-[10px] tracking-[0.7em] uppercase text-center mb-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Gallery
          </motion.p>
          <DiamondOrnament className="mb-14" />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                whileHover={{ scale: 1.03, zIndex: 10 }}
                className={`${i === 0 || i === 7 ? "col-span-2 aspect-[2/1]" : "aspect-square"} flex items-center justify-center cursor-pointer group border border-stone-200`}
                style={{ backgroundColor: "#f5f4f0" }}
              >
                <Camera className="w-5 h-5 text-stone-300 group-hover:text-stone-500 transition-colors" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ VENUE ═══ */}
      <section className="py-28 px-4" style={{ backgroundColor: "#f5f4f0" }}>
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <p className="text-stone-500 text-[10px] tracking-[0.7em] uppercase mb-10">Venue</p>
            <h2 className="text-2xl sm:text-3xl font-extralight text-gray-900 mb-2">Trinity College Chapel</h2>
            <p className="text-stone-500 text-sm mb-12">Chapel Road, Kandy, Sri Lanka</p>
            <div className="h-64 sm:h-72 flex items-center justify-center border border-stone-200" style={{ backgroundColor: "#eeede8" }}>
              <MapPin className="w-6 h-6 text-stone-400" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ RSVP — Ultra minimal form ═══ */}
      <section className="py-36 px-4">
        <div className="max-w-sm mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-stone-500 text-[10px] tracking-[0.7em] uppercase mb-10">RSVP</p>
            <h2 className="text-3xl font-extralight text-gray-900 mb-4">Will you join us?</h2>
            <DiamondOrnament className="mb-12" />

            {rsvpSent ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: 2 }}
                >
                  <Heart className="w-8 h-8 text-stone-400 mx-auto mb-6" />
                </motion.div>
                <p className="text-gray-600 font-extralight text-lg">Thank you for your response.</p>
              </motion.div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setRsvpSent(true); }} className="space-y-8">
                <motion.input
                  type="text" placeholder="Name" required
                  whileFocus={{ borderColor: "#111" }}
                  className="w-full border-b border-stone-300 py-4 text-center text-sm focus:outline-none bg-transparent transition-colors text-gray-800 placeholder:text-stone-400"
                />
                <motion.input
                  type="email" placeholder="Email"
                  whileFocus={{ borderColor: "#111" }}
                  className="w-full border-b border-stone-300 py-4 text-center text-sm focus:outline-none bg-transparent transition-colors text-gray-800 placeholder:text-stone-400"
                />
                <div className="flex gap-8 justify-center py-2">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="radio" name="attending" value="yes" className="accent-gray-900 w-4 h-4" />
                    <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">Accept</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="radio" name="attending" value="no" className="accent-gray-900 w-4 h-4" />
                    <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">Decline</span>
                  </label>
                </div>
                <motion.input
                  type="number" min="1" max="4" placeholder="Guests"
                  whileFocus={{ borderColor: "#111" }}
                  className="w-full border-b border-stone-300 py-4 text-center text-sm focus:outline-none bg-transparent transition-colors text-gray-800 placeholder:text-stone-400"
                />
                <motion.button
                  type="submit"
                  whileHover={{ backgroundColor: "#111", color: "#fff" }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full border border-gray-900 text-gray-900 py-4 text-[11px] tracking-[0.4em] uppercase transition-colors"
                >
                  Respond
                </motion.button>
              </form>
            )}
          </motion.div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="py-20 text-center border-t border-stone-200 px-4">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <DiamondOrnament className="mb-8" />
          <p className="text-gray-900 text-xl font-extralight tracking-widest">Amaya & Ruwan</p>
          <p className="text-stone-500 text-[10px] tracking-[0.5em] mt-3">12.09.2026</p>
          <div className="flex justify-center gap-6 mt-10 mb-10">
            {[Phone, Mail].map((Icon, i) => (
              <motion.div key={i} whileHover={{ scale: 1.2 }}>
                <Icon className="w-4 h-4 text-stone-400 hover:text-gray-900 transition-colors cursor-pointer" />
              </motion.div>
            ))}
          </div>
          <p className="text-[9px] text-stone-400 tracking-[0.3em] uppercase">
            <Link href="/" className="hover:text-stone-600 transition-colors">INVITATION.LK</Link>
          </p>
        </motion.div>
      </footer>
    </div>
  );
}
