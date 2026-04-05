"use client";

import { motion } from "framer-motion";
import { Heart, MapPin, Mail, Phone, Camera, ChevronDown, Calendar as CalendarIcon } from "lucide-react";
import Link from "next/link";
import Countdown from "./shared/Countdown";
import { useState } from "react";

/* ── Rose decorations ── */
function RoseCorner({ position }: { position: string }) {
  const posClass =
    position === "top-right" ? "top-0 right-0" : position === "bottom-left" ? "bottom-0 left-0" : "";
  return (
    <div className={`absolute ${posClass} w-48 h-48 pointer-events-none`}>
      <svg viewBox="0 0 200 200" className="w-full h-full opacity-20">
        <circle cx="160" cy="40" r="35" fill="#be123c" opacity="0.5" />
        <circle cx="130" cy="70" r="25" fill="#e11d48" opacity="0.4" />
        <circle cx="170" cy="80" r="20" fill="#be123c" opacity="0.3" />
        <ellipse cx="140" cy="50" rx="8" ry="15" fill="#166534" opacity="0.3" transform="rotate(-30 140 50)" />
        <ellipse cx="180" cy="60" rx="6" ry="12" fill="#166534" opacity="0.25" transform="rotate(20 180 60)" />
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
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-rose-100 inline-block">
      <p className="text-center font-bold text-rose-700 mb-3">{month} {year}</p>
      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {days.map((d) => (
          <div key={d} className="font-medium text-gray-400 py-1">{d}</div>
        ))}
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const isHighlight = day === highlightDay;
          return (
            <div
              key={day}
              className={`py-1 rounded-lg text-xs ${
                isHighlight
                  ? "bg-rose-600 text-white font-bold shadow-md"
                  : "text-gray-500"
              }`}
            >
              {isHighlight ? <Heart className="w-3 h-3 mx-auto fill-white" /> : day}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function RoseGarden() {
  const [rsvpSent, setRsvpSent] = useState(false);

  return (
    <div className="bg-[#fff5f5] text-gray-800 font-serif overflow-hidden">
      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 overflow-hidden">
        <RoseCorner position="top-right" />
        <div className="absolute bottom-0 left-0 w-48 h-48 pointer-events-none scale-x-[-1] scale-y-[-1]">
          <svg viewBox="0 0 200 200" className="w-full h-full opacity-20">
            <circle cx="160" cy="40" r="35" fill="#be123c" opacity="0.5" />
            <circle cx="130" cy="70" r="25" fill="#e11d48" opacity="0.4" />
            <circle cx="170" cy="80" r="20" fill="#be123c" opacity="0.3" />
          </svg>
        </div>

        {/* Pink wash background */}
        <div className="absolute inset-0 bg-gradient-to-b from-rose-50/80 via-[#fff5f5] to-rose-50/50" />

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} className="relative z-10">
          <motion.h2
            className="text-3xl sm:text-4xl font-bold text-rose-700 mb-6"
            style={{ fontFamily: "'Dancing Script', cursive, serif" }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Homecoming
          </motion.h2>

          <p className="text-sm text-gray-400 mb-4">Request the pleasure of the company of</p>

          {/* Couple */}
          <div className="flex items-center justify-center gap-6 sm:gap-10 mb-6">
            <motion.h1
              className="text-4xl sm:text-5xl font-bold text-rose-700"
              style={{ fontFamily: "'Dancing Script', cursive, serif" }}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              Susantha
            </motion.h1>

            <motion.div
              className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.7 }}
            >
              <Heart className="w-8 h-8 text-rose-500 fill-rose-500" />
            </motion.div>

            <motion.h1
              className="text-4xl sm:text-5xl font-bold text-rose-700"
              style={{ fontFamily: "'Dancing Script', cursive, serif" }}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              Nadee
            </motion.h1>
          </div>

          <p className="text-sm text-gray-500 mb-2">Mr. &amp; Mrs. / Mr./Mrs./Miss. ........................</p>
          <p className="text-sm text-gray-500 mb-8">On the occasion of our Homecoming Function</p>

          {/* Calendar */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <div className="text-center">
              <p className="text-sm text-rose-600 font-medium mb-1">From</p>
              <p className="text-lg font-bold text-gray-800">06:00 p.m.</p>
              <p className="text-sm text-gray-400">to</p>
              <p className="text-lg font-bold text-gray-800">11:30 p.m.</p>
            </div>

            <MiniCalendar month="November" year={2026} highlightDay={5} />

            <div className="text-center">
              <p className="text-sm text-rose-600 font-medium mb-1">At</p>
              <p className="text-lg font-bold text-gray-800">583,</p>
              <p className="text-sm text-gray-500">SINGHARUPAGAMA</p>
              <p className="text-sm text-gray-500">BENTOTA</p>
            </div>
          </motion.div>
        </motion.div>

        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }} className="absolute bottom-8 z-10">
          <ChevronDown className="w-6 h-6 text-rose-300" />
        </motion.div>
      </section>

      {/* Countdown */}
      <section className="py-20 bg-gradient-to-r from-rose-600 to-red-600 text-white text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="tracking-[0.3em] uppercase text-xs mb-8 text-rose-100">The Celebration Begins In</p>
          <Countdown
            targetDate="2026-11-05T18:00:00"
            valueClassName="text-5xl sm:text-6xl font-light text-white"
            labelClassName="text-[10px] text-rose-200 tracking-wider uppercase mt-2"
            boxClassName="flex flex-col items-center bg-white/10 backdrop-blur-sm rounded-2xl px-5 py-4 min-w-[85px]"
            separatorClassName="text-3xl font-light text-white/30 mx-1 self-start mt-2"
          />
        </motion.div>
      </section>

      {/* Gallery */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-3xl font-bold text-rose-700 mb-12 text-center">
            Our Moments
          </motion.h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ scale: 1.03 }}
                className={`${i === 0 || i === 5 ? "row-span-2" : ""} bg-gradient-to-br from-rose-100 to-red-50 rounded-2xl min-h-[140px] flex items-center justify-center cursor-pointer group`}
              >
                <Camera className="w-6 h-6 text-rose-200 group-hover:text-rose-500 transition-colors" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Venue */}
      <section className="py-24 bg-rose-50/30 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl font-bold text-rose-700 mb-4">Venue</h2>
            <div className="flex items-center justify-center gap-2 mb-2">
              <MapPin className="w-5 h-5 text-rose-500" />
              <h3 className="text-xl font-semibold">583, Singharupagama, Bentota</h3>
            </div>
            <div className="bg-gradient-to-br from-rose-50 to-red-50 rounded-2xl h-64 flex items-center justify-center border border-rose-100 mt-8">
              <MapPin className="w-10 h-10 text-rose-200" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* RSVP */}
      <section className="py-24 bg-gradient-to-b from-rose-600 to-red-700 text-white px-4">
        <div className="max-w-md mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <Heart className="w-8 h-8 text-rose-200 fill-rose-200 mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">RSVP</h2>
            <p className="text-rose-100 text-sm mb-10">Kindly respond by October 20, 2026</p>

            {rsvpSent ? (
              <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="bg-white/10 rounded-2xl p-8">
                <Heart className="w-12 h-12 text-rose-200 fill-rose-200 mx-auto mb-4" />
                <p className="text-xl">Thank you!</p>
              </motion.div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setRsvpSent(true); }} className="space-y-4">
                <input type="text" placeholder="Full Name" required className="w-full px-5 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-white/50 text-sm backdrop-blur-sm" />
                <input type="tel" placeholder="Phone Number" className="w-full px-5 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-white/50 text-sm backdrop-blur-sm" />
                <select className="w-full px-5 py-3 bg-rose-700 border border-white/20 rounded-xl text-white focus:outline-none text-sm">
                  <option value="">Will you attend?</option>
                  <option value="yes">Yes, I&apos;ll be there!</option>
                  <option value="no">Sorry, can&apos;t make it</option>
                </select>
                <input type="number" min="1" max="10" placeholder="Number of guests" className="w-full px-5 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-white/50 text-sm backdrop-blur-sm" />
                <motion.button type="submit" whileHover={{ scale: 1.02 }} className="w-full bg-white text-rose-700 py-3 rounded-xl font-semibold shadow-lg">
                  Send RSVP
                </motion.button>
              </form>
            )}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 text-center px-4 bg-[#fff5f5]">
        <Heart className="w-5 h-5 text-rose-500 fill-rose-500 mx-auto mb-3" />
        <p className="text-rose-700 text-lg font-bold">Susantha & Nadee</p>
        <p className="text-gray-400 text-sm mt-1">November 5, 2026 &middot; Bentota</p>
        <div className="flex justify-center gap-3 mt-4 mb-4">
          <div className="w-9 h-9 rounded-full border border-rose-200 flex items-center justify-center"><Phone className="w-4 h-4 text-rose-500" /></div>
          <div className="w-9 h-9 rounded-full border border-rose-200 flex items-center justify-center"><Mail className="w-4 h-4 text-rose-500" /></div>
        </div>
        <p className="text-xs text-gray-300">
          Created with <Heart className="w-3 h-3 inline text-rose-500 fill-rose-500" /> by{" "}
          <Link href="/" className="text-rose-500 hover:underline">INVITATION.LK</Link>
        </p>
      </footer>
    </div>
  );
}
