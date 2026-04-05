"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { Heart, MapPin, Clock, Calendar, Mail, Phone, Camera, ChevronDown } from "lucide-react";
import Countdown from "./shared/Countdown";
import { useState, useRef } from "react";
import type { InvitationData } from "@/types/invitation";

/* ── Floating flower petals ── */
function FloatingPetals({ count = 20 }: { count?: number }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: count }).map((_, i) => {
        const size = 8 + (i % 5) * 4;
        const left = (i * 37 + 5) % 100;
        const delay = (i * 1.1) % 10;
        const dur = 10 + (i % 6) * 3;
        const colors = ["#fbb6ce", "#f9a8d4", "#f472b6", "#fda4af", "#fecdd3"];
        return (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: size,
              height: size * 0.6,
              left: `${left}%`,
              top: -20,
              background: colors[i % colors.length],
              borderRadius: "50% 50% 50% 0",
              opacity: 0.25,
              filter: "blur(0.5px)",
            }}
            animate={{
              y: [0, 800 + i * 30],
              x: [0, Math.sin(i * 0.8) * 120, Math.cos(i) * 80],
              rotate: [0, 360 * (i % 2 === 0 ? 1 : -1)],
              opacity: [0, 0.3, 0.25, 0],
            }}
            transition={{
              duration: dur,
              repeat: Infinity,
              delay,
              ease: "easeIn",
            }}
          />
        );
      })}
    </div>
  );
}

/* ── Watercolor blob ── */
function WatercolorBlob({ className, color, delay = 0 }: { className: string; color: string; delay?: number }) {
  return (
    <motion.div
      className={`absolute rounded-full blur-3xl pointer-events-none ${className}`}
      animate={{
        scale: [1, 1.15, 1],
        opacity: [0.15, 0.25, 0.15],
        x: [0, 15, -10, 0],
        y: [0, -10, 5, 0],
      }}
      transition={{ duration: 8, repeat: Infinity, delay }}
      style={{ background: color }}
    />
  );
}

