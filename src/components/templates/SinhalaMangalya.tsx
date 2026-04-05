"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Heart, MapPin, Mail, Phone, Camera, ChevronDown } from "lucide-react";
import Link from "next/link";
import Countdown from "./shared/Countdown";
import { useState, useRef } from "react";

/* ── Detailed Mandala SVG ── */
function DetailedMandala({ size = 400, className = "", animate = true }: { size?: number; className?: string; animate?: boolean }) {
  const petals = 16;
  const c = size / 2;

  const svgContent = (
    <>
      {/* Outer ring decorations */}
      {Array.from({ length: 32 }).map((_, i) => {
        const angle = (360 / 32) * i;
        const rad = (angle * Math.PI) / 180;
        const r = c * 0.92;
        const x = c + Math.cos(rad) * r;
        const y = c + Math.sin(rad) * r;
        return <circle key={`outer-${i}`} cx={x} cy={y} r={i % 2 === 0 ? 3 : 2} fill="#c2185b" opacity={i % 2 === 0 ? 0.35 : 0.2} />;
      })}

      {/* Main petal layers */}
      {Array.from({ length: petals }).map((_, i) => {
        const angle = (360 / petals) * i;
        return (
          <g key={`petal-${i}`} transform={`rotate(${angle} ${c} ${c})`}>
            <ellipse cx={c} cy={c * 0.25} rx={c * 0.08} ry={c * 0.22} fill="none" stroke="#c2185b" strokeWidth="1.2" opacity="0.3" />
            <ellipse cx={c} cy={c * 0.35} rx={c * 0.05} ry={c * 0.14} fill="none" stroke="#d81b60" strokeWidth="0.8" opacity="0.25" />
            <circle cx={c} cy={c * 0.15} r="2.5" fill="#c2185b" opacity="0.25" />
            <path d={`M${c} ${c * 0.5} Q${c + 6} ${c * 0.42} ${c} ${c * 0.34} Q${c - 6} ${c * 0.42} ${c} ${c * 0.5}`} fill="none" stroke="#ad1457" strokeWidth="0.6" opacity="0.2" />
          </g>
        );
      })}

      {/* Secondary petals (offset) */}
      {Array.from({ length: petals }).map((_, i) => {
        const angle = (360 / petals) * i + 360 / petals / 2;
        return (
          <g key={`petal2-${i}`} transform={`rotate(${angle} ${c} ${c})`}>
            <ellipse cx={c} cy={c * 0.38} rx={c * 0.04} ry={c * 0.1} fill="none" stroke="#d81b60" strokeWidth="0.7" opacity="0.2" />
            <circle cx={c} cy={c * 0.3} r="1.5" fill="#c2185b" opacity="0.15" />
          </g>
        );
      })}

      {/* Concentric circles */}
      {[0.85, 0.72, 0.6, 0.5, 0.4, 0.3, 0.2, 0.12].map((r, i) => (
        <circle
          key={`ring-${i}`}
          cx={c} cy={c} r={c * r}
          fill="none"
          stroke={i % 2 === 0 ? "#c2185b" : "#d81b60"}
          strokeWidth={i < 2 ? 1 : 0.5}
          opacity={0.18 - i * 0.01}
          strokeDasharray={i === 2 || i === 5 ? "3 3" : "none"}
        />
      ))}

      {/* Inner decoration ring */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (360 / 8) * i;
        const rad = (angle * Math.PI) / 180;
        const r = c * 0.55;
        const x = c + Math.cos(rad) * r;
        const y = c + Math.sin(rad) * r;
        return (
          <g key={`inner-dec-${i}`}>
            <circle cx={x} cy={y} r="5" fill="none" stroke="#c2185b" strokeWidth="0.8" opacity="0.25" />
            <circle cx={x} cy={y} r="2" fill="#c2185b" opacity="0.12" />
          </g>
        );
      })}

      {/* Center lotus */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (360 / 8) * i;
        return (
          <g key={`lotus-${i}`} transform={`rotate(${angle} ${c} ${c})`}>
            <path
              d={`M${c} ${c - 15} Q${c + 8} ${c - 8} ${c} ${c} Q${c - 8} ${c - 8} ${c} ${c - 15}`}
              fill="#c2185b" opacity="0.1"
              stroke="#c2185b" strokeWidth="0.5"
            />
          </g>
        );
      })}
      <circle cx={c} cy={c} r="4" fill="#c2185b" opacity="0.18" />
      <circle cx={c} cy={c} r="2" fill="#d81b60" opacity="0.22" />
    </>
  );

  if (animate) {
    return (
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
        style={{ width: size, height: size }}
        className={className}
      >
        <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full pointer-events-none">
          {svgContent}
        </svg>
      </motion.div>
    );
  }

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className={`pointer-events-none ${className}`} style={{ width: size, height: size }}>
      {svgContent}
    </svg>
  );
}

