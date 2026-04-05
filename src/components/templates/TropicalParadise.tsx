"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { Heart, MapPin, Mail, Phone, Camera, ChevronDown, Sun, Waves } from "lucide-react";
import Countdown from "./shared/Countdown";
import { useState, useRef } from "react";

/* ── Animated ocean waves ── */
function OceanWaves() {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-40 overflow-hidden pointer-events-none">
      {[0, 1, 2].map((i) => (
        <motion.svg
          key={i}
          className="absolute bottom-0 w-[200%] left-0"
          style={{ bottom: i * 8 }}
          viewBox="0 0 1440 100"
          preserveAspectRatio="none"
          animate={{ x: [0, i % 2 === 0 ? -720 : 720] }}
          transition={{ duration: 8 + i * 3, repeat: Infinity, ease: "linear" }}
        >
          <path
            d={`M0 ${40 + i * 10} Q180 ${20 + i * 5} 360 ${40 + i * 10} Q540 ${60 + i * 5} 720 ${40 + i * 10} Q900 ${20 + i * 5} 1080 ${40 + i * 10} Q1260 ${60 + i * 5} 1440 ${40 + i * 10} L1440 100 L0 100 Z`}
            fill={`rgba(13,148,136,${0.08 - i * 0.02})`}
          />
        </motion.svg>
      ))}
    </div>
  );
}

/* ── Floating bubbles ── */
function Bubbles({ count = 15 }: { count?: number }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: count }).map((_, i) => {
        const size = 4 + (i % 6) * 3;
        return (
          <motion.div
            key={i}
            className="absolute rounded-full border border-teal-300/20"
            style={{
              width: size, height: size,
              left: `${(i * 43 + 7) % 100}%`,
              bottom: -20,
            }}
            animate={{
              y: [0, -(600 + i * 40)],
              x: [0, Math.sin(i) * 40],
              opacity: [0, 0.4, 0.3, 0],
              scale: [0.5, 1, 1.2, 0],
            }}
            transition={{
              duration: 8 + (i % 5) * 2,
              repeat: Infinity,
              delay: (i * 1.3) % 8,
              ease: "easeOut",
            }}
          />
        );
      })}
    </div>
  );
}

/* ── Palm tree silhouette SVG ── */
function PalmSilhouette({ className }: { className: string }) {
  return (
    <motion.svg
      className={`absolute pointer-events-none ${className}`}
      viewBox="0 0 100 200"
      width="120"
      animate={{ rotate: [0, 2, -2, 0] }}
      transition={{ duration: 6, repeat: Infinity }}
    >
      <path d="M50 200 Q48 150 50 100 Q52 80 55 60" stroke="rgba(13,148,136,0.08)" fill="none" strokeWidth="3" />
      <path d="M55 60 Q30 40 10 55" stroke="rgba(13,148,136,0.06)" fill="none" strokeWidth="2" />
      <path d="M55 60 Q80 35 95 45" stroke="rgba(13,148,136,0.06)" fill="none" strokeWidth="2" />
      <path d="M55 60 Q40 30 20 30" stroke="rgba(13,148,136,0.06)" fill="none" strokeWidth="2" />
      <path d="M55 60 Q70 25 90 20" stroke="rgba(13,148,136,0.06)" fill="none" strokeWidth="2" />
      <path d="M55 60 Q55 20 60 10" stroke="rgba(13,148,136,0.06)" fill="none" strokeWidth="2" />
    </motion.svg>
  );
}

