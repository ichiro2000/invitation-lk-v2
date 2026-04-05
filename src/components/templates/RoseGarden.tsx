"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Heart, MapPin, Mail, Phone, Camera, ChevronDown, Calendar as CalendarIcon, Clock, Music, Utensils, GlassWater } from "lucide-react";
import Link from "next/link";
import Countdown from "./shared/Countdown";
import { useState, useRef, useEffect } from "react";

/* ── CSS Rose decoration (pure CSS floral) ── */
function CSSRose({ size = 60, className = "" }: { size?: number; className?: string }) {
  const petalSize = size * 0.4;
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      {/* Petals arranged in a circle */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: petalSize,
            height: petalSize * 1.3,
            background: i % 2 === 0
              ? "radial-gradient(ellipse, #f43f5e 0%, #be123c 60%, #881337 100%)"
              : "radial-gradient(ellipse, #fb7185 0%, #e11d48 60%, #be123c 100%)",
            top: "50%",
            left: "50%",
            transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-${size * 0.18}px)`,
            borderRadius: "50% 50% 50% 50%",
            opacity: 0.85,
          }}
        />
      ))}
      {/* Center */}
      <div
        className="absolute rounded-full"
        style={{
          width: size * 0.25,
          height: size * 0.25,
          background: "radial-gradient(circle, #fda4af, #f43f5e)",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />
    </div>
  );
}

/* ── Floating rose petals animation ── */
function FloatingPetals() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 10 }).map((_, i) => {
        const size = 8 + (i % 4) * 4;
        return (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: `${(i * 31 + 5) % 100}%`,
              top: -20,
              width: size,
              height: size * 0.7,
              background: i % 3 === 0 ? "rgba(244,63,94,0.15)" : i % 3 === 1 ? "rgba(190,18,60,0.12)" : "rgba(225,29,72,0.1)",
              borderRadius: "50% 50% 50% 0",
            }}
            animate={{
              y: [0, 800 + i * 20],
              x: [0, Math.sin(i * 0.8) * 80, Math.cos(i) * 50],
              rotate: [0, 360 * (i % 2 === 0 ? 1 : -1)],
              opacity: [0, 0.6, 0.4, 0],
            }}
            transition={{ duration: 14 + i * 1.2, repeat: Infinity, delay: i * 0.9, ease: "easeIn" }}
          />
        );
      })}
    </div>
  );
}

/* ── Decorative vine/stem line ── */
function VineDivider() {
  return (
    <div className="flex items-center justify-center gap-2 my-6">
      <svg width="80" height="20" viewBox="0 0 80 20" className="text-rose-300">
        <path d="M0 10 Q20 0 40 10 Q60 20 80 10" fill="none" stroke="currentColor" strokeWidth="1" />
        <circle cx="20" cy="5" r="2" fill="currentColor" opacity="0.5" />
        <circle cx="60" cy="15" r="2" fill="currentColor" opacity="0.5" />
      </svg>
      <Heart className="w-3 h-3 text-rose-400 fill-rose-400" />
      <svg width="80" height="20" viewBox="0 0 80 20" className="text-rose-300 scale-x-[-1]">
        <path d="M0 10 Q20 0 40 10 Q60 20 80 10" fill="none" stroke="currentColor" strokeWidth="1" />
        <circle cx="20" cy="5" r="2" fill="currentColor" opacity="0.5" />
        <circle cx="60" cy="15" r="2" fill="currentColor" opacity="0.5" />
      </svg>
    </div>
  );
}

/* ── Rose Corner decoration ── */
function RoseCorner({ position }: { position: "top-right" | "bottom-left" | "top-left" | "bottom-right" }) {
  const posClass = {
    "top-right": "top-0 right-0",
    "bottom-left": "bottom-0 left-0 rotate-180",
    "top-left": "top-0 left-0 scale-x-[-1]",
    "bottom-right": "bottom-0 right-0 rotate-180 scale-x-[-1]",
  }[position];

  return (
    <div className={`absolute ${posClass} w-48 h-48 pointer-events-none`}>
      <svg viewBox="0 0 200 200" className="w-full h-full">
        {/* Main rose */}
        <circle cx="160" cy="40" r="30" fill="#be123c" opacity="0.3" />
        <circle cx="160" cy="40" r="20" fill="#e11d48" opacity="0.25" />
        <circle cx="160" cy="40" r="10" fill="#fda4af" opacity="0.3" />
        {/* Smaller roses */}
        <circle cx="125" cy="65" r="20" fill="#f43f5e" opacity="0.25" />
        <circle cx="125" cy="65" r="12" fill="#fda4af" opacity="0.2" />
        <circle cx="175" cy="75" r="15" fill="#be123c" opacity="0.2" />
        <circle cx="175" cy="75" r="8" fill="#fda4af" opacity="0.15" />
        {/* Leaves */}
        <ellipse cx="140" cy="45" rx="8" ry="16" fill="#166534" opacity="0.2" transform="rotate(-30 140 45)" />
        <ellipse cx="180" cy="55" rx="6" ry="13" fill="#166534" opacity="0.15" transform="rotate(20 180 55)" />
        <ellipse cx="110" cy="50" rx="5" ry="10" fill="#166534" opacity="0.15" transform="rotate(-50 110 50)" />
        {/* Stems */}
        <path d="M160 70 Q150 100 120 120" fill="none" stroke="#166534" strokeWidth="1" opacity="0.15" />
        <path d="M125 85 Q110 100 90 105" fill="none" stroke="#166534" strokeWidth="0.8" opacity="0.12" />
      </svg>
    </div>
  );
}

/* ── Mini Calendar ── */
function MiniCalendar({ month, year, highlightDay }: { month: string; year: number; highlightDay: number }) {
  const days = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  const firstDay = new Date(`${month} 1, ${year}`).getDay();
  const daysInMonth = new Date(year, new Date(`${month} 1, ${year}`).getMonth() + 1, 0).getDate();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="bg-white rounded-2xl p-6 shadow-lg border border-rose-100 inline-block"
    >
      <div className="flex items-center justify-center gap-2 mb-4">
        <CalendarIcon className="w-4 h-4 text-rose-500" />
        <p className="text-center font-bold text-rose-700">{month} {year}</p>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {days.map((d) => (
          <div key={d} className="font-semibold text-gray-500 py-1">{d}</div>
        ))}
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const isHighlight = day === highlightDay;
          return (
            <motion.div
              key={day}
              whileHover={isHighlight ? { scale: 1.2 } : {}}
              className={`py-1 rounded-lg text-xs ${
                isHighlight
                  ? "bg-rose-600 text-white font-bold shadow-md shadow-rose-300/50"
                  : "text-gray-600 hover:bg-rose-50"
              }`}
            >
              {isHighlight ? (
                <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                  <Heart className="w-3 h-3 mx-auto fill-white" />
                </motion.div>
              ) : day}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

/* ── Countdown Timer Display ── */
function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const targetDate = new Date("2026-11-05T18:00:00").getTime();

    const update = () => {
      const now = new Date().getTime();
      const diff = targetDate - now;
      if (diff > 0) {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((diff % (1000 * 60)) / 1000),
        });
      }
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-center gap-3 sm:gap-5">
      {[
        { value: timeLeft.days, label: "Days" },
        { value: timeLeft.hours, label: "Hours" },
        { value: timeLeft.minutes, label: "Minutes" },
        { value: timeLeft.seconds, label: "Seconds" },
      ].map((item, i) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1 }}
          className="flex flex-col items-center bg-white/10 backdrop-blur-sm rounded-2xl px-4 sm:px-6 py-4 min-w-[70px] sm:min-w-[90px]"
        >
          <motion.span
            key={item.value}
            initial={{ opacity: 0.5, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-5xl font-light text-white"
          >
            {String(item.value).padStart(2, "0")}
          </motion.span>
          <span className="text-[10px] text-rose-200 tracking-wider uppercase mt-2">{item.label}</span>
        </motion.div>
      ))}
    </div>
  );
}

export default function RoseGarden() {
  const [rsvpSent, setRsvpSent] = useState(false);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.6], [1, 0.95]);

  return (
    <div className="bg-[#fff5f5] text-gray-800 font-serif overflow-hidden">
      {/* ═══ HERO ═══ */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 overflow-hidden">
        <RoseCorner position="top-right" />
        <RoseCorner position="bottom-left" />
        <RoseCorner position="top-left" />
        <RoseCorner position="bottom-right" />
        <FloatingPetals />

        {/* Pink wash background */}
        <div className="absolute inset-0 bg-gradient-to-b from-rose-50/80 via-[#fff5f5] to-rose-50/50" />

        {/* Ornate border */}
        <div className="absolute inset-6 sm:inset-10 pointer-events-none border border-rose-200/50 rounded-lg" />
        <div className="absolute inset-8 sm:inset-12 pointer-events-none border border-rose-100/40 rounded-lg" />

        <motion.div style={{ opacity: heroOpacity, scale: heroScale }} className="relative z-10 max-w-xl">
          {/* Top decorative rose */}
          <motion.div
            className="flex justify-center mb-6"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, type: "spring" }}
          >
            <CSSRose size={50} />
          </motion.div>

          <motion.h2
            className="text-3xl sm:text-4xl font-bold text-rose-700 mb-2"
            style={{ fontFamily: "'Dancing Script', cursive, serif" }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Homecoming
          </motion.h2>

          <VineDivider />

          <motion.p
            className="text-sm text-gray-500 mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Request the pleasure of the company of
          </motion.p>
          <motion.p
            className="text-sm text-gray-500 mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            Mr. &amp; Mrs. / Mr./Mrs./Miss. ........................
          </motion.p>

          {/* Couple Names */}
          <div className="flex items-center justify-center gap-4 sm:gap-8 mb-6">
            <motion.h1
              className="text-5xl sm:text-6xl font-bold text-rose-700"
              style={{ fontFamily: "'Dancing Script', cursive, serif" }}
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              Susantha
            </motion.h1>

            <motion.div
              className="relative"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.7 }}
            >
              <div className="w-16 h-16 bg-gradient-to-br from-rose-100 to-rose-200 rounded-full flex items-center justify-center shadow-lg shadow-rose-200/50">
                <motion.div
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <Heart className="w-7 h-7 text-rose-500 fill-rose-500" />
                </motion.div>
              </div>
            </motion.div>

            <motion.h1
              className="text-5xl sm:text-6xl font-bold text-rose-700"
              style={{ fontFamily: "'Dancing Script', cursive, serif" }}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              Nadee
            </motion.h1>
          </div>

          <motion.p
            className="text-sm text-gray-600 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            On the occasion of our Homecoming Function
          </motion.p>

          {/* Calendar & Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <div className="text-center bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-rose-100">
              <Clock className="w-4 h-4 text-rose-500 mx-auto mb-2" />
              <p className="text-sm text-rose-600 font-medium mb-1">From</p>
              <p className="text-lg font-bold text-gray-800">06:00 p.m.</p>
              <p className="text-sm text-gray-400">to</p>
              <p className="text-lg font-bold text-gray-800">11:30 p.m.</p>
            </div>

            <MiniCalendar month="November" year={2026} highlightDay={5} />

            <div className="text-center bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-rose-100">
              <MapPin className="w-4 h-4 text-rose-500 mx-auto mb-2" />
              <p className="text-sm text-rose-600 font-medium mb-1">At</p>
              <p className="text-lg font-bold text-gray-800">583,</p>
              <p className="text-sm text-gray-600">SINGHARUPAGAMA</p>
              <p className="text-sm text-gray-600">BENTOTA</p>
            </div>
          </motion.div>
        </motion.div>

        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }} className="absolute bottom-8 z-10">
          <ChevronDown className="w-6 h-6 text-rose-400" />
        </motion.div>
      </section>

      {/* ═══ COUNTDOWN ═══ */}
      <section className="relative py-24 bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 text-white text-center overflow-hidden">
        <FloatingPetals />
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="mb-6"
            >
              <Heart className="w-8 h-8 text-rose-200 fill-rose-200 mx-auto" />
            </motion.div>
            <p className="tracking-[0.3em] uppercase text-xs mb-2 text-rose-100">The Celebration Begins In</p>
            <p className="text-2xl font-light mb-8 text-white/90">November 5, 2026</p>
            <CountdownTimer />
          </motion.div>
        </div>
      </section>

      {/* ═══ OUR STORY ═══ */}
      <section className="py-28 px-4 relative">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <p className="text-rose-500 tracking-[0.3em] uppercase text-xs mb-4">Our Love Story</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-rose-700 mb-4"
              style={{ fontFamily: "'Dancing Script', cursive, serif" }}>
              How We Met
            </h2>
            <VineDivider />

            <motion.p
              className="text-gray-600 text-lg leading-loose mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              In the warm glow of a December evening, Susantha first caught a glimpse of Nadee at a mutual friend&apos;s gathering. Her laughter filled the room, and from that moment, he knew his world would never be the same.
            </motion.p>

            <motion.p
              className="text-gray-600 text-lg leading-loose"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              What started as stolen glances blossomed into deep conversations under starlit skies. Through seasons of joy and growth, their love only grew stronger, leading them to this beautiful chapter of their lives together.
            </motion.p>
          </motion.div>
        </div>

        {/* Decorative roses on sides */}
        <div className="absolute top-20 left-4 opacity-20">
          <CSSRose size={40} />
        </div>
        <div className="absolute bottom-20 right-4 opacity-20">
          <CSSRose size={35} />
        </div>
      </section>

      {/* ═══ EVENTS ═══ */}
      <section className="py-28 bg-gradient-to-b from-rose-50/50 to-[#fff5f5] px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-rose-500 tracking-[0.3em] uppercase text-xs mb-4">Celebration</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-rose-700"
              style={{ fontFamily: "'Dancing Script', cursive, serif" }}>
              Evening Programme
            </h2>
            <VineDivider />
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { time: "6:00 PM", title: "Welcome Drinks", icon: GlassWater, desc: "Arrival and welcome cocktails" },
              { time: "7:00 PM", title: "Dinner", icon: Utensils, desc: "Elegant sit-down dinner" },
              { time: "8:30 PM", title: "Entertainment", icon: Music, desc: "Live music and performances" },
              { time: "10:00 PM", title: "Dance Floor", icon: Heart, desc: "Dancing under the stars" },
            ].map((event, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                whileHover={{ y: -6, boxShadow: "0 20px 40px -12px rgba(190,18,60,0.12)" }}
                className="bg-white rounded-2xl p-6 text-center shadow-sm border border-rose-100 transition-all"
              >
                <motion.div
                  className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  whileHover={{ rotate: 12, scale: 1.1 }}
                >
                  <event.icon className="w-6 h-6 text-rose-500" />
                </motion.div>
                <p className="text-rose-500 text-sm font-semibold mb-1">{event.time}</p>
                <h3 className="text-gray-800 font-bold text-lg mb-2">{event.title}</h3>
                <p className="text-gray-500 text-sm">{event.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ GALLERY ═══ */}
      <section className="py-28 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <p className="text-rose-500 tracking-[0.3em] uppercase text-xs mb-4">Gallery</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-rose-700 mb-2"
              style={{ fontFamily: "'Dancing Script', cursive, serif" }}>
              Our Moments
            </h2>
            <VineDivider />
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ scale: 1.03, zIndex: 10 }}
                className={`${i === 0 || i === 5 ? "row-span-2" : ""} bg-gradient-to-br from-rose-100 to-red-50 rounded-2xl min-h-[140px] flex items-center justify-center cursor-pointer group relative overflow-hidden border border-rose-100`}
              >
                <Camera className="w-6 h-6 text-rose-300 group-hover:text-rose-500 transition-colors" />
                <div className="absolute inset-0 bg-rose-500/0 group-hover:bg-rose-500/5 transition-colors" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ VENUE ═══ */}
      <section className="py-28 bg-rose-50/40 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-rose-500 tracking-[0.3em] uppercase text-xs mb-4">Location</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-rose-700 mb-4"
              style={{ fontFamily: "'Dancing Script', cursive, serif" }}>
              Venue
            </h2>
            <VineDivider />
            <div className="flex items-center justify-center gap-2 mb-2 mt-6">
              <MapPin className="w-5 h-5 text-rose-500" />
              <h3 className="text-xl font-semibold text-gray-800">583, Singharupagama, Bentota</h3>
            </div>
            <p className="text-gray-500 mb-8">Southern Province, Sri Lanka</p>
            <div className="bg-gradient-to-br from-rose-50 to-red-50 rounded-2xl h-64 sm:h-72 flex items-center justify-center border border-rose-200 shadow-inner">
              <MapPin className="w-10 h-10 text-rose-300" />
            </div>
            <motion.div
              whileHover={{ y: -2 }}
              className="mt-8 bg-white rounded-xl p-5 inline-block shadow-sm border border-rose-100"
            >
              <p className="text-gray-500 text-sm mb-1">Dress Code</p>
              <p className="text-rose-700 font-medium text-lg">Semi-Formal &middot; Evening Attire</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══ RSVP ═══ */}
      <section className="relative py-28 bg-gradient-to-b from-rose-600 via-red-600 to-rose-700 text-white px-4 overflow-hidden">
        <FloatingPetals />
        <div className="max-w-md mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Heart className="w-8 h-8 text-rose-200 fill-rose-200 mx-auto mb-6" />
            </motion.div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-2"
              style={{ fontFamily: "'Dancing Script', cursive, serif" }}>
              RSVP
            </h2>
            <p className="text-rose-100 text-sm mb-10">Kindly respond by October 20, 2026</p>

            {rsvpSent ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white/10 rounded-2xl p-10 backdrop-blur-sm border border-white/10"
              >
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
                  <Heart className="w-14 h-14 text-rose-200 fill-rose-200 mx-auto mb-4" />
                </motion.div>
                <p className="text-2xl font-light">Thank you!</p>
                <p className="text-rose-200 mt-2 text-sm">We look forward to celebrating with you.</p>
              </motion.div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setRsvpSent(true); }} className="space-y-4">
                <input type="text" placeholder="Full Name" required className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/50 focus:outline-none focus:border-white/50 text-sm backdrop-blur-sm transition-all" />
                <input type="tel" placeholder="Phone Number" className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/50 focus:outline-none focus:border-white/50 text-sm backdrop-blur-sm transition-all" />
                <select className="w-full px-5 py-4 bg-rose-700 border border-white/20 rounded-xl text-white focus:outline-none focus:border-white/50 text-sm">
                  <option value="">Will you attend?</option>
                  <option value="yes">Yes, I&apos;ll be there!</option>
                  <option value="no">Sorry, can&apos;t make it</option>
                </select>
                <input type="number" min="1" max="10" placeholder="Number of guests" className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/50 focus:outline-none focus:border-white/50 text-sm backdrop-blur-sm transition-all" />
                <textarea placeholder="Any message for the couple..." rows={3} className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/50 focus:outline-none focus:border-white/50 text-sm resize-none backdrop-blur-sm transition-all" />
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02, boxShadow: "0 8px 30px rgba(255,255,255,0.15)" }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-white text-rose-700 py-4 rounded-xl font-semibold shadow-lg"
                >
                  Send RSVP
                </motion.button>
              </form>
            )}
          </motion.div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="py-16 text-center px-4 bg-[#fff5f5]">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <CSSRose size={40} className="mx-auto mb-4" />
          <p className="text-rose-700 text-2xl font-bold"
            style={{ fontFamily: "'Dancing Script', cursive, serif" }}>
            Susantha & Nadee
          </p>
          <p className="text-gray-500 text-sm mt-2">November 5, 2026 &middot; Bentota, Sri Lanka</p>
          <VineDivider />
          <div className="flex justify-center gap-3 mt-4 mb-6">
            {[Phone, Mail].map((Icon, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.15 }}
                className="w-10 h-10 rounded-full border border-rose-200 flex items-center justify-center cursor-pointer hover:bg-rose-50 transition-colors"
              >
                <Icon className="w-4 h-4 text-rose-500" />
              </motion.div>
            ))}
          </div>
          <p className="text-xs text-gray-400">
            Created with <Heart className="w-3 h-3 inline text-rose-500 fill-rose-500" /> by{" "}
            <Link href="/" className="text-rose-500 hover:underline">INVITATION.LK</Link>
          </p>
        </motion.div>
      </footer>
    </div>
  );
}