/* ── Ornate border frame ── */
function OrnateFrame() {
  return (
    <div className="absolute inset-6 sm:inset-10 pointer-events-none">
      <svg className="w-full h-full" preserveAspectRatio="none">
        <motion.rect
          x="0" y="0" width="100%" height="100%"
          fill="none" stroke="#c2185b" strokeWidth="1" opacity="0.2"
          strokeDasharray="12 6 4 6"
          animate={{ strokeDashoffset: [0, -56] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />
        <rect x="8" y="8" width="calc(100% - 16)" height="calc(100% - 16)" rx="0" fill="none" stroke="#c2185b" strokeWidth="0.5" opacity="0.12" style={{ width: "calc(100% - 16px)", height: "calc(100% - 16px)" }} />
      </svg>
    </div>
  );
}

/* ── Floating sakura petals (reduced count for performance) ── */
function SakuraPetals() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 12 }).map((_, i) => {
        const size = 10 + (i % 5) * 4;
        const colors = ["rgba(194,24,91,0.15)", "rgba(216,27,96,0.12)", "rgba(173,20,87,0.1)", "rgba(236,72,153,0.12)"];
        return (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: `${(i * 37 + 11) % 100}%`,
              top: -20,
              width: size,
              height: size * 0.7,
              background: colors[i % colors.length],
              borderRadius: "50% 50% 50% 0",
            }}
            animate={{
              y: [0, 900 + i * 30],
              x: [0, Math.sin(i * 0.6) * 100, Math.cos(i) * 60],
              rotate: [0, 540 * (i % 2 === 0 ? 1 : -1)],
              opacity: [0, 0.6, 0.4, 0],
            }}
            transition={{ duration: 12 + i * 1.5, repeat: Infinity, delay: i * 0.7, ease: "easeIn" }}
          />
        );
      })}
    </div>
  );
}

/* ── Glowing particles (reduced count) ── */
function GlowParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 10 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: 3 + (i % 3) * 2,
            height: 3 + (i % 3) * 2,
            left: `${(i * 41 + 7) % 100}%`,
            top: `${(i * 29 + 13) % 100}%`,
            background: "radial-gradient(circle, rgba(194,24,91,0.5), transparent)",
            boxShadow: "0 0 8px 2px rgba(194,24,91,0.2)",
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.3, 0.7, 0.3],
            scale: [1, 1.5, 1],
          }}
          transition={{ duration: 3 + (i % 4), repeat: Infinity, delay: i * 0.4 }}
        />
      ))}
    </div>
  );
}

