"use client";

import { motion, useScroll, useTransform, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Heart, MapPin, Mail, Phone, Camera, ChevronDown, Award, Plane, Radio, Lock, FileText } from "lucide-react";
import Countdown from "./shared/Countdown";
import { useState, useRef, useEffect } from "react";

/* ── Flying aircraft with contrail across the hero ── */
function FlyingAircraft() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
      <motion.div
        className="absolute top-[15%]"
        initial={{ x: "-20vw" }}
        animate={{ x: "120vw" }}
        transition={{ duration: 14, repeat: Infinity, ease: "linear", delay: 1.5, repeatDelay: 2 }}
      >
        <motion.div
          className="relative"
          animate={{ y: [0, -6, 4, -4, 0], rotate: [0, -1.5, 1, -1, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Contrail */}
          <div className="absolute top-1/2 right-full w-[400px] h-[3px] -translate-y-1/2 pr-1">
            <div className="w-full h-full bg-gradient-to-l from-[#e6c77a] via-[#e6c77a]/50 to-transparent blur-[1px]" />
            <div className="absolute top-1/2 w-full h-[10px] -translate-y-1/2 bg-gradient-to-l from-white/30 via-white/10 to-transparent blur-md" />
          </div>
          {/* Plane — horizontal silhouette pointing right */}
          <svg viewBox="0 0 64 28" className="w-14 h-6 drop-shadow-[0_0_12px_rgba(230,199,122,0.8)]">
            <g fill="#e6c77a" stroke="#0f2744" strokeWidth="0.6" strokeLinejoin="round">
              {/* Fuselage */}
              <path d="M 4 14 Q 6 11 14 11 L 52 11 Q 58 11 62 14 Q 58 17 52 17 L 14 17 Q 6 17 4 14 Z" />
              {/* Main wings (swept back) */}
              <path d="M 24 11 L 18 3 L 30 3 L 36 11 Z" />
              <path d="M 24 17 L 18 25 L 30 25 L 36 17 Z" />
              {/* Tail fins */}
              <path d="M 48 11 L 45 6 L 51 6 L 54 11 Z" />
              <path d="M 48 17 L 45 22 L 51 22 L 54 17 Z" />
              {/* Nose cone */}
              <circle cx="60" cy="14" r="2.5" />
            </g>
            {/* Cockpit window */}
            <ellipse cx="52" cy="14" rx="3" ry="1.5" fill="#0f2744" opacity="0.6" />
          </svg>
        </motion.div>
      </motion.div>
    </div>
  );
}

/* ── Radar sweep ring ── */
function RadarSweep({ size = 400 }: { size?: number }) {
  return (
    <div
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
      style={{ width: size, height: size }}
    >
      {[1, 0.75, 0.5].map((scale, i) => (
        <motion.div
          key={i}
          className="absolute inset-0 rounded-full border border-[#c9a268]/15"
          style={{ transform: `scale(${scale})` }}
          animate={{ opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 4, repeat: Infinity, delay: i * 0.5 }}
        />
      ))}
      <motion.div
        className="absolute inset-0"
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      >
        <div
          className="absolute top-1/2 left-1/2 origin-left h-[1px]"
          style={{
            width: size / 2,
            background: "linear-gradient(to right, rgba(201,162,104,0.6), transparent)",
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 origin-left"
          style={{
            width: size / 2,
            height: size / 4,
            background: "conic-gradient(from 0deg, transparent, rgba(201,162,104,0.12) 10%, transparent 20%)",
            transform: "translateY(-50%)",
          }}
        />
      </motion.div>
    </div>
  );
}

/* ── Morse code easter egg: "I LOVE U" ── */
function MorseCode() {
  // I=.. L=.-.. O=--- V=...- E=. U=..-
  const pattern = [1,0,1,0,0,0, 1,0,1,1,1,0,1,0,1,0,0,0, 1,1,1,0,1,1,1,0,1,1,1,0,0,0, 1,0,1,0,1,0,1,1,1,0,0,0, 1,0,0,0, 1,0,1,0,1,1,1,0,0,0];
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % pattern.length), 220);
    return () => clearInterval(t);
  }, [pattern.length]);
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-1 z-20 pointer-events-none">
      <div
        className="w-1.5 h-1.5 rounded-full transition-all"
        style={{
          background: pattern[idx] ? "#e6c77a" : "transparent",
          boxShadow: pattern[idx] ? "0 0 8px #e6c77a" : "none",
        }}
      />
      <span className="text-[8px] text-[#c9a268]/40 tracking-[0.3em] uppercase">· — ·</span>
    </div>
  );
}

/* ── Confetti burst on RSVP ── */
function Confetti() {
  const pieces = Array.from({ length: 40 });
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {pieces.map((_, i) => {
        const angle = (i / pieces.length) * 360;
        const distance = 200 + (i % 5) * 40;
        const color = i % 3 === 0 ? "#e6c77a" : i % 3 === 1 ? "#c9a268" : "#ffffff";
        const size = 4 + (i % 4) * 2;
        return (
          <motion.div
            key={i}
            className="absolute top-1/2 left-1/2"
            style={{ width: size, height: size * 2, background: color }}
            initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
            animate={{
              x: Math.cos((angle * Math.PI) / 180) * distance,
              y: Math.sin((angle * Math.PI) / 180) * distance + 200,
              opacity: 0,
              rotate: 720,
            }}
            transition={{ duration: 1.8, ease: "easeOut" }}
          />
        );
      })}
    </div>
  );
}

