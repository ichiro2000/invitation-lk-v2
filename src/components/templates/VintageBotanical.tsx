"use client";

import { motion } from "framer-motion";
import { Heart, MapPin, Mail, Phone, Camera, ChevronDown, Leaf } from "lucide-react";
import Link from "next/link";
import Countdown from "./shared/Countdown";
import { useState } from "react";
import type { InvitationData } from "@/types/invitation";

/* ── Floating leaves ── */
function FloatingLeaves() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            left: i % 2 === 0 ? `${(i * 15) % 100}%` : "auto",
            right: i % 2 === 1 ? `${(i * 12) % 50}%` : "auto",
            top: -30,
          }}
          animate={{
            y: [0, 800 + i * 20],
            x: [0, Math.sin(i * 0.5) * 60, Math.cos(i) * 40],
            rotate: [0, 180 * (i % 2 === 0 ? 1 : -1)],
            opacity: [0, 0.3, 0.2, 0],
          }}
          transition={{ duration: 12 + i * 2, repeat: Infinity, delay: i * 1.2 }}
        >
          <Leaf className={`w-5 h-5 ${i % 3 === 0 ? "text-green-400/30" : i % 3 === 1 ? "text-emerald-500/20" : "text-green-600/25"}`} />
        </motion.div>
      ))}
    </div>
  );
}