export default function SinhalaMangalya() {
  const [rsvpSent, setRsvpSent] = useState(false);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.7], [1, 0.95]);

  return (
    <div className="bg-[#fff8f9] text-gray-800 font-serif overflow-hidden">
      {/* Hero */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 overflow-hidden">
        <OrnateFrame />
        <SakuraPetals />
        <GlowParticles />

        {/* Corner mandalas */}
        <div className="absolute top-0 left-0 -translate-x-1/4 -translate-y-1/4">
          <DetailedMandala size={350} className="opacity-25" />
        </div>
        <div className="absolute top-0 right-0 translate-x-1/4 -translate-y-1/4">
          <DetailedMandala size={300} className="opacity-20" />
        </div>
        <div className="absolute bottom-0 left-0 -translate-x-1/4 translate-y-1/4">
          <DetailedMandala size={380} className="opacity-25" />
        </div>
        <div className="absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4">
          <DetailedMandala size={320} className="opacity-20" />
        </div>

        {/* Center mandala behind text */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <DetailedMandala size={500} className="opacity-[0.07]" animate={true} />
        </div>

        <motion.div style={{ opacity: heroOpacity, scale: heroScale }} className="relative z-10">
          {/* Title */}
          <motion.h2
            className="text-3xl sm:text-4xl text-pink-700 font-bold mb-4"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, type: "spring" }}
          >
            ශ්‍රී සුභ මංගලම් !
          </motion.h2>

          {/* Decorative line */}
          <motion.div
            className="flex items-center justify-center gap-3 mb-8"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            <div className="w-20 h-px bg-gradient-to-r from-transparent to-pink-400" />
            <motion.div
              animate={{ rotate: 360, scale: [1, 1.2, 1] }}
              transition={{ rotate: { duration: 20, repeat: Infinity, ease: "linear" }, scale: { duration: 2, repeat: Infinity } }}
            >
              <Heart className="w-4 h-4 text-pink-600 fill-pink-600" />
            </motion.div>
            <div className="w-20 h-px bg-gradient-to-l from-transparent to-pink-400" />
          </motion.div>

          {/* Couple illustration placeholder */}
          <motion.div
            className="w-36 h-36 mx-auto mb-8 relative"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 1, delay: 0.3, type: "spring" }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-pink-200 to-pink-100 rounded-full shadow-xl shadow-pink-200/30" />
            <div className="absolute inset-2 bg-gradient-to-br from-pink-50 to-white rounded-full flex items-center justify-center">
              <Heart className="w-16 h-16 text-pink-500 fill-pink-500" />
            </div>
            {/* Orbiting dots */}
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-pink-500 rounded-full"
                style={{ top: "50%", left: "50%" }}
                animate={{
                  x: [Math.cos((i * Math.PI) / 2) * 75, Math.cos((i * Math.PI) / 2 + Math.PI * 2) * 75],
                  y: [Math.sin((i * Math.PI) / 2) * 75, Math.sin((i * Math.PI) / 2 + Math.PI * 2) * 75],
                  opacity: [0.4, 0.7, 0.4],
                }}
                transition={{ duration: 8, repeat: Infinity, delay: i * 2, ease: "linear" }}
              />
            ))}
          </motion.div>

          {/* Parents & Names */}
          <div className="grid grid-cols-2 gap-8 sm:gap-16 mb-8 max-w-lg mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="text-center"
            >
              <p className="text-sm text-gray-600 mb-2 leading-relaxed">ආනන්ද රත්නායක මහතාගේ සහ<br />එම මැතිනියගේ ආදරණීය දියණිය</p>
              <h2 className="text-4xl sm:text-5xl font-bold text-pink-700">දිනුෂා</h2>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1, duration: 0.8 }}
              className="text-center"
            >
              <p className="text-sm text-gray-600 mb-2 leading-relaxed">චන්දසිරි කුමාරසිංහ මහතාගේ සහ<br />එම මැතිනියගේ ආදරණීය පුත්</p>
              <h2 className="text-4xl sm:text-5xl font-bold text-pink-700">කනේෂ්ක</h2>
            </motion.div>
          </div>

          {/* Sinhala poem */}
          <motion.div
            className="text-base text-gray-700 leading-loose max-w-md mx-auto mb-8 italic"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3 }}
          >
            <p>විශ්ව සතු ගෙන බැඳුණු - වසන්තය ලග ලගම</p>
            <p>සුවිශාල මල් පිපුණු - සිහිනයයි එලි දැකිම</p>
            <p className="mt-2">ආකාර දින ගෙවුණු - සත් වසර ගිය දුරක</p>
            <p>එක හිතින් අත රැඳුණු - ගිණාවකි මේ දවස</p>
          </motion.div>

          {/* Wedding details card */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 1.6, type: "spring" }}
          >
            <div className="bg-white/90 backdrop-blur-md rounded-2xl px-8 py-6 border border-pink-200 shadow-xl shadow-pink-200/30">
              <p className="text-sm text-pink-600 mb-1 font-medium">සමග අබියස ගයිමේ ප්‍රීතිය හිමිකරගන්න</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">2026 අගෝස්තු මස 18 වන දින</p>
              <p className="text-pink-700 font-semibold text-lg">හොටෙල් සිහාරනම්</p>
              <p className="text-sm text-gray-600 mt-1">පුත්තලම් පාර, ගොට්ටිනාපහම, අනුරාධපුර</p>
              <p className="text-sm text-gray-600 mt-1">උත්සව සැලසුම් පෙරවරය 09.00 සිට පස්වරු 03:30 දක්වා</p>
            </div>
            <div className="absolute -inset-4 bg-pink-200/15 rounded-3xl blur-xl -z-10" />
          </motion.div>
        </motion.div>

        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2.5, repeat: Infinity }}
          className="absolute bottom-8 z-10"
        >
          <ChevronDown className="w-6 h-6 text-pink-400" />
        </motion.div>
      </section>

      {/* Countdown */}
      <section className="relative py-24 bg-gradient-to-r from-pink-600 via-rose-600 to-pink-700 text-white text-center overflow-hidden">
        <SakuraPetals />
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="relative z-10">
          <p className="tracking-[0.4em] uppercase text-xs mb-10 text-pink-100">විවාහ දිනය දක්වා</p>
          <Countdown
            targetDate="2026-08-18T09:00:00"
            valueClassName="text-5xl sm:text-6xl font-light text-white"
            labelClassName="text-[10px] text-pink-200 tracking-[0.2em] uppercase mt-3"
            boxClassName="flex flex-col items-center bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-5 min-w-[85px]"
            separatorClassName="text-3xl font-light text-white/20 mx-1 self-start mt-3"
          />
        </motion.div>
      </section>

      {/* Events */}
      <section className="py-28 px-4 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <DetailedMandala size={400} className="opacity-[0.05]" animate={false} />
        </div>
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <p className="text-pink-500 tracking-[0.4em] uppercase text-xs mb-4">උත්සව විස්තර</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-pink-700 mb-12">Ceremony Schedule</h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              { title: "පොරුව උත්සවය", titleEn: "Poruwa Ceremony", time: "පෙ.ව. 09:00 - පෙ.ව. 10:30", venue: "හොටෙල් සිහාරනම්", desc: "සම්ප්‍රදායික පොරුව උත්සවය" },
              { title: "මංගල උත්සවය", titleEn: "Wedding Reception", time: "පෙ.ව. 10:30 - ප.ව. 03:30", venue: "හොටෙල් සිහාරනම්", desc: "මංගල උත්සවය සහ සාද භෝජනය" },
            ].map((event, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2, duration: 0.7 }}
                whileHover={{ y: -6, boxShadow: "0 20px 40px -12px rgba(194,24,91,0.15)" }}
                className="bg-white rounded-2xl p-7 border border-pink-200 shadow-sm transition-shadow"
              >
                <h3 className="text-xl font-bold text-pink-700 mb-1">{event.title}</h3>
                <p className="text-sm text-gray-500 mb-3">{event.titleEn}</p>
                <p className="text-sm text-pink-600 font-medium mb-1">{event.time}</p>
                <p className="text-sm text-gray-700">{event.venue}</p>
                <p className="text-sm text-gray-500 mt-3">{event.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="py-28 bg-pink-50/40 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-12">
            <p className="text-pink-500 tracking-[0.4em] uppercase text-xs mb-4">ඡායාරූප</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-pink-700">Our Moments</h2>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.85 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ scale: 1.04, zIndex: 10 }}
                className={`${i === 0 || i === 5 ? "row-span-2" : ""} bg-gradient-to-br from-pink-100 to-rose-50 rounded-2xl min-h-[140px] flex items-center justify-center cursor-pointer group relative overflow-hidden`}
              >
                <Camera className="w-6 h-6 text-pink-300 group-hover:text-pink-500 transition-colors" />
                <div className="absolute inset-0 bg-pink-500/0 group-hover:bg-pink-500/5 transition-colors" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Venue */}
      <section className="py-28 px-4 relative">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <p className="text-pink-500 tracking-[0.4em] uppercase text-xs mb-4">ස්ථානය</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-pink-700 mb-4">Wedding Venue</h2>
            <div className="flex items-center justify-center gap-2 mb-2">
              <MapPin className="w-5 h-5 text-pink-600" />
              <h3 className="text-xl font-semibold text-gray-800">හොටෙල් සිහාරනම්</h3>
            </div>
            <p className="text-gray-600 mb-8">පුත්තලම් පාර, ගොට්ටිනාපහම, අනුරාධපුර</p>
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl h-64 flex items-center justify-center border border-pink-200 shadow-inner"
            >
              <MapPin className="w-10 h-10 text-pink-300" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* RSVP */}
      <section className="relative py-28 bg-gradient-to-b from-pink-600 via-rose-600 to-pink-700 text-white px-4 overflow-hidden">
        <SakuraPetals />
        <div className="max-w-md mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <p className="text-pink-200 tracking-[0.3em] uppercase text-xs mb-4">ආරාධනය</p>
            <h2 className="text-3xl sm:text-4xl font-bold mb-2">Will You Join Us?</h2>
            <p className="text-pink-200 mb-2">(ඔබට / ඔබ දෙපලට / ඔබ සමඟ)</p>
            <p className="text-pink-100/80 text-sm mb-10">තොරතුරු ආරාධනා කරන්නෙමු</p>

            {rsvpSent ? (
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white/10 rounded-2xl p-10 backdrop-blur-sm border border-white/10">
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
                  <Heart className="w-14 h-14 text-pink-200 fill-pink-200 mx-auto mb-4" />
                </motion.div>
                <p className="text-2xl font-light">ස්තුතියි!</p>
                <p className="text-pink-200 mt-2 text-sm">ඔබේ සහභාගීත්වය අපට වටිනවා.</p>
              </motion.div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setRsvpSent(true); }} className="space-y-4">
                <input type="text" placeholder="ඔබේ නම" required className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/50 focus:outline-none focus:border-white/50 focus:shadow-lg focus:shadow-white/5 text-sm backdrop-blur-sm transition-all" />
                <input type="tel" placeholder="දුරකථන අංකය" className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/50 focus:outline-none focus:border-white/50 text-sm backdrop-blur-sm transition-all" />
                <select className="w-full px-5 py-4 bg-pink-700 border border-white/20 rounded-xl text-white focus:outline-none focus:border-white/50 text-sm">
                  <option value="">සහභාගී වේද?</option>
                  <option value="yes">ඔව්, පැමිණෙන්නෙමු</option>
                  <option value="no">සමාවන්න, පැමිණිය නොහැක</option>
                </select>
                <input type="number" min="1" max="10" placeholder="පැමිණෙන සංඛ්‍යාව" className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/50 focus:outline-none focus:border-white/50 text-sm backdrop-blur-sm transition-all" />
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02, boxShadow: "0 8px 30px rgba(255,255,255,0.15)" }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-white text-pink-700 py-4 rounded-xl font-semibold shadow-xl"
                >
                  යවන්න
                </motion.button>
              </form>
            )}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-14 text-center px-4 bg-[#fff8f9]">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}>
            <Heart className="w-6 h-6 text-pink-500 fill-pink-500 mx-auto mb-4" />
          </motion.div>
          <p className="text-pink-700 text-xl font-bold">දිනුෂා & කනේෂ්ක</p>
          <p className="text-gray-600 text-sm mt-1">2026 අගෝස්තු 18 &middot; අනුරාධපුර</p>
          <div className="flex justify-center gap-3 mt-6 mb-6">
            {[Phone, Mail].map((Icon, i) => (
              <motion.div key={i} whileHover={{ scale: 1.15 }} className="w-10 h-10 rounded-full border border-pink-300 flex items-center justify-center cursor-pointer">
                <Icon className="w-4 h-4 text-pink-500" />
              </motion.div>
            ))}
          </div>
          <p className="text-xs text-gray-500">
            Created with <Heart className="w-3 h-3 inline text-pink-500 fill-pink-500" /> by{" "}
            <Link href="/" className="text-pink-500 hover:underline">INVITATION.LK</Link>
          </p>
        </motion.div>
      </footer>
    </div>
  );
}
