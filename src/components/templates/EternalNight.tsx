"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { Heart, MapPin, Mail, Phone, Camera, ChevronDown, Star, Sparkles, Moon } from "lucide-react";
import Countdown from "./shared/Countdown";
import { useState, useRef } from "react";
import type { InvitationData } from "@/types/invitation";

/* ── Animated starfield with shooting stars ── */
function StarField() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Static twinkling stars */}
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
          animate={{
            opacity: [0.1, i % 3 === 0 ? 1 : 0.6, 0.1],
            scale: [1, i % 5 === 0 ? 1.5 : 1.2, 1],
          }}
          transition={{
            duration: 2 + (i % 4),
            repeat: Infinity,
            delay: (i * 0.3) % 5,
          }}
        />
      ))}

      {/* Shooting stars */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={`shoot-${i}`}
          className="absolute w-px h-px"
          style={{
            left: `${20 + i * 30}%`,
            top: `${10 + i * 15}%`,
          }}
        >
          <motion.div
            className="absolute w-24 h-px bg-gradient-to-l from-white via-white/50 to-transparent origin-right"
            style={{ rotate: `${30 + i * 10}deg` }}
            animate={{
              x: [0, -300],
              y: [0, 200],
              opacity: [0, 1, 1, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: 3 + i * 5,
              repeatDelay: 8 + i * 3,
            }}
          />
        </motion.div>
      ))}

      {/* Nebula glow effects */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl"
        animate={{
          background: [
            "radial-gradient(circle, rgba(99,102,241,0.04) 0%, transparent 70%)",
            "radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)",
            "radial-gradient(circle, rgba(99,102,241,0.04) 0%, transparent 70%)",
          ],
        }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl"
        animate={{
          background: [
            "radial-gradient(circle, rgba(196,163,90,0.04) 0%, transparent 70%)",
            "radial-gradient(circle, rgba(196,163,90,0.08) 0%, transparent 70%)",
            "radial-gradient(circle, rgba(196,163,90,0.04) 0%, transparent 70%)",
          ],
        }}
        transition={{ duration: 10, repeat: Infinity, delay: 2 }}
      />
    </div>
  );
}

/* ── Constellation connecting dots ── */
function Constellation() {
  const points = [
    { x: 15, y: 20 }, { x: 25, y: 15 }, { x: 35, y: 22 },
    { x: 30, y: 35 }, { x: 20, y: 30 },
  ];
  return (
    <svg className="absolute top-10 right-10 w-60 h-60 opacity-20 hidden lg:block" viewBox="0 0 50 50">
      {points.map((p, i) => (
        <motion.circle
          key={i}
          cx={p.x} cy={p.y} r="0.8"
          fill="#c4a35a"
          animate={{ opacity: [0.3, 1, 0.3], r: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
        />
      ))}
      {points.map((p, i) => {
        const next = points[(i + 1) % points.length];
        return (
          <motion.line
            key={`l-${i}`}
            x1={p.x} y1={p.y} x2={next.x} y2={next.y}
            stroke="#c4a35a" strokeWidth="0.3"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1, opacity: [0.1, 0.4, 0.1] }}
            transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
          />
        );
      })}
    </svg>
  );
}

