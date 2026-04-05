"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { Heart, MapPin, Mail, Phone, Music, Camera, ChevronDown } from "lucide-react";
import Countdown from "./shared/Countdown";
import { useState, useRef } from "react";
import type { InvitationData } from "@/types/invitation";

/* ── Floating golden sparkles ── */
function GoldParticles({ count = 30 }: { count?: number }) {
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
              background: `radial-gradient(circle, #d4a853 0%, #c9a96e 50%, transparent 100%)`,
              boxShadow: "0 0 6px 2px rgba(201,169,110,.4)",
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
function OrnateCorner({ position }: { position: string }) {
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
        <path d="M0 0 L40 0 Q30 10 30 20 L30 30 Q20 30 10 30 L0 40 Z" fill="none" stroke="#c9a96e" strokeWidth="1" opacity="0.6" />
        <path d="M0 0 L25 0 Q18 8 18 15 L18 18 Q8 18 0 25 Z" fill="none" stroke="#c9a96e" strokeWidth="0.5" opacity="0.3" />
        <circle cx="5" cy="5" r="2" fill="#c9a96e" opacity="0.5" />
      </svg>
    </motion.div>
  );
}

/* ── Animated divider ── */
function GoldenDivider() {
  return (
    <motion.div
      className="flex items-center justify-center gap-4 my-6"
      initial={{ scaleX: 0 }}
      animate={{ scaleX: 1 }}
      transition={{ duration: 1, delay: 0.8 }}
    >
      <motion.div
        className="h-px bg-gradient-to-r from-transparent via-[#c9a96e] to-[#c9a96e]"
        style={{ width: 80 }}
        animate={{ opacity: [0.3, 0.8, 0.3] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
      <motion.div
        animate={{ rotate: 360, scale: [1, 1.2, 1] }}
        transition={{ rotate: { duration: 20, repeat: Infinity, ease: "linear" }, scale: { duration: 2, repeat: Infinity } }}
      >
        <Heart className="w-5 h-5 text-[#c9a96e] fill-[#c9a96e]" />
      </motion.div>
      <motion.div
        className="h-px bg-gradient-to-l from-transparent via-[#c9a96e] to-[#c9a96e]"
        style={{ width: 80 }}
        animate={{ opacity: [0.3, 0.8, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
      />
    </motion.div>
  );
}

export default function RoyalElegance({ data }: { data?: InvitationData } = {}) {
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

  return (
    <div className="bg-[#fdf8f4] text-[#3d1f1f] font-serif overflow-hidden">
      {/* ═══ HERO ═══ */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 overflow-hidden">
        {/* Animated background gradient pulse */}
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              "radial-gradient(ellipse at 50% 50%, rgba(92,40,40,0.03) 0%, transparent 70%)",
              "radial-gradient(ellipse at 50% 50%, rgba(201,169,110,0.06) 0%, transparent 70%)",
              "radial-gradient(ellipse at 50% 50%, rgba(92,40,40,0.03) 0%, transparent 70%)",
            ],
          }}
          transition={{ duration: 6, repeat: Infinity }}
        />

        <GoldParticles count={25} />

        {/* Ornate corners */}
        {["top-left", "top-right", "bottom-right", "bottom-left"].map((pos) => (
          <OrnateCorner key={pos} position={pos} />
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
              fill="none" stroke="#c9a96e" strokeWidth="1" opacity="0.3"
              strokeDasharray="8 4"
              animate={{ strokeDashoffset: [0, -24] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
          </svg>
        </motion.div>

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10">
          <motion.p
            className="text-[#c9a96e] tracking-[0.4em] uppercase text-xs sm:text-sm mb-8"
            initial={{ opacity: 0, letterSpacing: "0.1em" }}
            animate={{ opacity: 1, letterSpacing: "0.4em" }}
            transition={{ duration: 1.5 }}
          >
            Together with their families
          </motion.p>

          <motion.h1
            className="text-6xl sm:text-8xl lg:text-9xl font-light text-[#5c2828] leading-none"
            initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            {bride}
          </motion.h1>

          <GoldenDivider />

          <motion.h1
            className="text-6xl sm:text-8xl lg:text-9xl font-light text-[#5c2828] leading-none"
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
            <p className="text-lg sm:text-xl text-[#8b5e5e] mb-1">Request the honour of your presence</p>
            <p className="text-lg sm:text-xl text-[#8b5e5e]">at the celebration of their marriage</p>
          </motion.div>

          <motion.div
            className="mt-10 relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.5 }}
          >
            <div className="bg-[#5c2828]/5 backdrop-blur-sm rounded-xl px-10 py-5 border border-[#c9a96e]/20">
              <p className="text-[#c9a96e] tracking-[0.3em] uppercase text-xs mb-1">Saturday</p>
              <p className="text-3xl sm:text-4xl font-light text-[#5c2828]">June 15, 2026</p>
              <p className="text-[#c9a96e] tracking-[0.2em] uppercase text-xs mt-1">at four o&apos;clock in the afternoon</p>
            </div>
            {/* Glow effect */}
            <div className="absolute -inset-4 bg-[#c9a96e]/5 rounded-2xl blur-xl -z-10" />
          </motion.div>
        </motion.div>

        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 z-10"
        >
          <ChevronDown className="w-6 h-6 text-[#c9a96e]" />
        </motion.div>
      </section>

      {/* ═══ COUNTDOWN ═══ */}
      <section className="relative py-24 bg-[#5c2828] text-white text-center overflow-hidden">
        <GoldParticles count={15} />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative z-10"
        >
          <p className="text-[#c9a96e] tracking-[0.4em] uppercase text-xs mb-10">Counting Down To Our Big Day</p>
          <Countdown
            targetDate={`${date}T16:00:00`}
            valueClassName="text-3xl sm:text-6xl font-light text-white"
            labelClassName="text-[10px] text-[#c9a96e] tracking-[0.3em] uppercase mt-3"
            boxClassName="flex flex-col items-center min-w-[60px] sm:min-w-[100px]"
            separatorClassName="text-2xl sm:text-4xl font-light text-[#c9a96e]/20 mx-1 sm:mx-2 self-start"
          />
        </motion.div>
      </section>

      {/* ═══ LOVE STORY TIMELINE ═══ */}
      <section className="py-28 px-4 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <p className="text-[#c9a96e] tracking-[0.4em] uppercase text-xs mb-4">Our Love Story</p>
          <h2 className="text-4xl sm:text-5xl font-light text-[#5c2828]">How We Met</h2>
        </motion.div>

        {/* Vertical timeline */}
        <div className="relative">
          {/* Animated center line */}
          <motion.div
            className="absolute left-6 md:left-1/2 top-0 w-px bg-gradient-to-b from-[#c9a96e]/50 via-[#c9a96e]/30 to-transparent"
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
                  className="bg-white p-6 rounded-xl shadow-sm border border-[#c9a96e]/10 hover:shadow-lg hover:shadow-[#c9a96e]/10 transition-shadow"
                >
                  <h3 className="text-xl font-semibold text-[#5c2828] mb-2">{event.title}</h3>
                  <p className="text-[#8b5e5e] text-sm leading-relaxed">{event.desc}</p>
                </motion.div>
              </div>

              {/* Center dot */}
              <motion.div
                className="absolute left-0 md:relative z-10 w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#5c2828] flex items-center justify-center text-[#c9a96e] text-xs md:text-sm font-bold flex-shrink-0 shadow-lg"
                whileHover={{ scale: 1.2 }}
                animate={{ boxShadow: ["0 0 0 0 rgba(201,169,110,0)", "0 0 0 8px rgba(201,169,110,0.2)", "0 0 0 0 rgba(201,169,110,0)"] }}
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

      {/* ═══ EVENTS ═══ */}
      <section className="py-28 bg-[#5c2828]/5 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-[#c9a96e] tracking-[0.4em] uppercase text-xs mb-4">Wedding Events</p>
            <h2 className="text-4xl sm:text-5xl font-light text-[#5c2828]">Ceremony Schedule</h2>
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
                whileHover={{ y: -8, boxShadow: "0 20px 40px -12px rgba(92,40,40,0.15)" }}
                className="bg-white rounded-2xl p-8 text-center shadow-sm border border-[#c9a96e]/10 cursor-default"
              >
                <motion.div
                  className="w-16 h-16 bg-gradient-to-br from-[#5c2828] to-[#7a3535] rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg"
                  whileHover={{ rotate: 12 }}
                >
                  <event.icon className="w-7 h-7 text-[#c9a96e]" />
                </motion.div>
                <h3 className="text-lg font-semibold text-[#5c2828] mb-2">{event.title}</h3>
                <p className="text-[#c9a96e] text-sm font-medium mb-1">{event.time}</p>
                <p className="text-[#8b5e5e] text-sm mb-3">{event.venue}</p>
                <div className="w-8 h-px bg-[#c9a96e]/30 mx-auto mb-3" />
                <p className="text-sm text-[#8b5e5e]/70">{event.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ GALLERY with hover-zoom ═══ */}
      <section className="py-28 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-[#c9a96e] tracking-[0.4em] uppercase text-xs mb-4">Gallery</p>
            <h2 className="text-4xl sm:text-5xl font-light text-[#5c2828]">Our Moments</h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { h: "h-64 md:h-72", span: "md:col-span-2", gradient: "from-[#c9a96e]/30 via-[#5c2828]/10 to-[#c9a96e]/20" },
              { h: "h-64 md:h-72", span: "", gradient: "from-[#5c2828]/20 to-[#c9a96e]/20" },
              { h: "h-56", span: "", gradient: "from-[#8b5e5e]/20 to-[#c9a96e]/30" },
              { h: "h-56", span: "", gradient: "from-[#c9a96e]/25 to-[#8b5e5e]/15" },
              { h: "h-56", span: "md:col-span-1", gradient: "from-[#5c2828]/25 to-[#c9a96e]/15" },
              { h: "h-64 md:h-72", span: "col-span-2 md:col-span-3", gradient: "from-[#c9a96e]/15 via-[#5c2828]/10 to-[#c9a96e]/20" },
            ].map((img, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.85 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.08 }}
                whileHover={{ scale: 1.03 }}
                className={`${img.h} ${img.span} bg-gradient-to-br ${img.gradient} rounded-2xl overflow-hidden flex items-center justify-center cursor-pointer group relative`}
              >
                <Camera className="w-8 h-8 text-[#5c2828]/20 group-hover:scale-110 transition-transform" />
                <div className="absolute inset-0 bg-[#5c2828]/0 group-hover:bg-[#5c2828]/10 transition-colors rounded-2xl" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ VENUE ═══ */}
      <section className="py-28 bg-[#5c2828]/5 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-[#c9a96e] tracking-[0.4em] uppercase text-xs mb-4">Location</p>
            <h2 className="text-4xl sm:text-5xl font-light text-[#5c2828] mb-4">Wedding Venue</h2>
            <div className="flex items-center justify-center gap-2 mb-2">
              <MapPin className="w-5 h-5 text-[#c9a96e]" />
              <h3 className="text-xl font-semibold text-[#5c2828]">{venue}</h3>
            </div>
            <p className="text-[#8b5e5e] mb-10">{venueAddr}</p>
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="bg-gradient-to-br from-[#c9a96e]/10 to-[#5c2828]/10 rounded-2xl h-72 sm:h-80 flex items-center justify-center border border-[#c9a96e]/10 shadow-inner"
            >
              <div className="text-center">
                <MapPin className="w-12 h-12 text-[#c9a96e]/40 mx-auto mb-3" />
                <p className="text-[#8b5e5e]/50 text-sm">Interactive Map</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══ RSVP ═══ */}
      <section className="relative py-28 bg-[#5c2828] text-white px-4 overflow-hidden">
        <GoldParticles count={12} />
        <div className="max-w-lg mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-[#c9a96e] tracking-[0.4em] uppercase text-xs mb-4">RSVP</p>
            <h2 className="text-4xl sm:text-5xl font-light mb-4">Will You Join Us?</h2>
            <p className="text-white/50 mb-12 text-sm">Kindly respond by May 15, 2026</p>

            {rsvpSent ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-10 border border-[#c9a96e]/20"
              >
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
                  <Heart className="w-14 h-14 text-[#c9a96e] fill-[#c9a96e] mx-auto mb-4" />
                </motion.div>
                <p className="text-2xl font-light">Thank you!</p>
                <p className="text-white/50 mt-2">We look forward to celebrating with you.</p>
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
                    whileFocus={{ borderColor: "#c9a96e", boxShadow: "0 0 20px rgba(201,169,110,0.15)" }}
                    className="w-full px-5 py-4 bg-white/5 border border-[#c9a96e]/20 rounded-xl text-white placeholder:text-white/30 focus:outline-none transition-all backdrop-blur-sm"
                  />
                ))}
                <select className="w-full px-5 py-4 bg-white/5 border border-[#c9a96e]/20 rounded-xl text-white/80 focus:outline-none focus:border-[#c9a96e] backdrop-blur-sm">
                  <option value="" className="text-gray-900">Will you attend?</option>
                  <option value="yes" className="text-gray-900">Joyfully Accept</option>
                  <option value="no" className="text-gray-900">Respectfully Decline</option>
                </select>
                <select className="w-full px-5 py-4 bg-white/5 border border-[#c9a96e]/20 rounded-xl text-white/80 focus:outline-none focus:border-[#c9a96e] backdrop-blur-sm">
                  <option value="" className="text-gray-900">Number of Guests</option>
                  {[1, 2, 3, 4].map(n => <option key={n} value={n} className="text-gray-900">{n} {n === 1 ? "Guest" : "Guests"}</option>)}
                </select>
                <textarea placeholder="Any dietary requirements or message..." rows={3} className="w-full px-5 py-4 bg-white/5 border border-[#c9a96e]/20 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#c9a96e] resize-none backdrop-blur-sm" />
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(201,169,110,0.3)" }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-[#c9a96e] to-[#d4b87a] text-[#3d1f1f] py-4 rounded-xl font-semibold tracking-wider uppercase text-sm shadow-lg"
                >
                  Send RSVP
                </motion.button>
              </motion.form>
            )}
          </motion.div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="py-14 text-center px-4 bg-[#fdf8f4]">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}>
            <Heart className="w-6 h-6 text-[#c9a96e] fill-[#c9a96e] mx-auto mb-4" />
          </motion.div>
          <p className="text-[#5c2828] text-xl font-light mb-2">{bride} & {groom}</p>
          <p className="text-[#8b5e5e] text-sm mb-8">June 15, 2026 &middot; Colombo, Sri Lanka</p>
          <div className="flex items-center justify-center gap-4 mb-8">
            {[Phone, Mail].map((Icon, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.15, borderColor: "#c9a96e" }}
                className="w-11 h-11 rounded-full border border-[#c9a96e]/30 flex items-center justify-center cursor-pointer transition-colors"
              >
                <Icon className="w-4 h-4 text-[#c9a96e]" />
              </motion.div>
            ))}
          </div>
          <p className="text-xs text-[#8b5e5e]/40">
            Created with <Heart className="w-3 h-3 inline text-[#c9a96e] fill-[#c9a96e]" /> by{" "}
            <Link href="/" className="text-[#c9a96e] hover:underline">INVITATION.LK</Link>
          </p>
        </motion.div>
      </footer>
    </div>
  );
}
