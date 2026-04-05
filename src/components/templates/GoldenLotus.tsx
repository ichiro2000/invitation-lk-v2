"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { Heart, MapPin, Mail, Phone, Camera, ChevronDown, Flame } from "lucide-react";
import Countdown from "./shared/Countdown";
import { useState, useRef } from "react";
import type { InvitationData } from "@/types/invitation";

/* ── Rotating SVG Mandala ── */
function Mandala({ size = 500, className = "" }: { size?: number; className?: string }) {
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
              fill="none" stroke="#d4a853" strokeWidth="0.5"
              opacity="0.2"
            />
            <ellipse
              cx={size / 2} cy={size * 0.28}
              rx={size * 0.02} ry={size * 0.06}
              fill="none" stroke="#d4a853" strokeWidth="0.3"
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
          fill="none" stroke="#d4a853"
          strokeWidth={0.5 - i * 0.1}
          opacity={0.15 - i * 0.03}
          strokeDasharray={i === 1 ? "4 4" : "none"}
        />
      ))}
    </motion.svg>
  );
}

/* ── Floating embers ── */
function FloatingEmbers({ count = 20 }: { count?: number }) {
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
              background: `radial-gradient(circle, #e8a838 0%, #d4a853 50%, transparent 100%)`,
              boxShadow: "0 0 4px 1px rgba(232,168,56,0.3)",
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

export default function GoldenLotus({ data }: { data?: InvitationData } = {}) {
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

  const [rsvpSent, setRsvpSent] = useState(false);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.85]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <div className="bg-[#1a0a0a] text-[#f5e6d3] font-serif overflow-hidden">
      {/* ═══ HERO ═══ */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 overflow-hidden">
        {/* Mandala backgrounds */}
        <Mandala size={600} className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-30 max-w-[90vw] max-h-[90vw]" />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] sm:w-[700px] h-[90vw] sm:h-[700px] rounded-full pointer-events-none"
          animate={{
            boxShadow: [
              "inset 0 0 80px 20px rgba(212,168,83,0.03)",
              "inset 0 0 120px 40px rgba(212,168,83,0.06)",
              "inset 0 0 80px 20px rgba(212,168,83,0.03)",
            ],
          }}
          transition={{ duration: 5, repeat: Infinity }}
        />

        <FloatingEmbers count={15} />

        <motion.div style={{ scale: heroScale, opacity: heroOpacity }} className="relative z-10">
          {/* Animated flame icon */}
          <motion.div
            className="w-20 h-20 border-2 border-[#d4a853] rounded-full flex items-center justify-center mx-auto mb-10"
            animate={{
              borderColor: ["rgba(212,168,83,0.5)", "rgba(212,168,83,0.8)", "rgba(212,168,83,0.5)"],
              boxShadow: [
                "0 0 0 0 rgba(212,168,83,0)",
                "0 0 20px 5px rgba(212,168,83,0.15)",
                "0 0 0 0 rgba(212,168,83,0)",
              ],
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <motion.div
              animate={{ scale: [1, 1.15, 1], y: [0, -2, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Flame className="w-8 h-8 text-[#d4a853]" />
            </motion.div>
          </motion.div>

          <motion.p
            className="text-[#d4a853] tracking-[0.5em] uppercase text-xs mb-10"
            initial={{ opacity: 0, letterSpacing: "0.1em" }}
            animate={{ opacity: 1, letterSpacing: "0.5em" }}
            transition={{ duration: 2 }}
          >
            Shubh Vivah
          </motion.p>

          <motion.h1
            className="text-6xl sm:text-8xl lg:text-9xl font-light text-[#d4a853] leading-none"
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
              style={{ background: "linear-gradient(to right, transparent, #d4a853)" }}
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <span className="text-[#d4a853] text-3xl font-light">&amp;</span>
            <motion.div
              className="w-24 h-px"
              style={{ background: "linear-gradient(to left, transparent, #d4a853)" }}
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
            />
          </motion.div>

          <motion.h1
            className="text-6xl sm:text-8xl lg:text-9xl font-light text-[#d4a853] leading-none"
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
            <p className="text-[#f5e6d3]/60 text-lg mb-1">Cordially invite you to celebrate</p>
            <p className="text-[#f5e6d3]/60 text-lg">their sacred union</p>
          </motion.div>

          <motion.div
            className="mt-10 border border-[#d4a853]/30 rounded-xl px-12 py-6 inline-block bg-[#d4a853]/5 backdrop-blur-sm"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.8, type: "spring" }}
          >
            <p className="text-[#d4a853] text-sm tracking-[0.3em] uppercase">October 10, 2026</p>
            <p className="text-[#f5e6d3]/40 text-xs mt-1 tracking-[0.2em]">Jaffna, Sri Lanka</p>
          </motion.div>
        </motion.div>

        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 z-10"
        >
          <ChevronDown className="w-6 h-6 text-[#d4a853]/40" />
        </motion.div>
      </section>

      {/* ═══ COUNTDOWN ═══ */}
      <section className="relative py-24 bg-[#d4a853] text-[#1a0a0a] text-center overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative z-10"
        >
          <p className="tracking-[0.4em] uppercase text-xs mb-10 text-[#1a0a0a]/50">The Celebration Begins In</p>
          <Countdown
            targetDate={`${date}T09:00:00`}
            valueClassName="text-3xl sm:text-6xl font-light text-[#1a0a0a]"
            labelClassName="text-[10px] text-[#1a0a0a]/40 tracking-[0.3em] uppercase mt-3"
            boxClassName="flex flex-col items-center bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl px-3 sm:px-6 py-5 min-w-[60px] sm:min-w-[90px]"
            separatorClassName="text-2xl sm:text-4xl font-light text-[#1a0a0a]/15 mx-1 self-start mt-2"
          />
        </motion.div>
      </section>

      {/* ═══ STORY ═══ */}
      <section className="py-28 px-4 max-w-3xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <motion.div
            className="w-14 h-14 border border-[#d4a853]/30 rounded-full flex items-center justify-center mx-auto mb-8"
            animate={{ borderColor: ["rgba(212,168,83,0.2)", "rgba(212,168,83,0.5)", "rgba(212,168,83,0.2)"] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Heart className="w-6 h-6 text-[#d4a853]" />
          </motion.div>
          <h2 className="text-4xl sm:text-5xl font-light text-[#d4a853] mb-10">Our Story</h2>

          <p className="text-[#f5e6d3]/50 text-lg leading-loose mb-8">
            Ours is a story written in the stars — or rather, at a temple festival in Nallur. Priya, adorned in her traditional sari, caught Aravind&apos;s eye across the crowded kovil grounds. What followed was a connection so deep, it felt like they had known each other across lifetimes.
          </p>
          <p className="text-[#f5e6d3]/50 text-lg leading-loose">
            Three years of shared laughter, family dinners, and dreams later, Aravind proposed with his grandmother&apos;s gold ring at Jaffna Fort during a crimson sunset. Now they invite you to witness the sacred beginning of their journey together.
          </p>
        </motion.div>
      </section>

      {/* ═══ MULTI-CEREMONY EVENTS ═══ */}
      <section className="relative py-28 bg-[#d4a853]/5 px-4 overflow-hidden">
        <FloatingEmbers count={8} />
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-[#d4a853] tracking-[0.4em] uppercase text-xs mb-4">Ceremonies</p>
            <h2 className="text-4xl sm:text-5xl font-light text-[#d4a853]">Wedding Events</h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              { day: "Day 1 — Oct 9", title: "Nichayathartham", time: "10:00 AM", venue: "Nallur Kandaswamy Kovil", desc: "Formal engagement ceremony with exchange of rings and blessings from elders" },
              { day: "Day 1 — Oct 9", title: "Mehendi & Sangeet", time: "6:00 PM", venue: "Bride's Residence", desc: "An evening of henna, music, and dance celebrating the bride-to-be" },
              { day: "Day 2 — Oct 10", title: "Muhurtham", time: "9:00 AM", venue: "Nallur Kandaswamy Kovil", desc: "The sacred Hindu wedding ceremony with tying of the Thali at the auspicious hour" },
              { day: "Day 2 — Oct 10", title: "Wedding Reception", time: "7:00 PM", venue: "Jaffna Heritage Hotel", desc: "Grand reception dinner with traditional feast, music, and celebrations" },
            ].map((event, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30, rotateX: -10 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: i * 0.15 }}
                whileHover={{
                  y: -6,
                  borderColor: "rgba(212,168,83,0.3)",
                  boxShadow: "0 20px 40px -12px rgba(212,168,83,0.1)",
                }}
                className="bg-[#1a0a0a] border border-[#d4a853]/15 rounded-2xl p-8 transition-all"
              >
                <p className="text-[#d4a853]/40 text-xs tracking-[0.3em] uppercase mb-3">{event.day}</p>
                <h3 className="text-xl font-semibold text-[#d4a853] mb-3">{event.title}</h3>
                <div className="flex items-center gap-3 text-[#f5e6d3]/40 text-sm mb-4">
                  <span>{event.time}</span>
                  <span className="w-1 h-1 bg-[#d4a853]/30 rounded-full" />
                  <span>{event.venue}</span>
                </div>
                <p className="text-[#f5e6d3]/30 text-sm leading-relaxed">{event.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ GALLERY ═══ */}
      <section className="py-28 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-[#d4a853] tracking-[0.4em] uppercase text-xs mb-4">Gallery</p>
            <h2 className="text-4xl sm:text-5xl font-light text-[#d4a853]">Precious Moments</h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.85 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                whileHover={{ scale: 1.04 }}
                className={`${i === 1 || i === 4 ? "row-span-2" : ""} bg-gradient-to-br from-[#d4a853]/10 to-[#d4a853]/5 rounded-2xl min-h-[160px] flex items-center justify-center border border-[#d4a853]/10 cursor-pointer group overflow-hidden`}
              >
                <Camera className="w-8 h-8 text-[#d4a853]/15 group-hover:text-[#d4a853]/30 transition-colors" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ VENUE ═══ */}
      <section className="py-28 bg-[#d4a853]/5 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-[#d4a853] tracking-[0.4em] uppercase text-xs mb-4">Venue</p>
            <h2 className="text-4xl sm:text-5xl font-light text-[#d4a853] mb-2">{venue}</h2>
            <p className="text-[#f5e6d3]/40 mb-10">{venueAddr}</p>
            <div className="bg-gradient-to-br from-[#d4a853]/10 to-[#1a0a0a] rounded-2xl h-72 sm:h-80 flex items-center justify-center border border-[#d4a853]/10">
              <MapPin className="w-10 h-10 text-[#d4a853]/20" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ RSVP ═══ */}
      <section className="relative py-28 px-4 overflow-hidden">
        <FloatingEmbers count={10} />
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
              <Flame className="w-10 h-10 text-[#d4a853] mx-auto mb-8" />
            </motion.div>
            <h2 className="text-4xl sm:text-5xl font-light text-[#d4a853] mb-4">Honour Us With Your Presence</h2>
            <p className="text-[#f5e6d3]/30 text-sm mb-12">Please respond by September 10, 2026</p>

            {rsvpSent ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="border border-[#d4a853]/30 rounded-2xl p-10 bg-[#d4a853]/5"
              >
                <Flame className="w-12 h-12 text-[#d4a853] mx-auto mb-4" />
                <p className="text-2xl font-light text-[#d4a853]">Blessings received!</p>
                <p className="text-[#f5e6d3]/30 mt-2">We are honoured by your response.</p>
              </motion.div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setRsvpSent(true); }} className="space-y-4">
                <input type="text" placeholder="Full Name" required className="w-full px-5 py-4 bg-transparent border border-[#d4a853]/20 rounded-xl text-[#f5e6d3] placeholder:text-[#f5e6d3]/25 focus:outline-none focus:border-[#d4a853]/60 focus:shadow-lg focus:shadow-[#d4a853]/5 text-sm transition-all" />
                <input type="tel" placeholder="Phone Number" className="w-full px-5 py-4 bg-transparent border border-[#d4a853]/20 rounded-xl text-[#f5e6d3] placeholder:text-[#f5e6d3]/25 focus:outline-none focus:border-[#d4a853]/60 text-sm transition-all" />
                <select className="w-full px-5 py-4 bg-[#1a0a0a] border border-[#d4a853]/20 rounded-xl text-[#f5e6d3]/50 focus:outline-none focus:border-[#d4a853]/60 text-sm">
                  <option value="">Will you attend?</option>
                  <option value="yes">Happily Accept</option>
                  <option value="no">Regretfully Decline</option>
                </select>
                <select className="w-full px-5 py-4 bg-[#1a0a0a] border border-[#d4a853]/20 rounded-xl text-[#f5e6d3]/50 focus:outline-none focus:border-[#d4a853]/60 text-sm">
                  <option value="">Which ceremonies?</option>
                  <option value="all">All Events</option>
                  <option value="wedding">Muhurtham Only</option>
                  <option value="reception">Reception Only</option>
                </select>
                <input type="number" min="1" max="5" placeholder="Number of guests" className="w-full px-5 py-4 bg-transparent border border-[#d4a853]/20 rounded-xl text-[#f5e6d3] placeholder:text-[#f5e6d3]/25 focus:outline-none focus:border-[#d4a853]/60 text-sm transition-all" />
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02, boxShadow: "0 0 40px rgba(212,168,83,0.2)" }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-[#d4a853] to-[#e0b95f] text-[#1a0a0a] py-4 rounded-xl font-semibold tracking-[0.2em] uppercase text-sm shadow-lg"
                >
                  Send Response
                </motion.button>
              </form>
            )}
          </motion.div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="py-14 text-center border-t border-[#d4a853]/10 px-4">
        <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}>
          <Flame className="w-5 h-5 text-[#d4a853] mx-auto mb-4" />
        </motion.div>
        <p className="text-[#d4a853] text-xl font-light">{bride} & {groom}</p>
        <p className="text-[#f5e6d3]/20 text-sm mt-2">October 10, 2026 &middot; Jaffna, Sri Lanka</p>
        <div className="flex justify-center gap-3 mt-6 mb-6">
          {[Phone, Mail].map((Icon, i) => (
            <motion.div key={i} whileHover={{ scale: 1.15, borderColor: "rgba(212,168,83,0.4)" }} className="w-10 h-10 rounded-full border border-[#d4a853]/15 flex items-center justify-center cursor-pointer transition-colors">
              <Icon className="w-4 h-4 text-[#d4a853]/50" />
            </motion.div>
          ))}
        </div>
        <p className="text-xs text-[#f5e6d3]/15">
          Created with <Heart className="w-3 h-3 inline text-[#d4a853]/50" /> by{" "}
          <Link href="/" className="text-[#d4a853]/40 hover:underline">INVITATION.LK</Link>
        </p>
      </footer>
    </div>
  );
}