export default function VintageBotanical({ data }: { data?: InvitationData } = {}) {
  const groom = data?.groomName || "කසුන් දීපානායක";
  const bride = data?.brideName || "නයෝමි දීපානායක";
  const date = data?.weddingDate || "2026-12-21";
  const time = data?.weddingTime || "9:00 AM";
  const venue = data?.venue || "දේශානි උත්සව ශාලාව";
  const venueAddr = data?.venueAddress || "බටුගෙදර, රත්නපුර";
  const events = data?.events || [
    { title: "පොරුව උත්සවය", time: "10:50 AM", venue: "දේශානි උත්සව ශාලාව", description: "පෝරුව චාරිත්‍ර" },
    { title: "මංගල උත්සවය", time: "පෙ.ව. 09.00 - ප.ව. 03.30", venue: "දේශානි උත්සව ශාලාව", description: "මංගල උත්සවය සහ සාද භෝජනය" },
  ];

  const [rsvpSent, setRsvpSent] = useState(false);

  return (
    <div className="bg-[#fefdf9] text-gray-800 font-serif overflow-hidden">
      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 overflow-hidden">
        {/* Leaf decorations */}
        <FloatingLeaves />
        <div className="absolute top-0 right-0 w-64 h-96 opacity-10">
          <svg viewBox="0 0 200 400" className="w-full h-full">
            <motion.path d="M180 0 Q160 80 140 160 Q120 240 180 320 Q150 280 130 220 Q110 160 120 80 Q130 40 180 0" fill="#2d5a27" animate={{ d: ["M180 0 Q160 80 140 160 Q120 240 180 320 Q150 280 130 220 Q110 160 120 80 Q130 40 180 0", "M180 0 Q155 90 135 170 Q115 250 175 330 Q145 290 125 230 Q105 170 115 90 Q125 50 180 0", "M180 0 Q160 80 140 160 Q120 240 180 320 Q150 280 130 220 Q110 160 120 80 Q130 40 180 0"] }} transition={{ duration: 8, repeat: Infinity }} />
          </svg>
        </div>
        <div className="absolute bottom-0 left-0 w-64 h-96 opacity-10 scale-x-[-1]">
          <svg viewBox="0 0 200 400" className="w-full h-full">
            <path d="M180 400 Q160 320 140 240 Q120 160 180 80 Q150 120 130 180 Q110 240 120 320 Q130 360 180 400" fill="#2d5a27" />
          </svg>
        </div>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} className="relative z-10 max-w-lg">
          {/* Couple illustration placeholder */}
          <motion.div
            className="w-28 h-28 mx-auto mb-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-full flex items-center justify-center border-2 border-green-200/50"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.3 }}
          >
            <Heart className="w-12 h-12 text-green-500 fill-green-500" />
          </motion.div>

          {/* Parents */}
          <motion.p className="text-xs text-gray-400 leading-relaxed mb-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
            නිමේශිගලු වටාපන පදිංචි එම්.ජී. දිසානායක<br />මැතිතුමා හා එම මැතිනියගේ ආදරණීය දියණිය
          </motion.p>

          <motion.h1 className="text-4xl sm:text-5xl font-bold text-green-800 mb-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            {bride}
          </motion.h1>

          <motion.p className="text-xs text-gray-400 leading-relaxed mb-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
            මැදගම මැතුලයගම පදිංචි සැසිරිය ඩී.එම්. ජයසේන<br />මැතිතුමාගේ හා සුජීවන් එම මැතිනියගේ ආදරණීය පුත්
          </motion.p>

          <motion.h1 className="text-4xl sm:text-5xl font-bold text-green-800 mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}>
            {groom}
          </motion.h1>

          {/* Wedding details */}
          <motion.div
            className="bg-white rounded-2xl px-8 py-6 shadow-sm border border-green-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
          >
            <p className="text-sm text-green-600 mb-1">සමග අබියස ගයිමේ ප්‍රීතිය හිමිකරගන්න</p>
            <p className="text-2xl font-bold text-gray-800 mb-1">2026 දෙසැම්බර් මස 21 වෙනි දින</p>
            <p className="text-sm text-gray-500">පෙ.ව. 09.00 සිට ප.ව. 03.30 දක්වා</p>
            <p className="text-sm text-gray-400 mt-2">(පෝරුව චාරිත්‍ර පෙරවරය 10.50 ට)</p>
            <div className="w-16 h-px bg-green-200 mx-auto my-4" />
            <p className="text-green-700 font-semibold">{venue}</p>
          </motion.div>

          {/* Invite type */}
          <motion.div
            className="mt-6 border-t border-dashed border-green-200 pt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
          >
            <p className="text-sm text-gray-500 italic">(ඔබට/ඔබ දෙපලට/ඔබ සමඟ)</p>
            <p className="text-sm text-gray-500 italic">තොරතුරු ආරාධනය කරන්නෙමු !</p>
          </motion.div>
        </motion.div>

        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }} className="absolute bottom-8 z-10">
          <ChevronDown className="w-6 h-6 text-green-300" />
        </motion.div>
      </section>

      {/* Countdown */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="tracking-[0.3em] uppercase text-xs mb-8 text-green-100">Counting Down</p>
          <Countdown
            targetDate={`${date}T09:00:00`}
            valueClassName="text-3xl sm:text-6xl font-light text-white"
            labelClassName="text-[10px] text-green-200 tracking-wider uppercase mt-2"
            boxClassName="flex flex-col items-center bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl px-3 sm:px-5 py-4 min-w-[60px] sm:min-w-[85px]"
            separatorClassName="text-xl sm:text-3xl font-light text-white/30 mx-1 self-start mt-2"
          />
        </motion.div>
      </section>

      {/* Gallery */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-3xl font-bold text-green-800 mb-12 text-center">
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
                className={`${i === 1 || i === 4 ? "row-span-2" : ""} bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl min-h-[140px] flex items-center justify-center cursor-pointer group border border-green-100/50`}
              >
                <Camera className="w-6 h-6 text-green-200 group-hover:text-green-400 transition-colors" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Venue */}
      <section className="py-24 bg-green-50/30 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl font-bold text-green-800 mb-4">Venue</h2>
            <div className="flex items-center justify-center gap-2 mb-2">
              <MapPin className="w-5 h-5 text-green-500" />
              <h3 className="text-xl font-semibold text-gray-800">{venue}</h3>
            </div>
            <p className="text-gray-400 mb-8">{venueAddr}</p>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl h-64 flex items-center justify-center border border-green-100">
              <MapPin className="w-10 h-10 text-green-200" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* RSVP */}
      <section className="py-24 bg-gradient-to-b from-green-600 to-emerald-700 text-white px-4">
        <div className="max-w-md mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <Leaf className="w-8 h-8 text-green-200 mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">RSVP</h2>
            <p className="text-green-100 text-sm mb-10">Kindly respond by December 1, 2026</p>

            {rsvpSent ? (
              <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="bg-white/10 rounded-2xl p-8 backdrop-blur-sm">
                <Heart className="w-12 h-12 text-green-200 fill-green-200 mx-auto mb-4" />
                <p className="text-xl">Thank you!</p>
              </motion.div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setRsvpSent(true); }} className="space-y-4">
                <input type="text" placeholder="Full Name" required className="w-full px-5 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-white/50 text-sm backdrop-blur-sm" />
                <input type="tel" placeholder="Phone Number" className="w-full px-5 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-white/50 text-sm backdrop-blur-sm" />
                <select className="w-full px-5 py-3 bg-green-700 border border-white/20 rounded-xl text-white focus:outline-none text-sm">
                  <option value="">Will you attend?</option>
                  <option value="yes">Yes, I will attend</option>
                  <option value="no">Sorry, cannot make it</option>
                </select>
                <input type="number" min="1" max="10" placeholder="Number of guests" className="w-full px-5 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-white/50 text-sm backdrop-blur-sm" />
                <motion.button type="submit" whileHover={{ scale: 1.02 }} className="w-full bg-white text-green-700 py-3 rounded-xl font-semibold shadow-lg">
                  Send RSVP
                </motion.button>
              </form>
            )}
          </motion.div>
        </div>
      </section>

      {/* Contact & Footer */}
      <footer className="py-10 text-center px-4 bg-[#fefdf9]">
        <Heart className="w-5 h-5 text-green-500 fill-green-500 mx-auto mb-3" />
        <p className="text-green-800 text-lg font-bold">{bride} & {groom}</p>
        <p className="text-gray-400 text-sm mt-1">2026 දෙසැම්බර් 21 &middot; රත්නපුර</p>
        <p className="text-sm text-gray-500 mt-4">නයෝමි - 07X XXX XXXX</p>
        <div className="flex justify-center gap-3 mt-4 mb-4">
          <div className="w-9 h-9 rounded-full border border-green-200 flex items-center justify-center"><Phone className="w-4 h-4 text-green-500" /></div>
          <div className="w-9 h-9 rounded-full border border-green-200 flex items-center justify-center"><Mail className="w-4 h-4 text-green-500" /></div>
        </div>
        <p className="text-xs text-gray-300">
          Created with <Heart className="w-3 h-3 inline text-green-500 fill-green-500" /> by{" "}
          <Link href="/" className="text-green-500 hover:underline">INVITATION.LK</Link>
        </p>
      </footer>
    </div>
  );
}