export default function EternalNight({ data }: { data?: InvitationData } = {}) {
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

  const [rsvpSent, setRsvpSent] = useState(false);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.9]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <div className="bg-[#0a0e1a] text-white font-sans overflow-hidden">
      {/* ═══ HERO ═══ */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 overflow-hidden">
        <StarField />
        <Constellation />

        <motion.div style={{ scale: heroScale, opacity: heroOpacity }} className="relative z-10">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 1.5, type: "spring" }}
          >
            <Moon className="w-10 h-10 text-[#c4a35a] mx-auto mb-8" />
          </motion.div>

          <motion.p
            className="text-[#c4a35a] tracking-[0.5em] uppercase text-xs mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            Under the Stars
          </motion.p>

          {/* Names with staggered letter animation */}
          <motion.h1
            className="text-6xl sm:text-8xl lg:text-9xl font-extralight tracking-wider sm:tracking-widest text-white leading-none mb-2"
            initial={{ opacity: 0, y: 50, filter: "blur(15px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1.2, delay: 0.8 }}
          >
            {bride}
          </motion.h1>

          <motion.div
            className="flex items-center justify-center gap-6 my-5"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1, delay: 1.2 }}
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-4 h-4 text-[#c4a35a]" />
            </motion.div>
            <span className="text-[#c4a35a] text-3xl font-extralight">&amp;</span>
            <motion.div
              animate={{ rotate: [360, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-4 h-4 text-[#c4a35a]" />
            </motion.div>
          </motion.div>

          <motion.h1
            className="text-6xl sm:text-8xl lg:text-9xl font-extralight tracking-wider sm:tracking-widest text-white leading-none"
            initial={{ opacity: 0, y: 50, filter: "blur(15px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1.2, delay: 1 }}
          >
            {groom}
          </motion.h1>

          <motion.div
            className="mt-14 flex flex-col sm:flex-row items-center justify-center gap-4 text-[#c4a35a]/60 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8 }}
          >
            <span>December 31, 2026</span>
            <motion.div
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Star className="w-3 h-3 text-[#c4a35a] fill-[#c4a35a] hidden sm:block" />
            </motion.div>
            <span>Bentota, Sri Lanka</span>
          </motion.div>

          <motion.p
            className="mt-6 text-white/20 text-sm italic"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.2 }}
          >
            &quot;Two souls, one eternal night of celebration&quot;
          </motion.p>
        </motion.div>

        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2.5, repeat: Infinity }}
          className="absolute bottom-8 z-10"
        >
          <ChevronDown className="w-6 h-6 text-[#c4a35a]/30" />
        </motion.div>
      </section>

      {/* ═══ COUNTDOWN ═══ */}
      <section className="relative py-24 bg-gradient-to-b from-[#0a0e1a] via-[#1a2744] to-[#0a0e1a] text-center overflow-hidden">
        <StarField />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative z-10"
        >
          <p className="text-[#c4a35a] tracking-[0.4em] uppercase text-xs mb-10">The Night Begins In</p>
          <Countdown
            targetDate={`${date}T20:00:00`}
            valueClassName="text-3xl sm:text-6xl font-extralight text-white"
            labelClassName="text-[10px] text-[#c4a35a]/50 tracking-[0.3em] uppercase mt-3"
            boxClassName="flex flex-col items-center bg-white/[0.03] border border-white/5 rounded-xl sm:rounded-2xl px-3 sm:px-6 py-5 min-w-[60px] sm:min-w-[110px] backdrop-blur-sm"
            separatorClassName="text-xl sm:text-3xl font-extralight text-[#c4a35a]/15 mx-1 self-start mt-3"
          />
        </motion.div>
      </section>

      {/* ═══ STORY ═══ */}
      <section className="py-28 px-4 max-w-3xl mx-auto text-center relative">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <Star className="w-8 h-8 text-[#c4a35a] mx-auto mb-8" />
          </motion.div>
          <h2 className="text-4xl sm:text-5xl font-extralight text-white mb-10">Written in the Stars</h2>

          <motion.p
            className="text-white/35 text-lg leading-loose mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Chamari and Nuwan&apos;s love story began at a New Year&apos;s Eve rooftop party in Colombo, under a sky ablaze with fireworks. He asked her to dance; she asked him his star sign. &quot;Leo,&quot; he said. &quot;Of course you are,&quot; she laughed — and from that moment, they were inseparable.
          </motion.p>
          <motion.p
            className="text-white/35 text-lg leading-loose"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            Now, exactly three years after that fateful night, they will exchange vows under the same December sky — this time in Bentota, where the river meets the sea and the stars reflect on the water.
          </motion.p>
        </motion.div>
      </section>

      {/* ═══ EVENTS — Glowing timeline ═══ */}
      <section className="relative py-28 bg-[#0f1628] px-4 overflow-hidden">
        <StarField />
        <div className="max-w-4xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-[#c4a35a] tracking-[0.4em] uppercase text-xs mb-4">Program</p>
            <h2 className="text-4xl sm:text-5xl font-extralight text-white">New Year&apos;s Eve Wedding</h2>
          </motion.div>

          <div className="space-y-6">
            {[
              { time: "6:00 PM", title: "Guests Arrive", desc: "Welcome cocktails and stargazing on the garden terrace", icon: Star },
              { time: "7:30 PM", title: "Ceremony Under the Stars", desc: "Exchange of vows in the moonlit garden with fairy lights", icon: Moon },
              { time: "8:30 PM", title: "Grand Dinner", desc: "An exquisite five-course dinner paired with the finest wines", icon: Sparkles },
              { time: "10:30 PM", title: "Dancing & Celebrations", desc: "Live band and DJ take us into the new year", icon: Heart },
              { time: "12:00 AM", title: "Midnight Fireworks", desc: "Ring in 2027 with a spectacular fireworks display and champagne toast", icon: Star },
            ].map((event, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                whileHover={{
                  borderColor: "rgba(196,163,90,0.3)",
                  boxShadow: "0 0 40px rgba(196,163,90,0.05)",
                  x: 8,
                }}
                className="flex items-start gap-6 p-6 rounded-2xl border border-white/5 bg-white/[0.02] transition-all cursor-default"
              >
                <motion.div
                  className="w-12 h-12 bg-[#c4a35a]/10 rounded-xl flex items-center justify-center flex-shrink-0"
                  whileHover={{ rotate: 12, scale: 1.1 }}
                >
                  <event.icon className="w-5 h-5 text-[#c4a35a]" />
                </motion.div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-[#c4a35a] text-sm font-medium">{event.time}</span>
                    <div className="w-8 h-px bg-[#c4a35a]/20" />
                  </div>
                  <h3 className="text-white font-medium text-lg mb-1">{event.title}</h3>
                  <p className="text-white/25 text-sm">{event.desc}</p>
                </div>
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
            <p className="text-[#c4a35a] tracking-[0.4em] uppercase text-xs mb-4">Gallery</p>
            <h2 className="text-4xl sm:text-5xl font-extralight text-white">Starlit Moments</h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                whileHover={{ scale: 1.05, zIndex: 10 }}
                className={`${i === 0 || i === 5 ? "md:col-span-2 h-64" : "h-56"} bg-gradient-to-br ${
                  i % 3 === 0 ? "from-[#1a2744] to-[#0f1628]" :
                  i % 3 === 1 ? "from-[#0f1628] to-[#1a2744]" :
                  "from-[#1a2744]/50 to-[#0a0e1a]"
                } rounded-2xl flex items-center justify-center border border-white/5 cursor-pointer group relative overflow-hidden`}
              >
                <Camera className="w-6 h-6 text-[#c4a35a]/15 group-hover:text-[#c4a35a]/40 transition-colors" />
                <div className="absolute inset-0 bg-[#c4a35a]/0 group-hover:bg-[#c4a35a]/5 transition-colors" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ VENUE ═══ */}
      <section className="py-28 bg-[#0f1628] px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-[#c4a35a] tracking-[0.4em] uppercase text-xs mb-4">Venue</p>
            <h2 className="text-4xl sm:text-5xl font-extralight text-white mb-2">{venue}</h2>
            <p className="text-white/25 mb-10">{venueAddr}</p>
            <div className="bg-gradient-to-br from-[#1a2744] to-[#0a0e1a] rounded-2xl h-72 sm:h-80 flex items-center justify-center border border-white/5">
              <MapPin className="w-10 h-10 text-[#c4a35a]/15" />
            </div>
            <motion.div
              whileHover={{ borderColor: "rgba(196,163,90,0.3)" }}
              className="mt-8 border border-[#c4a35a]/10 rounded-xl p-6 inline-block transition-colors"
            >
              <p className="text-white/30 text-sm mb-1">Dress Code</p>
              <p className="text-[#c4a35a] font-medium text-lg">Black Tie &middot; Celestial Glamour</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══ RSVP ═══ */}
      <section className="relative py-28 px-4 overflow-hidden">
        <StarField />
        <div className="max-w-lg mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Moon className="w-10 h-10 text-[#c4a35a] mx-auto mb-8" />
            </motion.div>
            <h2 className="text-4xl sm:text-5xl font-extralight text-white mb-4">Join Our Celebration</h2>
            <p className="text-white/25 text-sm mb-12">Please respond by December 1, 2026</p>

            {rsvpSent ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="border border-[#c4a35a]/20 rounded-2xl p-10 bg-[#c4a35a]/5 backdrop-blur-sm"
              >
                <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }}>
                  <Sparkles className="w-12 h-12 text-[#c4a35a] mx-auto mb-4" />
                </motion.div>
                <p className="text-2xl font-extralight text-white">Thank you!</p>
                <p className="text-white/25 mt-2">See you under the stars.</p>
              </motion.div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setRsvpSent(true); }} className="space-y-4">
                <input type="text" placeholder="Full Name" required className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/25 focus:outline-none focus:border-[#c4a35a]/40 text-sm backdrop-blur-sm transition-colors" />
                <input type="email" placeholder="Email Address" className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/25 focus:outline-none focus:border-[#c4a35a]/40 text-sm backdrop-blur-sm transition-colors" />
                <select className="w-full px-5 py-4 bg-[#0a0e1a] border border-white/10 rounded-xl text-white/50 focus:outline-none focus:border-[#c4a35a]/40 text-sm transition-colors">
                  <option value="">Will you attend?</option>
                  <option value="yes">Wouldn&apos;t miss it!</option>
                  <option value="no">Unfortunately, no</option>
                </select>
                <input type="number" min="1" max="4" placeholder="Number of guests" className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/25 focus:outline-none focus:border-[#c4a35a]/40 text-sm backdrop-blur-sm transition-colors" />
                <textarea placeholder="Song request or message..." rows={3} className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/25 focus:outline-none focus:border-[#c4a35a]/40 text-sm resize-none backdrop-blur-sm transition-colors" />
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02, boxShadow: "0 0 40px rgba(196,163,90,0.2)" }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-[#c4a35a] to-[#d4b36a] text-[#0a0e1a] py-4 rounded-xl font-semibold transition-all"
                >
                  Send RSVP
                </motion.button>
              </form>
            )}
          </motion.div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="py-14 text-center border-t border-white/5 px-4">
        <div className="flex items-center justify-center gap-3 mb-4">
          <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity }}>
            <Star className="w-3 h-3 text-[#c4a35a] fill-[#c4a35a]" />
          </motion.div>
          <Moon className="w-5 h-5 text-[#c4a35a]" />
          <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity, delay: 1 }}>
            <Star className="w-3 h-3 text-[#c4a35a] fill-[#c4a35a]" />
          </motion.div>
        </div>
        <p className="text-white font-extralight text-xl">{bride} & {groom}</p>
        <p className="text-white/15 text-sm mt-2">December 31, 2026 &middot; Bentota, Sri Lanka</p>
        <div className="flex justify-center gap-4 mt-6 mb-6">
          {[Phone, Mail].map((Icon, i) => (
            <motion.div key={i} whileHover={{ scale: 1.15, borderColor: "rgba(196,163,90,0.4)" }} className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center cursor-pointer transition-colors">
              <Icon className="w-4 h-4 text-[#c4a35a]/40" />
            </motion.div>
          ))}
        </div>
        <p className="text-xs text-white/10">
          Created with <Heart className="w-3 h-3 inline text-[#c4a35a]/40" /> by{" "}
          <Link href="/" className="text-[#c4a35a]/30 hover:text-[#c4a35a]/60 transition-colors">INVITATION.LK</Link>
        </p>
      </footer>
    </div>
  );
}