export default function ModernBloom({ data }: { data?: InvitationData } = {}) {
  const groom = data?.groomName || "Kavinda";
  const bride = data?.brideName || "Sachini";
  const date = data?.weddingDate || "2026-08-22";
  const time = data?.weddingTime || "3:00 PM";
  const venue = data?.venue || "Hikkaduwa Beach Resort";
  const venueAddr = data?.venueAddress || "124 Galle Road, Hikkaduwa, Sri Lanka";
  const events = data?.events || [
    { title: "Beach Ceremony", time: "3:00 PM", description: "Exchange of vows on the golden sands with the Indian Ocean as our backdrop" },
    { title: "Cocktail Hour", time: "4:30 PM", description: "Enjoy refreshing cocktails, canapes, and ocean breezes on the seaside terrace" },
    { title: "Reception Dinner", time: "6:00 PM", description: "A beautiful sit-down dinner under fairy lights with music and speeches" },
    { title: "Dance & Celebration", time: "8:30 PM", description: "Dance the night away under the stars with live music and DJ" },
  ];

  const [rsvpSent, setRsvpSent] = useState(false);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <div className="bg-white text-gray-800 font-sans overflow-hidden">
      {/* ═══ HERO ═══ */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 overflow-hidden">
        <WatercolorBlob className="top-0 left-0 w-[280px] sm:w-[500px] h-[280px] sm:h-[500px]" color="rgba(251,182,206,0.25)" delay={0} />
        <WatercolorBlob className="bottom-0 right-0 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px]" color="rgba(244,114,182,0.12)" delay={2} />
        <WatercolorBlob className="top-1/3 right-1/4 w-[200px] sm:w-[300px] h-[200px] sm:h-[300px]" color="rgba(253,164,175,0.15)" delay={4} />
        <WatercolorBlob className="bottom-1/4 left-1/3 w-[180px] sm:w-[250px] h-[180px] sm:h-[250px]" color="rgba(249,168,212,0.18)" delay={1} />

        <FloatingPetals count={18} />

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10">
          {/* Decorative flourish */}
          <motion.svg
            viewBox="0 0 120 30"
            className="w-36 mx-auto mb-6 opacity-30"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.3 }}
            transition={{ duration: 2 }}
          >
            <motion.path
              d="M10 15 Q30 0 60 15 Q90 30 110 15"
              stroke="#f9a8d4" fill="none" strokeWidth="1.5"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2 }}
            />
            <motion.path
              d="M10 15 Q30 30 60 15 Q90 0 110 15"
              stroke="#f9a8d4" fill="none" strokeWidth="1.5"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, delay: 0.5 }}
            />
          </motion.svg>

          <motion.p
            className="text-pink-400 tracking-[0.3em] uppercase text-sm mb-10 font-light"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            We&apos;re getting married
          </motion.p>

          <motion.h1
            className="text-6xl sm:text-8xl lg:text-9xl font-extralight text-gray-800 mb-2 tracking-tight leading-none"
            initial={{ opacity: 0, y: 50, filter: "blur(12px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1.2, delay: 0.3 }}
          >
            {bride}
          </motion.h1>

          <motion.p
            className="text-4xl text-pink-300 font-light italic my-5"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.8, type: "spring" }}
          >
            &amp;
          </motion.p>

          <motion.h1
            className="text-6xl sm:text-8xl lg:text-9xl font-extralight text-gray-800 tracking-tight leading-none"
            initial={{ opacity: 0, y: 50, filter: "blur(12px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1.2, delay: 0.6 }}
          >
            {groom}
          </motion.h1>

          <motion.div
            className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            {[
              { icon: Calendar, text: "August 22, 2026" },
              { icon: Clock, text: "3:00 PM" },
              { icon: MapPin, text: "Hikkaduwa Beach" },
            ].map((item, i) => (
              <motion.div
                key={i}
                className="flex items-center gap-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.5 + i * 0.2 }}
              >
                <item.icon className="w-4 h-4 text-pink-400" />
                <span className="text-sm">{item.text}</span>
                {i < 2 && <div className="hidden sm:block w-1.5 h-1.5 bg-pink-200 rounded-full ml-4" />}
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 z-10"
        >
          <ChevronDown className="w-6 h-6 text-pink-300" />
        </motion.div>
      </section>

      {/* ═══ COUNTDOWN ═══ */}
      <section className="relative py-20 bg-gradient-to-r from-pink-50 via-rose-50 to-pink-50 text-center overflow-hidden">
        <FloatingPetals count={8} />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative z-10"
        >
          <p className="text-pink-400 tracking-[0.3em] uppercase text-xs mb-8">Counting the days</p>
          <Countdown
            targetDate={`${date}T15:00:00`}
            valueClassName="text-3xl sm:text-6xl font-extralight text-gray-800"
            labelClassName="text-[10px] text-pink-400 tracking-[0.2em] uppercase mt-3"
            boxClassName="flex flex-col items-center bg-white rounded-xl sm:rounded-2xl shadow-lg shadow-pink-100/50 px-3 sm:px-6 py-5 min-w-[60px] sm:min-w-[100px]"
            separatorClassName="text-xl sm:text-3xl font-extralight text-pink-200 mx-1 self-start mt-3"
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
            className="w-16 h-16 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-8"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <Heart className="w-7 h-7 text-pink-400 fill-pink-400" />
          </motion.div>
          <h2 className="text-4xl sm:text-5xl font-extralight text-gray-800 mb-10">Our Love Story</h2>

          <motion.p
            className="text-gray-400 text-lg leading-loose mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Our paths crossed at the University of Peradeniya, where Sachini was studying architecture and Kavinda was pursuing engineering. What started as study sessions in the library blossomed into late-night conversations, weekend adventures across the island, and a love that grew stronger with every passing day.
          </motion.p>
          <motion.p
            className="text-gray-400 text-lg leading-loose"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            After four beautiful years together, Kavinda proposed on a misty morning at Horton Plains, overlooking World&apos;s End. Now we invite you to join us as we begin this new chapter, celebrating with a beach ceremony surrounded by the people we love most.
          </motion.p>
        </motion.div>
      </section>

      {/* ═══ EVENTS — Alternating timeline ═══ */}
      <section className="relative py-28 bg-pink-50/30 px-4 overflow-hidden">
        <FloatingPetals count={6} />
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-pink-400 tracking-[0.3em] uppercase text-xs mb-4">Timeline</p>
            <h2 className="text-4xl sm:text-5xl font-extralight text-gray-800">Wedding Day Schedule</h2>
          </motion.div>

          <div className="relative">
            {/* Animated center line */}
            <motion.div
              className="absolute left-1/2 top-0 w-px bg-gradient-to-b from-pink-300/50 via-pink-300/30 to-transparent hidden md:block"
              initial={{ height: 0 }}
              whileInView={{ height: "100%" }}
              viewport={{ once: true }}
              transition={{ duration: 2 }}
            />

            {[
              { time: "3:00 PM", title: "Beach Ceremony", desc: "Exchange of vows on the golden sands with the Indian Ocean as our backdrop" },
              { time: "4:30 PM", title: "Cocktail Hour", desc: "Enjoy refreshing cocktails, canapes, and ocean breezes on the seaside terrace" },
              { time: "6:00 PM", title: "Reception Dinner", desc: "A beautiful sit-down dinner under fairy lights with music and speeches" },
              { time: "8:30 PM", title: "Dance & Celebration", desc: "Dance the night away under the stars with live music and DJ" },
            ].map((event, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: i * 0.15 }}
                className={`relative flex flex-col md:flex-row items-center gap-6 mb-14 ${
                  i % 2 === 1 ? "md:flex-row-reverse" : ""
                }`}
              >
                <motion.div
                  whileHover={{ y: -4, boxShadow: "0 16px 40px -8px rgba(244,114,182,0.15)" }}
                  className={`flex-1 bg-white p-6 rounded-2xl shadow-sm border border-pink-100 ${
                    i % 2 === 1 ? "md:text-left" : "md:text-right"
                  } text-center transition-shadow`}
                >
                  <p className="text-pink-400 font-medium text-sm mb-1">{event.time}</p>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{event.title}</h3>
                  <p className="text-gray-400 text-sm">{event.desc}</p>
                </motion.div>

                <motion.div
                  className="w-12 h-12 bg-pink-400 rounded-full flex items-center justify-center z-10 flex-shrink-0 shadow-lg shadow-pink-400/25"
                  animate={{
                    boxShadow: [
                      "0 0 0 0 rgba(244,114,182,0)",
                      "0 0 0 10px rgba(244,114,182,0.15)",
                      "0 0 0 0 rgba(244,114,182,0)",
                    ],
                  }}
                  transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.4 }}
                >
                  <Heart className="w-5 h-5 text-white fill-white" />
                </motion.div>

                <div className="flex-1 hidden md:block" />
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
            <p className="text-pink-400 tracking-[0.3em] uppercase text-xs mb-4">Photos</p>
            <h2 className="text-4xl sm:text-5xl font-extralight text-gray-800">Captured Moments</h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                whileHover={{ scale: 1.05, zIndex: 10 }}
                className={`${i === 0 || i === 5 ? "col-span-2 row-span-2" : ""} bg-gradient-to-br ${
                  i % 3 === 0 ? "from-pink-100 to-rose-100" :
                  i % 3 === 1 ? "from-rose-50 to-pink-100" :
                  "from-pink-50 to-rose-50"
                } rounded-2xl min-h-[120px] flex items-center justify-center cursor-pointer group relative overflow-hidden`}
              >
                <Camera className="w-6 h-6 text-pink-200 group-hover:text-pink-400 transition-colors" />
                <div className="absolute inset-0 bg-pink-400/0 group-hover:bg-pink-400/5 transition-colors" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ VENUE ═══ */}
      <section className="py-28 bg-pink-50/30 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-pink-400 tracking-[0.3em] uppercase text-xs mb-4">Venue</p>
            <h2 className="text-4xl sm:text-5xl font-extralight text-gray-800 mb-2">{venue}</h2>
            <p className="text-gray-400 mb-10">{venueAddr}</p>
            <div className="bg-gradient-to-br from-pink-100/40 to-rose-100/40 rounded-2xl h-72 sm:h-80 flex items-center justify-center shadow-inner">
              <MapPin className="w-10 h-10 text-pink-200" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ RSVP ═══ */}
      <section className="relative py-28 px-4 overflow-hidden">
        <FloatingPetals count={10} />
        <div className="max-w-md mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Heart className="w-10 h-10 text-pink-400 fill-pink-400 mx-auto mb-6" />
            </motion.div>
            <h2 className="text-4xl sm:text-5xl font-extralight text-gray-800 mb-2">Be Our Guest</h2>
            <p className="text-gray-300 text-sm mb-12">Please let us know by July 22, 2026</p>

            {rsvpSent ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-pink-50 rounded-2xl p-10"
              >
                <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 3, repeat: 1 }}>
                  <Heart className="w-12 h-12 text-pink-400 fill-pink-400 mx-auto mb-4" />
                </motion.div>
                <p className="text-2xl font-extralight text-gray-800">Thank you!</p>
                <p className="text-gray-400 mt-2 text-sm">We can&apos;t wait to see you there.</p>
              </motion.div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setRsvpSent(true); }} className="space-y-4">
                <input type="text" placeholder="Full Name" required className="w-full px-5 py-4 border border-pink-200 rounded-xl focus:outline-none focus:border-pink-400 focus:shadow-lg focus:shadow-pink-100/50 bg-white text-sm transition-all" />
                <input type="email" placeholder="Email" className="w-full px-5 py-4 border border-pink-200 rounded-xl focus:outline-none focus:border-pink-400 focus:shadow-lg focus:shadow-pink-100/50 bg-white text-sm transition-all" />
                <select className="w-full px-5 py-4 border border-pink-200 rounded-xl focus:outline-none focus:border-pink-400 bg-white text-sm text-gray-400">
                  <option value="">Attending?</option>
                  <option value="yes">Yes, I&apos;ll be there!</option>
                  <option value="no">Sorry, can&apos;t make it</option>
                </select>
                <input type="number" min="1" max="5" placeholder="Number of guests" className="w-full px-5 py-4 border border-pink-200 rounded-xl focus:outline-none focus:border-pink-400 bg-white text-sm transition-all" />
                <textarea placeholder="Any message for the couple?" rows={3} className="w-full px-5 py-4 border border-pink-200 rounded-xl focus:outline-none focus:border-pink-400 bg-white text-sm resize-none transition-all" />
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02, boxShadow: "0 8px 30px rgba(244,114,182,0.25)" }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-pink-400 to-rose-400 text-white py-4 rounded-xl font-medium shadow-lg shadow-pink-400/20"
                >
                  Send RSVP
                </motion.button>
              </form>
            )}
          </motion.div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="py-14 text-center bg-pink-50/30 px-4">
        <Heart className="w-5 h-5 text-pink-400 fill-pink-400 mx-auto mb-3" />
        <p className="text-gray-800 font-extralight text-xl">{bride} & {groom}</p>
        <p className="text-gray-300 text-sm mt-2">August 22, 2026 &middot; Hikkaduwa, Sri Lanka</p>
        <div className="flex justify-center gap-3 mt-6 mb-6">
          {[Phone, Mail].map((Icon, i) => (
            <motion.div key={i} whileHover={{ scale: 1.15 }} className="w-10 h-10 rounded-full border border-pink-200 flex items-center justify-center cursor-pointer">
              <Icon className="w-4 h-4 text-pink-400" />
            </motion.div>
          ))}
        </div>
        <p className="text-xs text-gray-200">
          Created with <Heart className="w-3 h-3 inline text-pink-400 fill-pink-400" /> by{" "}
          <Link href="/" className="text-pink-400 hover:underline">INVITATION.LK</Link>
        </p>
      </footer>
    </div>
  );
}