/* ── Mission dossier intro overlay ── */
function MissionDossier({ onOpen }: { onOpen: () => void }) {
  const [stage, setStage] = useState<"closed" | "stamping" | "opening">("closed");

  useEffect(() => {
    const t1 = setTimeout(() => setStage("stamping"), 800);
    return () => clearTimeout(t1);
  }, []);

  const handleOpen = () => {
    setStage("opening");
    setTimeout(onOpen, 1200);
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-[#1a1611] flex items-center justify-center p-6"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      {/* Scanlines */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, #c9a268 2px, #c9a268 3px)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30, rotateX: -15 }}
        animate={{
          opacity: 1,
          y: 0,
          rotateX: 0,
          rotateY: stage === "opening" ? [0, -10, -180] : 0,
          scale: stage === "opening" ? [1, 1.05, 0.6] : 1,
        }}
        transition={{ duration: stage === "opening" ? 1 : 0.8 }}
        style={{ transformStyle: "preserve-3d", perspective: 1200 }}
        className="relative max-w-md w-full"
      >
        {/* Manila folder */}
        <div className="bg-[#d4b87a] rounded-sm shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] p-8 border-2 border-[#b88b3a] relative overflow-hidden">
          {/* Classification strip */}
          <div className="absolute top-0 left-0 right-0 bg-[#8b1a1a] text-[#f5e6d3] text-center py-1 text-xs tracking-[0.4em] font-bold">
            TOP SECRET // EYES ONLY
          </div>

          <div className="mt-6 text-[#2a1f14]">
            <p className="text-[10px] tracking-[0.4em] opacity-60 mb-1">CLASSIFICATION</p>
            <p className="text-[10px] tracking-[0.3em] mb-5">SLAF // MATRIMONIAL OPS</p>

            <p className="text-[10px] tracking-[0.4em] opacity-60 mb-1">OPERATION CODENAME</p>
            <h2 className="text-3xl font-bold tracking-wider mb-5 font-serif">BLUE WINGS</h2>

            <div className="grid grid-cols-2 gap-3 text-[10px] mb-5">
              <div>
                <p className="tracking-[0.2em] opacity-60">FILE NO.</p>
                <p className="font-mono tracking-wider">SLAF-2026-1114</p>
              </div>
              <div>
                <p className="tracking-[0.2em] opacity-60">CLEARANCE</p>
                <p className="font-mono tracking-wider">LEVEL ∞</p>
              </div>
              <div>
                <p className="tracking-[0.2em] opacity-60">OPERATIVES</p>
                <p className="font-mono tracking-wider">2 PRIMARY</p>
              </div>
              <div>
                <p className="tracking-[0.2em] opacity-60">STATUS</p>
                <p className="font-mono tracking-wider text-[#8b1a1a]">INBOUND</p>
              </div>
            </div>

            <div className="border-t border-dashed border-[#8b6914]/40 pt-4 mb-4">
              <p className="text-[10px] tracking-[0.3em] opacity-60 mb-2">MISSION BRIEFING ENCLOSED</p>
              <p className="text-xs leading-relaxed italic">
                Contents pertain to the union of two operatives.
                Attendance is requested. Classification clearance granted upon receipt.
              </p>
            </div>

            {/* DECLASSIFIED stamp */}
            <AnimatePresence>
              {stage !== "closed" && (
                <motion.div
                  initial={{ scale: 3, opacity: 0, rotate: -30 }}
                  animate={{ scale: 1, opacity: 1, rotate: -12 }}
                  transition={{ duration: 0.4, type: "spring" }}
                  className="absolute top-20 right-4 border-4 border-[#8b1a1a] text-[#8b1a1a] px-3 py-1.5 font-bold tracking-[0.2em] text-sm opacity-90 rotate-[-12deg]"
                  style={{ fontFamily: "serif" }}
                >
                  DECLASSIFIED
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              onClick={handleOpen}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={stage === "opening"}
              className="w-full bg-[#2a1f14] text-[#d4b87a] py-3 rounded-sm font-bold tracking-[0.3em] text-xs uppercase hover:bg-[#3a2a1c] transition-colors disabled:opacity-50"
            >
              {stage === "opening" ? "◆ ACCESSING ◆" : "◆ Open Briefing ◆"}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── Orbital portrait: couple photo in circle, plane orbiting around it ── */
function OrbitalPortrait() {
  return (
    <div className="relative mx-auto" style={{ width: 480, height: 480, maxWidth: "100%" }}>
      {/* Soft radial glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="w-[420px] h-[420px] rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(201,162,104,0.25) 0%, transparent 70%)" }}
        />
      </div>

      {/* Orbit rings */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 480 480">
        <circle cx="240" cy="240" r="225" fill="none" stroke="#c9a268" strokeWidth="1" strokeDasharray="6 4" opacity="0.4" />
        <circle cx="240" cy="240" r="238" fill="none" stroke="#c9a268" strokeWidth="0.5" opacity="0.2" />
        {/* Compass ticks */}
        {Array.from({ length: 24 }).map((_, i) => {
          const angle = (i / 24) * Math.PI * 2 - Math.PI / 2;
          const x1 = 240 + Math.cos(angle) * 225;
          const y1 = 240 + Math.sin(angle) * 225;
          const x2 = 240 + Math.cos(angle) * (i % 6 === 0 ? 210 : 218);
          const y2 = 240 + Math.sin(angle) * (i % 6 === 0 ? 210 : 218);
          return (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#c9a268" strokeWidth="1" opacity={i % 6 === 0 ? 0.8 : 0.3} />
          );
        })}
        {/* Cardinal markers */}
        <text x="240" y="195" textAnchor="middle" className="fill-[#c9a268] text-[10px] font-mono" style={{ letterSpacing: "2px" }}>N</text>
        <text x="288" y="245" textAnchor="middle" className="fill-[#c9a268] text-[10px] font-mono" style={{ letterSpacing: "2px" }}>E</text>
        <text x="240" y="295" textAnchor="middle" className="fill-[#c9a268] text-[10px] font-mono" style={{ letterSpacing: "2px" }}>S</text>
        <text x="192" y="245" textAnchor="middle" className="fill-[#c9a268] text-[10px] font-mono" style={{ letterSpacing: "2px" }}>W</text>
      </svg>

      {/* Rotating plane around the orbit */}
      <motion.div
        className="absolute inset-0"
        animate={{ rotate: 360 }}
        transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
      >
        {/* Plane at top of orbit, pointing right (clockwise tangent) */}
        <div className="absolute left-1/2 -translate-x-1/2" style={{ top: 8 }}>
          {/* Contrail trailing behind (to the left of plane since it moves right at this position) */}
          <div className="absolute top-1/2 right-full w-28 h-[2px] -translate-y-1/2 mr-1">
            <div className="w-full h-full bg-gradient-to-l from-[#e6c77a] to-transparent blur-[1px]" />
            <div className="absolute inset-0 w-full h-[6px] -translate-y-1/2 top-1/2 bg-gradient-to-l from-white/30 to-transparent blur-md" />
          </div>
          <svg viewBox="0 0 64 28" className="w-14 h-6 drop-shadow-[0_0_12px_rgba(230,199,122,0.9)]">
            <g fill="#e6c77a" stroke="#0f2744" strokeWidth="0.6" strokeLinejoin="round">
              <path d="M 4 14 Q 6 11 14 11 L 52 11 Q 58 11 62 14 Q 58 17 52 17 L 14 17 Q 6 17 4 14 Z" />
              <path d="M 24 11 L 18 3 L 30 3 L 36 11 Z" />
              <path d="M 24 17 L 18 25 L 30 25 L 36 17 Z" />
              <path d="M 48 11 L 45 6 L 51 6 L 54 11 Z" />
              <path d="M 48 17 L 45 22 L 51 22 L 54 17 Z" />
              <circle cx="60" cy="14" r="2.5" />
            </g>
            <ellipse cx="52" cy="14" rx="3" ry="1.5" fill="#0f2744" opacity="0.6" />
          </svg>
        </div>
      </motion.div>

      {/* Central circular portrait */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative"
        >
          {/* Gold ring with pulse */}
          <motion.div
            className="absolute -inset-3 rounded-full border-2 border-[#c9a268]"
            animate={{ opacity: [0.3, 0.7, 0.3], scale: [1, 1.04, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          <div
            className="relative w-80 h-80 sm:w-96 sm:h-96 rounded-full overflow-hidden border-[3px] border-[#c9a268] bg-gradient-to-b from-[#1e3a5f] to-[#0a1a35]"
            style={{ boxShadow: "0 0 60px rgba(201,162,104,0.4), inset 0 0 40px rgba(201,162,104,0.15)" }}
          >
            <img
              src="/couple-portrait.png"
              alt="Sashini & Wing Cmdr. Ravindu"
              className="absolute inset-0 w-full h-full object-contain p-2"
              style={{ objectPosition: "center center" }}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

/* ── Animated flight path map of Sri Lanka ── */
function FlightPathMap() {
  const [activeWaypoint, setActiveWaypoint] = useState<number | null>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const [pathLen, setPathLen] = useState(0);

  useEffect(() => {
    if (pathRef.current) setPathLen(pathRef.current.getTotalLength());
  }, []);

  const waypoints = [
    { x: 215, y: 380, label: "CMB", year: "2018", title: "FIRST CONTACT", loc: "Colombo", desc: "Charity gala. A shared laugh over mistaken identities." },
    { x: 275, y: 235, label: "ANU", year: "2020", title: "LONG-RANGE OPS", loc: "Anuradhapura", desc: "Midnight radio calls across deployments. Letters carried the bond." },
    { x: 340, y: 290, label: "SGR", year: "2024", title: "TARGET ACQUIRED", loc: "Sigiriya", desc: "Proposal under a guard of honour at sunrise on the rock." },
    { x: 205, y: 410, label: "RML", year: "2026", title: "WEDDING", loc: "Ratmalana", desc: "Mission objective: marriage. 14 Nov 2026 · 15:00 hours." },
  ];

  const pathD = waypoints.reduce((acc, w, i) => {
    if (i === 0) return `M ${w.x} ${w.y}`;
    const prev = waypoints[i - 1];
    const cx = (prev.x + w.x) / 2 + (i % 2 === 0 ? 30 : -30);
    const cy = (prev.y + w.y) / 2 + (i % 2 === 0 ? -20 : 20);
    return `${acc} Q ${cx} ${cy} ${w.x} ${w.y}`;
  }, "");

  return (
    <div className="relative max-w-5xl mx-auto">
      <svg viewBox="100 100 400 400" className="w-full h-auto" style={{ filter: "drop-shadow(0 0 40px rgba(201,162,104,0.15))" }}>
        <defs>
          <pattern id="grid-pattern" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#c9a268" strokeWidth="0.3" opacity="0.2" />
          </pattern>
          <radialGradient id="map-glow">
            <stop offset="0%" stopColor="#c9a268" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#c9a268" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Grid */}
        <rect x="100" y="100" width="400" height="400" fill="url(#grid-pattern)" />

        {/* Sri Lanka outline (approximated, teardrop shape) */}
        <motion.path
          d="M 250 150 Q 310 155 340 200 Q 370 240 370 300 Q 365 360 330 410 Q 295 450 250 455 Q 210 450 180 410 Q 155 360 155 300 Q 165 220 205 175 Q 225 155 250 150 Z"
          fill="url(#map-glow)"
          stroke="#c9a268"
          strokeWidth="1.5"
          strokeOpacity="0.6"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 2.5 }}
        />

        {/* Flight path */}
        <motion.path
          ref={pathRef}
          d={pathD}
          fill="none"
          stroke="#e6c77a"
          strokeWidth="1.5"
          strokeDasharray="4 4"
          strokeDashoffset={0}
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 3, delay: 1 }}
        />

        {/* Animated plane traveling path */}
        <g>
          {/* Glow halo following plane */}
          <circle r="10" fill="#e6c77a" opacity="0.2">
            <animateMotion dur="12s" repeatCount="indefinite" begin="3s" path={pathD} rotate="auto" />
          </circle>
          {/* Plane silhouette */}
          <g>
            {/* Drawn pointing "right" (along +X) so rotate="auto" aligns with path direction */}
            <path
              d="M -7 0 L 6 0 L 9 -2 L 9 2 L 6 0 M -3 -5 L 2 0 L -3 5 Z M -5 -2 L -3 -2 L -3 2 L -5 2 Z"
              fill="#e6c77a"
              stroke="#0f2744"
              strokeWidth="0.4"
            />
            <animateMotion dur="12s" repeatCount="indefinite" begin="3s" path={pathD} rotate="auto" />
          </g>
        </g>

        {/* Waypoints */}
        {waypoints.map((w, i) => (
          <g key={i} onMouseEnter={() => setActiveWaypoint(i)} onMouseLeave={() => setActiveWaypoint(null)} style={{ cursor: "pointer" }}>
            {/* Pulse ring */}
            <motion.circle
              cx={w.x}
              cy={w.y}
              r="8"
              fill="none"
              stroke="#e6c77a"
              strokeWidth="1"
              animate={{ r: [8, 18, 8], opacity: [0.8, 0, 0.8] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
            />
            <motion.circle
              cx={w.x}
              cy={w.y}
              r={activeWaypoint === i ? 8 : 6}
              fill="#e6c77a"
              stroke="#0f2744"
              strokeWidth="2"
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 1 + i * 0.3, type: "spring" }}
            />
            <text
              x={w.x}
              y={w.y - 16}
              textAnchor="middle"
              className="text-[9px] font-mono tracking-wider fill-[#e6c77a]"
            >
              {w.label}
            </text>
            <text
              x={w.x}
              y={w.y + 22}
              textAnchor="middle"
              className="text-[8px] fill-[#c9a268]/70"
            >
              {w.year}
            </text>
          </g>
        ))}

        {/* HUD crosshair corners */}
        {[
          [110, 110], [490, 110], [110, 490], [490, 490],
        ].map(([x, y], i) => {
          const xDir = x < 300 ? 1 : -1;
          const yDir = y < 300 ? 1 : -1;
          return (
            <g key={i} stroke="#c9a268" strokeWidth="1" opacity="0.6" fill="none">
              <line x1={x} y1={y} x2={x + 15 * xDir} y2={y} />
              <line x1={x} y1={y} x2={x} y2={y + 15 * yDir} />
            </g>
          );
        })}

        {/* Radar text */}
        <text x="110" y="130" className="text-[8px] font-mono fill-[#c9a268]/60" style={{ letterSpacing: "2px" }}>
          LAT 7.8731° N
        </text>
        <text x="410" y="130" className="text-[8px] font-mono fill-[#c9a268]/60" style={{ letterSpacing: "2px" }}>
          LON 80.7718° E
        </text>
      </svg>

      {/* Waypoint detail card */}
      <div className="mt-8 min-h-[140px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeWaypoint ?? "default"}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="bg-white/5 backdrop-blur-sm border border-[#c9a268]/30 rounded-xl p-6 max-w-md mx-auto text-center"
          >
            {activeWaypoint === null ? (
              <div>
                <p className="text-[10px] tracking-[0.3em] text-[#c9a268] mb-2">HOVER A WAYPOINT</p>
                <p className="text-white/60 text-sm">Trace our flight path — four years, four chapters.</p>
              </div>
            ) : (
              <div>
                <p className="text-[10px] tracking-[0.3em] text-[#c9a268] mb-1">
                  WAYPOINT {waypoints[activeWaypoint].label} · {waypoints[activeWaypoint].year}
                </p>
                <h3 className="text-xl font-light text-white mb-1 tracking-wide">
                  {waypoints[activeWaypoint].title}
                </h3>
                <p className="text-[#e6c77a] text-xs mb-3">{waypoints[activeWaypoint].loc}</p>
                <p className="text-white/70 text-sm leading-relaxed">
                  {waypoints[activeWaypoint].desc}
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ── ATC radio chatter ticker ── */
function ATCTicker() {
  const messages = [
    "SLAF-114, cleared for approach, runway honour-14",
    "Roger tower, on final, three souls on board",
    "Winds calm, love ceiling unlimited, cleared to land",
    "Copy that, beginning descent to forever",
    "Welcome home, SLAF-114. Godspeed",
  ];
  const full = messages.join("  ◆  ");
  return (
    <div className="bg-[#0a1a2e] border-y border-[#c9a268]/30 py-3 overflow-hidden relative">
      <div className="absolute left-0 top-0 bottom-0 flex items-center pl-4 z-10 bg-gradient-to-r from-[#0a1a2e] via-[#0a1a2e] to-transparent pr-6">
        <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity }}>
          <Radio className="w-4 h-4 text-[#8b1a1a]" />
        </motion.div>
        <span className="ml-2 text-[10px] tracking-[0.3em] text-[#c9a268] font-mono">ATC LIVE</span>
      </div>
      <motion.div
        className="flex whitespace-nowrap text-sm font-mono text-[#c9a268]/70 tracking-wider"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      >
        <span className="px-8">{full}  ◆  {full}</span>
      </motion.div>
    </div>
  );
}

/* ── 3D tilt card wrapper ── */
function TiltCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotX = useSpring(useTransform(y, [-50, 50], [10, -10]), { stiffness: 200, damping: 20 });
  const rotY = useSpring(useTransform(x, [-50, 50], [-10, 10]), { stiffness: 200, damping: 20 });
  return (
    <motion.div
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        x.set(e.clientX - rect.left - rect.width / 2);
        y.set(e.clientY - rect.top - rect.height / 2);
      }}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      style={{ rotateX: rotX, rotateY: rotY, transformStyle: "preserve-3d" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ── Aviation wings emblem ── */
function WingsEmblem({ className = "w-32 h-32", shimmer = false }: { className?: string; shimmer?: boolean }) {
  return (
    <svg viewBox="0 0 200 100" className={className} fill="none">
      <defs>
        <linearGradient id="gold-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#b88b3a" />
          <stop offset="50%" stopColor="#e6c77a" />
          <stop offset="100%" stopColor="#b88b3a" />
        </linearGradient>
        {shimmer && (
          <linearGradient id="shimmer-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#fff" stopOpacity="0">
              <animate attributeName="offset" values="-0.3;1.3" dur="4s" repeatCount="indefinite" />
            </stop>
            <stop offset="50%" stopColor="#fff" stopOpacity="0.35">
              <animate attributeName="offset" values="-0.15;1.45" dur="4s" repeatCount="indefinite" />
            </stop>
            <stop offset="100%" stopColor="#fff" stopOpacity="0">
              <animate attributeName="offset" values="0;1.6" dur="4s" repeatCount="indefinite" />
            </stop>
          </linearGradient>
        )}
      </defs>
      {/* Left wing */}
      <g stroke="url(#gold-grad)" strokeWidth="1.2" fill="url(#gold-grad)" opacity="0.95">
        <path d="M98 50 Q70 46 50 42 Q30 40 10 42 Q30 46 50 50 Q70 52 98 52 Z" />
        <path d="M98 52 Q75 56 55 58 Q35 60 18 58 Q38 54 58 54 Q78 54 98 54 Z" opacity="0.75" />
        <path d="M98 54 Q80 62 60 64 Q40 66 25 64 Q45 60 65 58 Q85 56 98 56 Z" opacity="0.55" />
      </g>
      {/* Right wing */}
      <g stroke="url(#gold-grad)" strokeWidth="1.2" fill="url(#gold-grad)" opacity="0.95">
        <path d="M102 50 Q130 46 150 42 Q170 40 190 42 Q170 46 150 50 Q130 52 102 52 Z" />
        <path d="M102 52 Q125 56 145 58 Q165 60 182 58 Q162 54 142 54 Q122 54 102 54 Z" opacity="0.75" />
        <path d="M102 54 Q120 62 140 64 Q160 66 175 64 Q155 60 135 58 Q115 56 102 56 Z" opacity="0.55" />
      </g>
      {/* Center crest */}
      <circle cx="100" cy="50" r="14" fill="#0f2744" stroke="url(#gold-grad)" strokeWidth="1.5" />
      <circle cx="100" cy="50" r="9" fill="none" stroke="url(#gold-grad)" strokeWidth="0.8" opacity="0.6" />
      <path d="M100 42 L100 58 M92 50 L108 50" stroke="url(#gold-grad)" strokeWidth="1" />
      <circle cx="100" cy="50" r="2" fill="url(#gold-grad)" />
      {shimmer && (
        <rect x="0" y="45" width="200" height="12" fill="url(#shimmer-grad)" style={{ mixBlendMode: "screen" }} opacity="0.5" />
      )}
    </svg>
  );
}

/* ── Crossed ceremonial swords ── */
function CrossedSwords({ className = "w-14 h-14" }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 60" className={className} fill="none">
      <g stroke="#c9a268" strokeWidth="1.2" strokeLinecap="round">
        <line x1="10" y1="10" x2="50" y2="50" />
        <line x1="50" y1="10" x2="10" y2="50" />
        {/* Hilts */}
        <circle cx="10" cy="10" r="2.5" fill="#c9a268" />
        <circle cx="50" cy="10" r="2.5" fill="#c9a268" />
        {/* Guards */}
        <line x1="6" y1="14" x2="14" y2="6" strokeWidth="1.5" />
        <line x1="46" y1="6" x2="54" y2="14" strokeWidth="1.5" />
      </g>
    </svg>
  );
}

/* ── Gold braided divider (epaulet style) ── */
function BraidDivider() {
  return (
    <motion.div
      className="flex items-center justify-center gap-3 my-6"
      initial={{ scaleX: 0 }}
      animate={{ scaleX: 1 }}
      transition={{ duration: 1, delay: 0.8 }}
    >
      <motion.div
        className="h-px bg-gradient-to-r from-transparent via-[#c9a268] to-[#c9a268]"
        style={{ width: 90 }}
        animate={{ opacity: [0.4, 0.9, 0.4] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
      <motion.div
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ duration: 5, repeat: Infinity }}
      >
        <CrossedSwords className="w-7 h-7" />
      </motion.div>
      <motion.div
        className="h-px bg-gradient-to-l from-transparent via-[#c9a268] to-[#c9a268]"
        style={{ width: 90 }}
        animate={{ opacity: [0.4, 0.9, 0.4] }}
        transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
      />
    </motion.div>
  );
}

/* ── Gold stars (medal ribbon dots) ── */
function MedalStars({ count = 20 }: { count?: number }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: count }).map((_, i) => {
        const size = 3 + (i % 3);
        const left = (i * 37 + 11) % 100;
        const top = (i * 53 + 19) % 100;
        const delay = (i * 0.4) % 6;
        return (
          <motion.div
            key={i}
            className="absolute"
            style={{
              width: size,
              height: size,
              left: `${left}%`,
              top: `${top}%`,
              background: "radial-gradient(circle, #e6c77a 0%, #c9a268 50%, transparent 100%)",
              borderRadius: "50%",
              boxShadow: "0 0 8px rgba(201,162,104,.6)",
            }}
            animate={{
              opacity: [0, 1, 1, 0],
              scale: [0, 1, 1, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay,
              ease: "easeInOut",
            }}
          />
        );
      })}
    </div>
  );
}

/* ── Epaulet corner decoration ── */
function EpauletCorner({ position }: { position: string }) {
  const positions: Record<string, string> = {
    "top-left": "top-6 left-6",
    "top-right": "top-6 right-6 scale-x-[-1]",
    "bottom-left": "bottom-6 left-6 scale-y-[-1]",
    "bottom-right": "bottom-6 right-6 scale-x-[-1] scale-y-[-1]",
  };
  return (
    <motion.div
      className={`absolute w-20 h-20 ${positions[position]}`}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.2, delay: 0.5 }}
    >
      <svg viewBox="0 0 80 80" className="w-full h-full">
        <path d="M0 0 L60 0 L60 4 L4 4 L4 60 L0 60 Z" fill="#c9a268" opacity="0.7" />
        <path d="M8 8 L52 8 L52 10 L10 10 L10 52 L8 52 Z" fill="#c9a268" opacity="0.4" />
        <circle cx="14" cy="14" r="2.5" fill="#c9a268" />
        <circle cx="14" cy="14" r="4" fill="none" stroke="#c9a268" strokeWidth="0.5" opacity="0.5" />
      </svg>
    </motion.div>
  );
}

export default function WingsOfHonour() {
  const [rsvpSent, setRsvpSent] = useState(false);
  const [dossierOpen, setDossierOpen] = useState(false);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <div className="bg-[#0f2744] text-white font-serif overflow-hidden">
      <AnimatePresence>
        {!dossierOpen && <MissionDossier onOpen={() => setDossierOpen(true)} />}
      </AnimatePresence>

      {/* ═══ HERO ═══ */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 overflow-hidden bg-gradient-to-br from-[#0f2744] via-[#1e3a5f] to-[#0f2744]"
      >
        {/* Animated background shimmer */}
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              "radial-gradient(ellipse at 20% 30%, rgba(201,162,104,0.12) 0%, transparent 50%)",
              "radial-gradient(ellipse at 80% 70%, rgba(201,162,104,0.18) 0%, transparent 50%)",
              "radial-gradient(ellipse at 20% 30%, rgba(201,162,104,0.12) 0%, transparent 50%)",
            ],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />

        <MedalStars count={25} />
        <FlyingAircraft />
        <MorseCode />

        {/* Epaulet corners */}
        {["top-left", "top-right", "bottom-left", "bottom-right"].map((pos) => (
          <EpauletCorner key={pos} position={pos} />
        ))}

        {/* Gold border frame */}
        <motion.div
          className="absolute inset-8 sm:inset-14 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
        >
          <svg className="w-full h-full" preserveAspectRatio="none">
            <motion.rect
              x="0"
              y="0"
              width="100%"
              height="100%"
              fill="none"
              stroke="#c9a268"
              strokeWidth="1"
              opacity="0.35"
              strokeDasharray="10 5"
              animate={{ strokeDashoffset: [0, -30] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
          </svg>
        </motion.div>

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 max-w-4xl">
          {/* Wings emblem */}
          <motion.div
            className="flex justify-center mb-6"
            initial={{ opacity: 0, y: -30, scale: 0.7 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.2 }}
          >
            <motion.div
              animate={{ filter: ["drop-shadow(0 0 12px rgba(230,199,122,0.3))", "drop-shadow(0 0 24px rgba(230,199,122,0.6))", "drop-shadow(0 0 12px rgba(230,199,122,0.3))"] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <WingsEmblem className="w-48 sm:w-64 h-auto" />
            </motion.div>
          </motion.div>

          <motion.p
            className="text-[#c9a268] tracking-[0.5em] uppercase text-xs sm:text-sm mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, delay: 0.5 }}
          >
            With the blessings of our families
          </motion.p>
          <motion.p
            className="text-[#e6c77a]/70 tracking-[0.3em] uppercase text-[10px] sm:text-xs mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, delay: 0.7 }}
          >
            we invite you to celebrate the marriage of
          </motion.p>

          <motion.h1
            className="text-5xl sm:text-7xl lg:text-8xl font-light text-white leading-none tracking-wide"
            initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1, delay: 0.9 }}
          >
            Sashini
          </motion.h1>

          <BraidDivider />

          <motion.h1
            className="text-5xl sm:text-7xl lg:text-8xl font-light text-white leading-none tracking-wide"
            initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1, delay: 1.2 }}
          >
            Wing Cmdr. Ravindu
          </motion.h1>

          <motion.div
            className="mt-12 relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.6 }}
          >
            <div className="bg-white/5 backdrop-blur-sm rounded-xl px-10 py-5 border border-[#c9a268]/30 inline-block">
              <p className="text-[#c9a268] tracking-[0.3em] uppercase text-xs mb-1">Saturday</p>
              <p className="text-3xl sm:text-4xl font-light text-white">November 14, 2026</p>
              <p className="text-[#c9a268] tracking-[0.2em] uppercase text-xs mt-1">
                at three o&apos;clock in the afternoon
              </p>
            </div>
            <div className="absolute -inset-4 bg-[#c9a268]/10 rounded-2xl blur-xl -z-10" />
          </motion.div>
        </motion.div>

        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 z-10"
        >
          <ChevronDown className="w-6 h-6 text-[#c9a268]" />
        </motion.div>
      </section>

      {/* ═══ COUNTDOWN ═══ */}
      <section className="relative py-24 bg-[#08152b] text-center overflow-hidden border-y border-[#c9a268]/30">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative z-10"
        >
          <div className="flex justify-center mb-6">
            <Plane className="w-6 h-6 text-[#c9a268]" />
          </div>
          <p className="text-[#c9a268] tracking-[0.4em] uppercase text-xs mb-10">
            T&minus;Minus To Take-Off
          </p>
          <Countdown
            targetDate="2026-11-14T15:00:00"
            valueClassName="text-5xl sm:text-6xl font-light text-white"
            labelClassName="text-[10px] text-[#c9a268] tracking-[0.3em] uppercase mt-3"
            boxClassName="flex flex-col items-center min-w-[80px] sm:min-w-[100px]"
            separatorClassName="text-4xl font-light text-[#c9a268]/30 mx-2 self-start"
          />
        </motion.div>
      </section>

      {/* ═══ FLIGHT PATH MAP ═══ */}
      <section className="relative py-28 px-4 bg-gradient-to-b from-[#0f2744] via-[#08152b] to-[#0f2744] overflow-hidden">
        <MedalStars count={15} />

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-12 relative z-10"
        >
          <div className="inline-flex items-center gap-2 border border-[#c9a268]/40 px-4 py-1 rounded-full mb-5">
            <FileText className="w-3 h-3 text-[#c9a268]" />
            <p className="text-[#c9a268] tracking-[0.3em] uppercase text-[10px] font-mono">CLASSIFIED · MISSION TRACK</p>
          </div>
          <h2 className="text-4xl sm:text-5xl font-light text-white tracking-wide">Flight Path of a Love Story</h2>
          <p className="text-white/50 text-sm mt-3 max-w-lg mx-auto">
            Four waypoints. Eight years. One final destination.
          </p>
        </motion.div>

        <OrbitalPortrait />
      </section>

      {/* ═══ EVENTS ═══ */}
      <section className="relative py-28 px-4 bg-gradient-to-br from-[#0f2744] via-[#1e3a5f] to-[#0f2744] overflow-hidden">
        <MedalStars count={12} />
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-[#c9a268] tracking-[0.4em] uppercase text-xs mb-4">Order of Ceremony</p>
            <h2 className="text-4xl sm:text-5xl font-light text-white">Wedding Programme</h2>
            <div className="w-16 h-px bg-[#c9a268] mx-auto mt-6" />
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Award,
                title: "Poruwa Ceremony",
                time: "3:00 PM - 4:30 PM",
                venue: "Grand Ballroom",
                desc: "Traditional Kandyan ceremony with the blessings of both families and the chief guest.",
              },
              {
                icon: Plane,
                title: "Guard of Honour",
                time: "4:30 PM - 5:00 PM",
                venue: "Ceremonial Courtyard",
                desc: "A formal salute by the groom's squadron as the bride and groom pass beneath crossed swords.",
              },
              {
                icon: Heart,
                title: "Wedding Reception",
                time: "7:00 PM - 11:30 PM",
                venue: "Royal Banquet Hall",
                desc: "An evening of dinner, dancing and celebration with friends, family, and comrades-in-arms.",
              },
            ].map((event, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: i * 0.2 }}
                style={{ perspective: 1000 }}
              >
                <TiltCard className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 text-center border border-[#c9a268]/20 hover:border-[#c9a268]/60 transition-colors">
                  <motion.div
                    className="w-16 h-16 bg-gradient-to-br from-[#c9a268] to-[#b88b3a] rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg"
                    whileHover={{ rotate: 12 }}
                    style={{ transform: "translateZ(30px)" }}
                  >
                    <event.icon className="w-7 h-7 text-[#0f2744]" />
                  </motion.div>
                  <h3 className="text-lg font-semibold text-white mb-2" style={{ transform: "translateZ(20px)" }}>{event.title}</h3>
                  <p className="text-[#c9a268] text-sm font-medium mb-1">{event.time}</p>
                  <p className="text-white/60 text-sm mb-3">{event.venue}</p>
                  <div className="w-8 h-px bg-[#c9a268]/40 mx-auto mb-3" />
                  <p className="text-sm text-white/50">{event.desc}</p>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ GALLERY ═══ */}
      <section className="py-28 px-4 bg-[#0f2744]">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-[#c9a268] tracking-[0.4em] uppercase text-xs mb-4">Gallery</p>
            <h2 className="text-4xl sm:text-5xl font-light text-white">Moments Together</h2>
            <div className="w-16 h-px bg-[#c9a268] mx-auto mt-6" />
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { h: "h-64 md:h-72", span: "md:col-span-2", gradient: "from-[#0f2744]/40 via-[#c9a268]/20 to-[#0f2744]/30" },
              { h: "h-64 md:h-72", span: "", gradient: "from-[#c9a268]/30 to-[#0f2744]/20" },
              { h: "h-56", span: "", gradient: "from-[#1e3a5f]/30 to-[#c9a268]/30" },
              { h: "h-56", span: "", gradient: "from-[#c9a268]/25 to-[#1e3a5f]/25" },
              { h: "h-56", span: "", gradient: "from-[#0f2744]/30 to-[#c9a268]/20" },
              { h: "h-64 md:h-72", span: "col-span-2 md:col-span-3", gradient: "from-[#c9a268]/20 via-[#0f2744]/20 to-[#c9a268]/25" },
            ].map((img, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.85 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.08 }}
                whileHover={{ scale: 1.03 }}
                className={`${img.h} ${img.span} bg-gradient-to-br ${img.gradient} rounded-2xl overflow-hidden flex items-center justify-center cursor-pointer group relative border border-[#c9a268]/20`}
              >
                <Camera className="w-8 h-8 text-[#0f2744]/25 group-hover:scale-110 transition-transform" />
                <div className="absolute inset-0 bg-[#0f2744]/0 group-hover:bg-[#0f2744]/15 transition-colors rounded-2xl" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ VENUE ═══ */}
      <section className="py-28 bg-[#08152b] border-t border-[#c9a268]/30 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-[#c9a268] tracking-[0.4em] uppercase text-xs mb-4">Location</p>
            <h2 className="text-4xl sm:text-5xl font-light text-white mb-6">Ceremony Venue</h2>
            <div className="flex items-center justify-center gap-2 mb-2">
              <MapPin className="w-5 h-5 text-[#c9a268]" />
              <h3 className="text-xl font-semibold text-white">SLAF Officers&apos; Mess, Ratmalana</h3>
            </div>
            <p className="text-white/60 mb-10">Air Force Base Ratmalana, Colombo, Sri Lanka</p>
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="bg-gradient-to-br from-white/5 to-[#c9a268]/10 rounded-2xl h-72 sm:h-80 flex items-center justify-center border border-[#c9a268]/30 shadow-inner"
            >
              <div className="text-center">
                <MapPin className="w-12 h-12 text-[#c9a268]/60 mx-auto mb-3" />
                <p className="text-white/50 text-sm">Interactive Map</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══ RSVP ═══ */}
      <section className="relative py-28 bg-gradient-to-br from-[#0f2744] via-[#1e3a5f] to-[#0f2744] text-white px-4 overflow-hidden">
        <MedalStars count={10} />
        <div className="max-w-lg mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex justify-center mb-4">
              <CrossedSwords className="w-10 h-10" />
            </div>
            <p className="text-[#c9a268] tracking-[0.4em] uppercase text-xs mb-4">RSVP</p>
            <h2 className="text-4xl sm:text-5xl font-light mb-4">Will You Stand With Us?</h2>
            <p className="text-white/50 mb-12 text-sm">Kindly respond by October 15, 2026</p>

            {rsvpSent ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white/5 backdrop-blur-sm rounded-2xl p-10 border border-[#c9a268]/30 relative overflow-hidden"
              >
                <Confetti />
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
                  <Heart className="w-14 h-14 text-[#c9a268] fill-[#c9a268] mx-auto mb-4" />
                </motion.div>
                <p className="text-2xl font-light">Thank you!</p>
                <p className="text-white/60 mt-2">It will be an honour to have you with us.</p>
              </motion.div>
            ) : (
              <motion.form
                onSubmit={(e) => {
                  e.preventDefault();
                  setRsvpSent(true);
                }}
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
                    whileFocus={{ borderColor: "#c9a268", boxShadow: "0 0 20px rgba(201,162,104,0.2)" }}
                    className="w-full px-5 py-4 bg-white/5 border border-[#c9a268]/30 rounded-xl text-white placeholder:text-white/40 focus:outline-none transition-all backdrop-blur-sm"
                  />
                ))}
                <select className="w-full px-5 py-4 bg-white/5 border border-[#c9a268]/30 rounded-xl text-white/80 focus:outline-none focus:border-[#c9a268] backdrop-blur-sm">
                  <option value="" className="text-gray-900">Will you attend?</option>
                  <option value="yes" className="text-gray-900">Honoured to accept</option>
                  <option value="no" className="text-gray-900">Regretfully decline</option>
                </select>
                <select className="w-full px-5 py-4 bg-white/5 border border-[#c9a268]/30 rounded-xl text-white/80 focus:outline-none focus:border-[#c9a268] backdrop-blur-sm">
                  <option value="" className="text-gray-900">Number of Guests</option>
                  {[1, 2, 3, 4].map((n) => (
                    <option key={n} value={n} className="text-gray-900">
                      {n} {n === 1 ? "Guest" : "Guests"}
                    </option>
                  ))}
                </select>
                <textarea
                  placeholder="Dietary requirements or a message for the couple..."
                  rows={3}
                  className="w-full px-5 py-4 bg-white/5 border border-[#c9a268]/30 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-[#c9a268] resize-none backdrop-blur-sm"
                />
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(201,162,104,0.4)" }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-[#c9a268] to-[#e6c77a] text-[#0f2744] py-4 rounded-xl font-semibold tracking-wider uppercase text-sm shadow-lg"
                >
                  Send RSVP
                </motion.button>
              </motion.form>
            )}
          </motion.div>
        </div>
      </section>

      {/* ═══ ATC RADIO CHATTER ═══ */}
      <ATCTicker />

      {/* ═══ FOOTER ═══ */}
      <footer className="py-14 text-center px-4 bg-[#0a1a35] border-t border-[#c9a268]/30">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div className="flex justify-center mb-4">
            <WingsEmblem className="w-24 h-auto opacity-90" />
          </div>
          <p className="text-white text-xl font-light mb-2">Sashini &amp; Wing Cmdr. Ravindu</p>
          <p className="text-white/60 text-sm mb-8">November 14, 2026 &middot; Ratmalana, Sri Lanka</p>
          <div className="flex items-center justify-center gap-4 mb-8">
            {[Phone, Mail].map((Icon, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.15, borderColor: "#c9a268" }}
                className="w-11 h-11 rounded-full border border-[#c9a268]/40 flex items-center justify-center cursor-pointer transition-colors"
              >
                <Icon className="w-4 h-4 text-[#c9a268]" />
              </motion.div>
            ))}
          </div>
          <p className="text-xs text-white/40">
            Created with <Heart className="w-3 h-3 inline text-[#c9a268] fill-[#c9a268]" /> by{" "}
            <Link href="/" className="text-[#c9a268] hover:underline">
              INVITATION.LK
            </Link>
          </p>
        </motion.div>
      </footer>
    </div>
  );
}