export default function TropicalParadise() {
  const [rsvpSent, setRsvpSent] = useState(false);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <div className="bg-[#fefcf8] text-gray-800 font-sans overflow-hidden">
      {/* ═══ HERO ═══ */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-teal-50/80 via-[#fefcf8] to-[#fefcf8]" />

        <PalmSilhouette className="top-0 left-0" />
        <PalmSilhouette className="bottom-20 right-0 scale-x-[-1]" />
        <Bubbles count={10} />
        <OceanWaves />

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10">
          <motion.div
            className="flex items-center justify-center gap-4 mb-10"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 2, repeat: Infinity }}>
              <Waves className="w-6 h-6 text-teal-400" />
            </motion.div>
            <motion.div animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.1, 1] }} transition={{ duration: 4, repeat: Infinity }}>
              <Sun className="w-8 h-8 text-orange-400" />
            </motion.div>
            <motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}>
              <Waves className="w-6 h-6 text-teal-400" />
            </motion.div>
          </motion.div>

          <motion.p
            className="text-teal-500 tracking-[0.3em] uppercase text-sm mb-10 font-light"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            A Beach Wedding
          </motion.p>

          <motion.h1
            className="text-6xl sm:text-8xl lg:text-9xl font-light text-teal-800 leading-none"
            initial={{ opacity: 0, y: 50, filter: "blur(12px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1.2, delay: 0.3 }}
          >
            Ishara
          </motion.h1>

          <motion.div
            className="flex items-center justify-center gap-4 my-4"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
          >
            <div className="w-14 h-px bg-gradient-to-r from-transparent to-teal-300" />
            <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
              <Heart className="w-5 h-5 text-orange-400 fill-orange-400" />
            </motion.div>
            <div className="w-14 h-px bg-gradient-to-l from-transparent to-teal-300" />
          </motion.div>

          <motion.h1
            className="text-6xl sm:text-8xl lg:text-9xl font-light text-teal-800 leading-none"
            initial={{ opacity: 0, y: 50, filter: "blur(12px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1.2, delay: 0.6 }}
          >
            Dinesh
          </motion.h1>

          <motion.div
            className="mt-12 bg-teal-50 rounded-full px-10 py-4 inline-flex items-center gap-6 text-sm text-teal-600"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5 }}
          >
            <span>March 28, 2026</span>
            <span className="w-1.5 h-1.5 bg-teal-300 rounded-full" />
            <span>Mirissa Beach</span>
          </motion.div>
        </motion.div>

        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 z-10"
        >
          <ChevronDown className="w-6 h-6 text-teal-300" />
        </motion.div>
      </section>

      {/* ═══ COUNTDOWN ═══ */}
      <section className="relative py-20 bg-gradient-to-r from-teal-500 to-teal-600 text-center text-white overflow-hidden">
        <Bubbles count={8} />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative z-10"
        >
          <p className="tracking-[0.3em] uppercase text-xs mb-8 text-teal-100">Toes in the sand in</p>
          <Countdown
            targetDate="2026-03-28T16:00:00"
            valueClassName="text-5xl sm:text-6xl font-light text-white"
            labelClassName="text-[10px] text-teal-200 tracking-[0.2em] uppercase mt-3"
            boxClassName="flex flex-col items-center bg-white/10 rounded-2xl px-6 py-5 min-w-[90px] backdrop-blur-sm"
            separatorClassName="text-3xl font-light text-white/20 mx-1 self-start mt-3"
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
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Waves className="w-10 h-10 text-teal-300 mx-auto mb-8" />
          </motion.div>
          <h2 className="text-4xl sm:text-5xl font-light text-teal-800 mb-10">Our Story</h2>

          <p className="text-gray-400 text-lg leading-loose mb-8">
            Ishara and Dinesh met during a surfing class in Arugam Bay. She was the fearless one who rode every wave; he was the one who kept falling off the board. She offered to teach him, and by the end of that golden afternoon, he had learned two things: how to stand on a surfboard, and that he had found someone extraordinary.
          </p>
          <p className="text-gray-400 text-lg leading-loose">
            Three years of beach sunsets, road trips through Sri Lanka&apos;s southern coast, and one unforgettable proposal at Mirissa whale watching (yes, a whale breached at the exact moment!) later, they are ready to say &quot;I do&quot; with their feet in the sand.
          </p>
        </motion.div>
      </section>

      {/* ═══ EVENTS ═══ */}
      <section className="relative py-28 bg-teal-50/50 px-4 overflow-hidden">
        <Bubbles count={5} />
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-teal-500 tracking-[0.3em] uppercase text-xs mb-4">Beach Day Schedule</p>
            <h2 className="text-4xl sm:text-5xl font-light text-teal-800">Wedding Events</h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { time: "4:00 PM", title: "Beach Ceremony", icon: Sun, desc: "Vows on the sand as the sun begins to set", color: "text-orange-400" },
              { time: "5:30 PM", title: "Sunset Cocktails", icon: Waves, desc: "Drinks and canapes on the beach deck", color: "text-teal-500" },
              { time: "7:00 PM", title: "Seafood Feast", icon: Heart, desc: "Fresh Sri Lankan seafood dinner under the stars", color: "text-orange-500" },
              { time: "9:00 PM", title: "Bonfire Party", icon: Sun, desc: "Live music, dancing, and a bonfire on the beach", color: "text-amber-500" },
            ].map((event, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.12 }}
                whileHover={{ y: -8, boxShadow: "0 20px 40px -12px rgba(13,148,136,0.12)" }}
                className="bg-white rounded-2xl p-6 text-center shadow-sm transition-all"
              >
                <motion.div
                  className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  whileHover={{ rotate: 12 }}
                >
                  <event.icon className={`w-6 h-6 ${event.color}`} />
                </motion.div>
                <p className="text-orange-400 text-sm font-medium mb-1">{event.time}</p>
                <h3 className="text-teal-800 font-semibold mb-2">{event.title}</h3>
                <p className="text-gray-400 text-sm">{event.desc}</p>
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
            <p className="text-teal-500 tracking-[0.3em] uppercase text-xs mb-4">Gallery</p>
            <h2 className="text-4xl sm:text-5xl font-light text-teal-800">Sun-Kissed Memories</h2>
          </motion.div>

          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                whileHover={{ scale: 1.05, zIndex: 10 }}
                className={`${i === 4 ? "row-span-2" : ""} bg-gradient-to-br ${
                  i % 4 === 0 ? "from-teal-100 to-teal-50" :
                  i % 4 === 1 ? "from-orange-50 to-teal-50" :
                  i % 4 === 2 ? "from-teal-50 to-cyan-50" :
                  "from-cyan-50 to-teal-100"
                } rounded-xl min-h-[130px] flex items-center justify-center cursor-pointer group`}
              >
                <Camera className="w-6 h-6 text-teal-200 group-hover:text-teal-400 transition-colors" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ VENUE ═══ */}
      <section className="py-28 bg-teal-50/50 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-teal-500 tracking-[0.3em] uppercase text-xs mb-4">Location</p>
            <h2 className="text-4xl sm:text-5xl font-light text-teal-800 mb-2">Mirissa Beach Resort</h2>
            <p className="text-gray-400 mb-10">Mirissa, Southern Province, Sri Lanka</p>
            <div className="bg-gradient-to-br from-teal-100/60 to-cyan-50 rounded-2xl h-72 sm:h-80 flex items-center justify-center">
              <MapPin className="w-10 h-10 text-teal-200" />
            </div>
            <motion.div
              whileHover={{ y: -2 }}
              className="mt-8 bg-white rounded-xl p-6 inline-block shadow-sm"
            >
              <p className="text-gray-400 text-sm mb-2">Dress Code</p>
              <p className="text-teal-700 font-medium text-lg">Beach Formal &middot; Light Colors Encouraged</p>
              <p className="text-gray-300 text-xs mt-1">Flat shoes or bare feet recommended for the sand ceremony!</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══ RSVP ═══ */}
      <section className="relative py-28 bg-gradient-to-b from-teal-500 to-teal-600 text-white px-4 overflow-hidden">
        <Bubbles count={12} />
        <OceanWaves />
        <div className="max-w-md mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 4, repeat: Infinity }}>
              <Sun className="w-10 h-10 text-orange-300 mx-auto mb-8" />
            </motion.div>
            <h2 className="text-4xl sm:text-5xl font-light mb-4">Join Us at the Beach!</h2>
            <p className="text-teal-100 text-sm mb-12">RSVP by February 28, 2026</p>

            {rsvpSent ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white/10 rounded-2xl p-10 backdrop-blur-sm"
              >
                <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                  <Sun className="w-12 h-12 text-orange-300 mx-auto mb-4" />
                </motion.div>
                <p className="text-2xl font-light">See you at the beach!</p>
                <p className="text-teal-100 mt-2 text-sm">We can&apos;t wait to celebrate with you.</p>
              </motion.div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setRsvpSent(true); }} className="space-y-4">
                <input type="text" placeholder="Your Name" required className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-white/50 text-sm backdrop-blur-sm" />
                <input type="email" placeholder="Email Address" className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-white/50 text-sm backdrop-blur-sm" />
                <select className="w-full px-5 py-4 bg-teal-600 border border-white/20 rounded-xl text-white focus:outline-none focus:border-white/50 text-sm">
                  <option value="">Will you be there?</option>
                  <option value="yes">Yes, count me in!</option>
                  <option value="no">Sorry, I can&apos;t make it</option>
                </select>
                <input type="number" min="1" max="4" placeholder="Number of guests" className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-white/50 text-sm backdrop-blur-sm" />
                <textarea placeholder="Dietary needs or message..." rows={3} className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-white/50 text-sm resize-none backdrop-blur-sm" />
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02, boxShadow: "0 8px 30px rgba(0,0,0,0.15)" }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-white text-teal-600 py-4 rounded-xl font-semibold shadow-lg"
                >
                  RSVP Now
                </motion.button>
              </form>
            )}
          </motion.div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="py-14 text-center px-4 bg-[#fefcf8]">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Waves className="w-4 h-4 text-teal-300" />
          <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
            <Heart className="w-5 h-5 text-orange-400 fill-orange-400" />
          </motion.div>
          <Waves className="w-4 h-4 text-teal-300" />
        </div>
        <p className="text-teal-800 text-xl font-light">Ishara & Dinesh</p>
        <p className="text-gray-300 text-sm mt-2">March 28, 2026 &middot; Mirissa, Sri Lanka</p>
        <div className="flex justify-center gap-3 mt-6 mb-6">
          {[Phone, Mail].map((Icon, i) => (
            <motion.div key={i} whileHover={{ scale: 1.15 }} className="w-10 h-10 rounded-full border border-teal-200 flex items-center justify-center cursor-pointer">
              <Icon className="w-4 h-4 text-teal-400" />
            </motion.div>
          ))}
        </div>
        <p className="text-xs text-gray-200">
          Created with <Heart className="w-3 h-3 inline text-orange-400 fill-orange-400" /> by{" "}
          <Link href="/" className="text-teal-400 hover:underline">INVITATION.LK</Link>
        </p>
      </footer>
    </div>
  );
}
