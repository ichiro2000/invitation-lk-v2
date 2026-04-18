"use client";

import { motion, useScroll, useTransform, AnimatePresence, useMotionValue } from "framer-motion";
import type { MotionValue } from "framer-motion";
import Link from "next/link";
import { Heart, MapPin, Mail, Phone, Camera, ChevronDown, Sparkles, Star } from "lucide-react";
import Countdown from "./shared/Countdown";
import SecondaryVenue from "./shared/SecondaryVenue";
import { useState, useRef, useEffect } from "react";
import type { InvitationData } from "@/types/invitation";
import { deepMerge } from "@/lib/deep-merge";
import { withOpacity, lighten } from "@/lib/with-opacity";
import type { TemplateConfig, ThemeConfig } from "@/types/template-config";
import { DEFAULT_SECTIONS } from "@/types/template-config";

export const DEFAULT_CONFIG: TemplateConfig = {
  theme: {
    primaryColor: "#ec4899",     // pink-500
    secondaryColor: "#831843",   // pink-900
    backgroundColor: "#fff0f5",  // lavender-blush
    textColor: "#4a1130",
    accentColor: "#f9a8d4",      // pink-300
    fontFamily: "serif",
  },
  sections: [...DEFAULT_SECTIONS],
  content: {
    hero: {
      subtitle: "TWO HEARTS · ONE WALTZ",
      message: "You are warmly invited to witness our vows",
    },
    story: {
      title: "Chapters of Our Love",
      subtitle: "Every step led us here.",
      items: [
        { year: "2020", title: "First Glance", description: "A crowded room. A shared laugh. The beginning of everything." },
        { year: "2022", title: "First Trip", description: "The coast, salt in the air, and the quiet realisation that this was it." },
        { year: "2024", title: "The Yes", description: "Under a canopy of fairy lights, on bended knee, with trembling hands." },
        { year: "2026", title: "Forever", description: "Today we waltz into the rest of our lives. Thank you for dancing with us." },
      ],
    },
    rsvp: { title: "Will You Dance With Us?", deadline: "Kindly respond by May 15, 2026" },
  },
};

/* ── Falling petals — pure CSS keyframes, GPU-only (compositor-friendly) ── */
function FallingPetals({ count = 22, color = "#ec4899" }: { count?: number; color?: string }) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const update = () => setIsMobile(window.innerWidth < 640);
    update();
    window.addEventListener("resize", update, { passive: true });
    return () => window.removeEventListener("resize", update);
  }, []);
  const effective = isMobile ? Math.min(count, 8) : count;
  const petalSvg = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'><path d='M10 1 C 13 5, 17 7, 16 12 C 15 16, 11 18, 10 19 C 9 18, 5 16, 4 12 C 3 7, 7 5, 10 1 Z' fill='${encodeURIComponent(color)}' opacity='0.85'/></svg>")`;
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <style>{`
        @keyframes bw-petal-fall {
          0%   { transform: translate3d(0, -8vh, 0) rotate(0deg); opacity: 0; }
          10%  { opacity: 0.85; }
          100% { transform: translate3d(var(--bw-drift, 0px), 108vh, 0) rotate(540deg); opacity: 0; }
        }
        .bw-petal {
          position: absolute;
          top: 0;
          background-image: ${petalSvg};
          background-size: contain;
          background-repeat: no-repeat;
          will-change: transform, opacity;
          animation-name: bw-petal-fall;
          animation-iteration-count: infinite;
          animation-timing-function: linear;
        }
        @media (prefers-reduced-motion: reduce) {
          .bw-petal { animation: none; opacity: 0; }
        }
      `}</style>
      {Array.from({ length: effective }).map((_, i) => {
        const size = 10 + (i % 5) * 3;
        const left = (i * 41 + 13) % 100;
        const delay = (i * 0.8) % 10;
        const dur = 10 + (i % 6) * 2;
        const drift = ((i % 7) - 3) * 40;
        return (
          <span
            key={i}
            className="bw-petal"
            style={{
              left: `${left}%`,
              width: size,
              height: size,
              ["--bw-drift" as string]: `${drift}px`,
              animationDuration: `${dur}s`,
              animationDelay: `-${delay}s`,
            }}
          />
        );
      })}
    </div>
  );
}

/* ── Cursor-follow glow — a soft pink halo trails the pointer ── */
function CursorGlow({ color }: { color: string }) {
  const [pos, setPos] = useState({ x: -200, y: -200 });
  useEffect(() => {
    const onMove = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);
  return (
    <motion.div
      className="fixed pointer-events-none z-[5] hidden md:block"
      style={{
        left: pos.x - 200,
        top: pos.y - 200,
        width: 400,
        height: 400,
        background: `radial-gradient(circle, ${withOpacity(color, 0.18)} 0%, ${withOpacity(color, 0.06)} 40%, transparent 70%)`,
        mixBlendMode: "multiply",
      }}
    />
  );
}

/* ── Liquid blob — GPU-only transform/opacity, no runtime blur filter ── */
function LiquidBlob({ color, size = 500, top = "10%", left = "-10%" }: { color: string; size?: number; top?: string; left?: string }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        top, left, width: size, height: size,
        background: `radial-gradient(circle, ${withOpacity(color, 0.22)} 0%, ${withOpacity(color, 0)} 70%)`,
        willChange: "transform",
      }}
      animate={{
        x: [0, 40, -30, 20, 0],
        y: [0, -30, 40, -20, 0],
        scale: [1, 1.08, 0.96, 1.04, 1],
      }}
      transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

/* ── One rose petal — its rotate & scale are driven by the shared bloom value ── */
function RosePetal({
  rot, scl, delay, bloom, color,
}: {
  rot: number; scl: number; delay: number; bloom: MotionValue<number>; color: string;
}) {
  // bloom: 0 = wrapped (closed bud), 1 = fully open
  const rotate = useTransform(bloom, [0, 1], [0, rot]);
  const scale = useTransform(bloom, [0, 1], [0.12, scl]);
  return (
    <motion.path
      d="M 0 -4 C 6 -14, 14 -20, 0 -42 C -14 -20, -6 -14, 0 -4 Z"
      fill="url(#rose-petal-grad)"
      stroke={color}
      strokeOpacity="0.2"
      strokeWidth="0.3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      style={{ rotate, scale, transformOrigin: "center" }}
    />
  );
}

/* ── Signature rose — petals fade-in on mount, wrap/unwrap with `bloom` (0–1) ── */
function SignatureRose({
  color, accent, bloom: externalBloom, compact,
}: {
  color: string; accent: string; bloom?: MotionValue<number>; compact?: boolean;
}) {
  const petals = [
    { rot: 0, scale: 1, delay: 0 },
    { rot: 40, scale: 0.95, delay: 0.10 },
    { rot: 80, scale: 0.9, delay: 0.20 },
    { rot: 120, scale: 0.85, delay: 0.30 },
    { rot: 160, scale: 0.8, delay: 0.40 },
    { rot: 200, scale: 0.85, delay: 0.50 },
    { rot: 240, scale: 0.9, delay: 0.60 },
    { rot: 280, scale: 0.95, delay: 0.70 },
    { rot: 320, scale: 1, delay: 0.80 },
  ];
  // A stable motion value for callers that don't pass one (e.g. the spinning footer logo).
  const staticBloom = useMotionValue(1);
  const bloom = externalBloom ?? staticBloom;
  return (
    <div className="relative w-full h-full" aria-hidden="true">
      <svg viewBox="-50 -50 100 100" className="w-full h-full">
        <defs>
          <radialGradient id="rose-petal-grad" cx="50%" cy="30%">
            <stop offset="0%" stopColor={lighten(color, 0.5)} />
            <stop offset="60%" stopColor={color} />
            <stop offset="100%" stopColor={accent} />
          </radialGradient>
          <radialGradient id="rose-center-grad" cx="50%" cy="50%">
            <stop offset="0%" stopColor={lighten(color, 0.3)} />
            <stop offset="100%" stopColor={color} />
          </radialGradient>
        </defs>
        {petals.map((p, i) => (
          <RosePetal key={i} rot={p.rot} scl={p.scale} delay={p.delay} bloom={bloom} color={color} />
        ))}
        {/* Smaller pistil dot (no large glowing circle) */}
        {!compact && (
          <motion.circle
            cx="0"
            cy="0"
            r="2.2"
            fill={lighten(color, 0.4)}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.9 }}
          />
        )}
      </svg>
    </div>
  );
}

/* ── Church arch — stylised SVG for Church Ceremony card ── */
function ChurchArch({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 80 80" className="w-full h-full" aria-hidden="true">
      <motion.path
        d="M 20 70 L 20 40 Q 40 10 60 40 L 60 70 Z"
        fill="none"
        stroke={color}
        strokeWidth="1.2"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.4, ease: "easeInOut" }}
      />
      <motion.line
        x1="40" y1="26" x2="40" y2="38"
        stroke={color} strokeWidth="1.2"
        initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }}
        viewport={{ once: true }} transition={{ duration: 0.6, delay: 1.2 }}
      />
      <motion.line
        x1="35" y1="31" x2="45" y2="31"
        stroke={color} strokeWidth="1.2"
        initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }}
        viewport={{ once: true }} transition={{ duration: 0.6, delay: 1.4 }}
      />
      <motion.circle
        cx="40" cy="48" r="2"
        fill={color}
        initial={{ scale: 0 }} whileInView={{ scale: 1 }}
        viewport={{ once: true }} transition={{ duration: 0.4, delay: 1.6 }}
      />
    </svg>
  );
}

/* ── Poruwa canopy — stylised Kandyan motif for Poruwa Ceremony card ── */
function PoruwaCanopy({ color, accent }: { color: string; accent: string }) {
  return (
    <svg viewBox="0 0 80 80" className="w-full h-full" aria-hidden="true">
      {/* Canopy roof */}
      <motion.path
        d="M 10 35 L 40 15 L 70 35 Z"
        fill={withOpacity(color, 0.15)}
        stroke={color}
        strokeWidth="1"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2 }}
      />
      {/* Pillars */}
      <motion.rect
        x="16" y="35" width="2" height="30" fill={color}
        initial={{ scaleY: 0 }} whileInView={{ scaleY: 1 }} viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.8 }} style={{ transformOrigin: "16px 65px" }}
      />
      <motion.rect
        x="62" y="35" width="2" height="30" fill={color}
        initial={{ scaleY: 0 }} whileInView={{ scaleY: 1 }} viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.8 }} style={{ transformOrigin: "62px 65px" }}
      />
      {/* Base platform */}
      <motion.rect
        x="14" y="64" width="52" height="4" fill={color} rx="1"
        initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 1.1 }} style={{ transformOrigin: "center" }}
      />
      {/* Decorative swags */}
      <motion.path
        d="M 18 35 Q 28 42 40 38 Q 52 42 62 35"
        fill="none" stroke={accent} strokeWidth="0.8"
        initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }}
        transition={{ duration: 1, delay: 1.3 }}
      />
      {/* Lotus on top */}
      <motion.g
        initial={{ scale: 0, y: 5 }} whileInView={{ scale: 1, y: 0 }} viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
        style={{ transformOrigin: "40px 15px" }}
      >
        <path d="M 40 8 L 38 14 L 42 14 Z" fill={accent} />
        <path d="M 36 14 L 44 14 L 40 10 Z" fill={color} opacity="0.8" />
        <circle cx="40" cy="14" r="1.2" fill={lighten(color, 0.4)} />
      </motion.g>
    </svg>
  );
}

/* ── Curtain reveal overlay — velvet panels part on tap ── */
function CurtainReveal({
  groom,
  bride,
  color,
  secondary,
  accent,
  onDone,
}: {
  groom: string;
  bride: string;
  color: string;
  secondary: string;
  accent: string;
  onDone: () => void;
}) {
  const [opening, setOpening] = useState(false);
  const handleOpen = () => {
    if (opening) return;
    setOpening(true);
    // Unmount right as the slide finishes — no extra hang.
    setTimeout(onDone, 1450);
  };

  return (
    <motion.div
      className="fixed inset-0 z-[100] pointer-events-auto"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      aria-label="Tap to open the invitation"
      role="dialog"
    >
      {/* Stage backdrop — deep velvet behind the curtains, fades out as they part */}
      <motion.div
        className="absolute inset-0"
        style={{ background: `radial-gradient(ellipse at center, ${lighten(color, 0.2)}, ${secondary})` }}
        animate={{ opacity: opening ? 0 : 1 }}
        transition={{ duration: 0.9, delay: opening ? 0.5 : 0, ease: "easeOut" }}
      />

      {/* Curtain rod */}
      <div
        className="absolute top-0 left-0 right-0 h-3 z-10"
        style={{ background: `linear-gradient(to bottom, ${accent}, ${lighten(accent, 0.3)}, ${accent})`, boxShadow: "0 3px 10px rgba(0,0,0,0.2)" }}
      />

      {/* LEFT curtain */}
      <motion.div
        initial={{ x: 0 }}
        animate={{ x: opening ? "-110%" : 0 }}
        transition={{ duration: 1.5, ease: [0.7, 0, 0.3, 1] }}
        className="absolute top-0 left-0 h-full w-1/2 origin-left overflow-hidden"
        style={{
          background: `
            repeating-linear-gradient(90deg,
              ${color} 0px,
              ${lighten(color, 0.15)} 18px,
              ${color} 36px,
              ${secondary} 56px,
              ${color} 72px
            )
          `,
          boxShadow: "inset -20px 0 40px rgba(0,0,0,0.35), 0 10px 30px rgba(0,0,0,0.4)",
        }}
      >
        {/* Decorative folds — subtle vertical shadows */}
        <div
          className="absolute inset-0 opacity-60"
          style={{
            background: "repeating-linear-gradient(90deg, transparent 0px, transparent 50px, rgba(0,0,0,0.12) 54px, transparent 62px)",
          }}
        />
        {/* Gold tassel tie */}
        <div
          className="absolute top-1/2 -right-2 w-4 h-24 rounded-full -translate-y-1/2"
          style={{ background: `linear-gradient(to bottom, ${accent}, ${lighten(accent, 0.3)}, ${accent})` }}
        />
      </motion.div>

      {/* RIGHT curtain */}
      <motion.div
        initial={{ x: 0 }}
        animate={{ x: opening ? "110%" : 0 }}
        transition={{ duration: 1.5, ease: [0.7, 0, 0.3, 1] }}
        className="absolute top-0 right-0 h-full w-1/2 origin-right overflow-hidden"
        style={{
          background: `
            repeating-linear-gradient(90deg,
              ${color} 0px,
              ${secondary} 16px,
              ${color} 36px,
              ${lighten(color, 0.15)} 54px,
              ${color} 72px
            )
          `,
          boxShadow: "inset 20px 0 40px rgba(0,0,0,0.35), 0 10px 30px rgba(0,0,0,0.4)",
        }}
      >
        <div
          className="absolute inset-0 opacity-60"
          style={{
            background: "repeating-linear-gradient(90deg, transparent 0px, transparent 50px, rgba(0,0,0,0.12) 54px, transparent 62px)",
          }}
        />
        <div
          className="absolute top-1/2 -left-2 w-4 h-24 rounded-full -translate-y-1/2"
          style={{ background: `linear-gradient(to bottom, ${accent}, ${lighten(accent, 0.3)}, ${accent})` }}
        />
      </motion.div>

      {/* Centre invite card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: opening ? 0 : 1, y: 0, scale: opening ? 0.9 : 1 }}
        transition={{ duration: opening ? 0.5 : 0.9, delay: opening ? 0 : 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0 z-20 flex items-center justify-center p-6 pointer-events-none"
      >
        <div className="text-center pointer-events-auto max-w-sm">
          <motion.div
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="flex justify-center mb-5"
          >
            <Heart className="w-10 h-10 fill-current" style={{ color: accent }} />
          </motion.div>

          <p className="tracking-[0.5em] uppercase text-[10px] mb-3" style={{ color: accent }}>
            You&apos;re Invited
          </p>

          <h2
            className="text-3xl sm:text-4xl font-light leading-tight mb-2"
            style={{ color: "#ffffff", fontFamily: "Georgia, serif", textShadow: "0 2px 12px rgba(0,0,0,0.3)" }}
          >
            {groom} <span style={{ color: accent, fontStyle: "italic" }}>&amp;</span> {bride}
          </h2>

          <p className="text-sm italic mb-8" style={{ color: withOpacity("#ffffff", 0.85) }}>
            Request the honour of your presence
          </p>

          <motion.button
            type="button"
            onClick={handleOpen}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-medium tracking-wider uppercase text-xs sm:text-sm shadow-2xl"
            style={{
              background: `linear-gradient(135deg, #ffffff, ${lighten(accent, 0.4)})`,
              color: secondary,
              boxShadow: `0 10px 30px ${withOpacity(secondary, 0.5)}, 0 0 0 1px ${withOpacity("#ffffff", 0.6)}`,
            }}
            aria-label="Open invitation"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Open Invitation
          </motion.button>

          {/* Small hint */}
          <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-[10px] tracking-[0.3em] uppercase mt-6"
            style={{ color: withOpacity("#ffffff", 0.6) }}
          >
            Tap to begin
          </motion.p>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── Main template ── */
export default function BlossomWaltz({ data, config }: { data?: InvitationData; config?: TemplateConfig } = {}) {
  const merged = deepMerge(DEFAULT_CONFIG as Record<string, unknown>, (config || {}) as Record<string, unknown>) as TemplateConfig;
  const theme = merged.theme as ThemeConfig;
  const content = merged.content || {};
  const sectionConfigs = merged.sections || DEFAULT_SECTIONS;
  const isVisible = (id: string) => {
    const s = sectionConfigs.find(x => x.id === id);
    return !s || s.visible !== false;
  };

  const groom = data?.groomName || "Amaya";
  const bride = data?.brideName || "Nirash";
  const rawDate = data?.weddingDate || "2026-06-20";
  const timeStr = data?.weddingTime || "16:00";
  const venue = data?.venue || "St. Andrew's Church, Colombo";
  const venueAddr = data?.venueAddress || "Off Galle Road, Colombo, Sri Lanka";
  const events = data?.events && data.events.length > 0 ? data.events : [
    { title: "Church Ceremony", time: "10:00 AM", venue: "St. Andrew's Church", description: "Join us as we exchange vows and celebrate the sacrament of marriage." },
    { title: "Poruwa Ceremony", time: "4:00 PM", venue: "Cinnamon Grand, Grand Ballroom", description: "A traditional Kandyan Poruwa, the ceremonial rite of our heritage, followed by dinner and dancing." },
  ];

  // Normalise time
  const normalizedTime = (() => {
    const t = (timeStr || "").trim();
    const ampm = t.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/i);
    if (ampm) {
      let h = parseInt(ampm[1], 10);
      const m = ampm[2] || "00";
      const period = ampm[3].toUpperCase();
      if (period === "PM" && h !== 12) h += 12;
      if (period === "AM" && h === 12) h = 0;
      return `${h.toString().padStart(2, "0")}:${m}`;
    }
    const h24 = t.match(/^(\d{1,2}):(\d{2})/);
    if (h24) return `${h24[1].padStart(2, "0")}:${h24[2]}`;
    return "16:00";
  })();
  const countdownTarget = `${rawDate}T${normalizedTime}:00`;

  const dateObj = new Date(rawDate + "T00:00:00");
  const formattedDate = dateObj.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const formattedTime = new Date(`2000-01-01T${normalizedTime}:00`).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });

  const heroSubtitle = content.hero?.subtitle || "TWO HEARTS · ONE WALTZ";
  const heroMessage = content.hero?.message || "You are warmly invited to witness our vows";
  const storyTitle = content.story?.title || "Chapters of Our Love";
  const storySubtitle = content.story?.subtitle || "Every step led us here.";
  const storyItems = content.story?.items || DEFAULT_CONFIG.content?.story?.items || [];
  const rsvpTitle = content.rsvp?.title || "Will You Dance With Us?";
  const rsvpDeadline = content.rsvp?.deadline || "";
  const galleryImages = content.gallery?.images || [];
  const mapUrl = content.venue?.mapUrl || "";
  const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(mapUrl && mapUrl.includes("google") ? mapUrl : [venue, venueAddr].filter(Boolean).join(", "))}&output=embed`;
  const groomPhone = content.footer?.groomPhone || "";
  const bridePhone = content.footer?.bridePhone || "";
  const footerMessage = content.footer?.message || "";

  const [rsvpSent, setRsvpSent] = useState(false);
  const [curtainDone, setCurtainDone] = useState(false);

  // Lock scroll while the curtain is up so the page doesn't peek behind it
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (!curtainDone) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = prev; };
    }
  }, [curtainDone]);

  // Scroll-linked bloom: 1 = fully open at top, 0 = wrapped as you scroll past the hero.
  // Scrolling back up reverses the wrap — petals re-open.
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const bloom = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const heroParallax = useTransform(scrollYProgress, [0, 1], [0, 120]);

  const fontClass = theme.fontFamily === "cursive" ? "font-serif italic" : theme.fontFamily === "sans-serif" ? "font-sans" : "font-serif";

  return (
    <div className={`${fontClass} overflow-hidden relative`} style={{ backgroundColor: theme.backgroundColor, color: theme.textColor }}>
      <AnimatePresence>
        {!curtainDone && (
          <CurtainReveal
            key="curtain"
            groom={groom}
            bride={bride}
            color={theme.primaryColor}
            secondary={theme.secondaryColor}
            accent={theme.accentColor}
            onDone={() => setCurtainDone(true)}
          />
        )}
      </AnimatePresence>

      <CursorGlow color={theme.primaryColor} />

      {/* ═══ HERO ═══ */}
      {isVisible("hero") && (
      <section
        ref={heroRef}
        className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 overflow-hidden"
        style={{ background: `radial-gradient(circle at 30% 20%, ${withOpacity(theme.accentColor, 0.5)}, ${theme.backgroundColor} 60%)` }}
      >
        <LiquidBlob color={theme.primaryColor} size={600} top="-10%" left="-15%" />
        <LiquidBlob color={theme.accentColor} size={500} top="50%" left="70%" />
        <FallingPetals count={22} color={theme.primaryColor} />

        {/* Signature rose — sits behind the names as a centrepiece. Blooms on
             curtain-open, wraps/unwraps with scroll. */}
        <div
          aria-hidden="true"
          className="absolute left-1/2 top-1/2 pointer-events-none"
          style={{
            width: "min(120vw, 860px)",
            height: "min(120vw, 860px)",
            transform: "translate(-50%, -50%)",
            opacity: 0.55,
          }}
        >
          {curtainDone && (
            <SignatureRose
              color={theme.primaryColor}
              accent={theme.accentColor}
              bloom={bloom}
            />
          )}
        </div>

        <motion.div
          style={{ y: heroParallax }}
          className="relative z-10 max-w-3xl mx-auto"
        >
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="tracking-[0.5em] text-[11px] sm:text-xs uppercase mb-8"
            style={{ color: theme.secondaryColor }}
          >
            {heroSubtitle}
          </motion.p>

          <div className="flex items-center justify-center gap-3 sm:gap-6 md:gap-8 mb-8">
            <motion.h1
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1.2, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="text-5xl sm:text-7xl md:text-8xl font-light"
              style={{ color: theme.secondaryColor, fontFamily: "Georgia, serif" }}
            >
              {groom}
            </motion.h1>
            <motion.div
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.9, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="text-4xl sm:text-5xl md:text-6xl italic flex-shrink-0"
              style={{ color: theme.primaryColor, fontFamily: "Georgia, serif" }}
            >
              &amp;
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1.2, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="text-5xl sm:text-7xl md:text-8xl font-light"
              style={{ color: theme.secondaryColor, fontFamily: "Georgia, serif" }}
            >
              {bride}
            </motion.h1>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.4 }}
            className="text-sm sm:text-base italic max-w-xl mx-auto mb-10"
            style={{ color: withOpacity(theme.textColor, 0.7) }}
          >
            {heroMessage}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.6 }}
            className="inline-flex items-center gap-4 text-sm sm:text-base tracking-wider px-6 py-3 rounded-full backdrop-blur-sm"
            style={{
              border: `1px solid ${withOpacity(theme.primaryColor, 0.3)}`,
              background: withOpacity("#ffffff", 0.4),
              color: theme.secondaryColor,
            }}
          >
            <span>{formattedDate}</span>
            <span className="w-1 h-1 rounded-full" style={{ backgroundColor: theme.primaryColor }} />
            <span>{formattedTime}</span>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 2 }}
          className="absolute bottom-8 z-10 flex flex-col items-center gap-2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown className="w-5 h-5" style={{ color: theme.primaryColor }} />
          </motion.div>
        </motion.div>
      </section>
      )}

      {/* ═══ COUNTDOWN ═══ */}
      {isVisible("countdown") && (
      <section className="relative py-24 px-4 overflow-hidden" style={{ backgroundColor: lighten(theme.accentColor, 0.3) }}>
        <LiquidBlob color={theme.primaryColor} size={400} top="20%" left="80%" />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9 }}
          className="relative z-10 text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-4 h-4" style={{ color: theme.primaryColor }} />
            <p className="tracking-[0.3em] uppercase text-[11px]" style={{ color: theme.secondaryColor }}>Counting Down to the Waltz</p>
            <Sparkles className="w-4 h-4" style={{ color: theme.primaryColor }} />
          </div>
          <Countdown
            targetDate={countdownTarget}
            className="gap-3 sm:gap-6"
            valueClassName="text-4xl sm:text-6xl font-light"
            labelClassName="text-[10px] tracking-[0.3em] uppercase mt-3 opacity-60"
            boxClassName="flex flex-col items-center min-w-[64px] sm:min-w-[96px] px-3 py-4 rounded-2xl backdrop-blur-sm"
            separatorClassName="text-3xl sm:text-5xl font-light opacity-20 self-start"
          />
        </motion.div>
      </section>
      )}

      {/* ═══ STORY ═══ */}
      {isVisible("story") && (
      <section className="relative py-28 px-4 overflow-hidden">
        <LiquidBlob color={theme.accentColor} size={500} top="30%" left="-10%" />
        <LiquidBlob color={theme.primaryColor} size={400} top="70%" left="90%" />
        <FallingPetals count={10} color={theme.accentColor} />

        <div className="max-w-4xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <p className="tracking-[0.4em] uppercase text-xs mb-4" style={{ color: theme.primaryColor }}>Love Story</p>
            <h2 className="text-4xl sm:text-5xl font-light mb-3" style={{ color: theme.secondaryColor, fontFamily: "Georgia, serif" }}>
              {storyTitle}
            </h2>
            <p className="text-sm italic" style={{ color: withOpacity(theme.textColor, 0.6) }}>{storySubtitle}</p>
            <div className="w-20 h-px mx-auto mt-6" style={{ background: `linear-gradient(to right, transparent, ${theme.primaryColor}, transparent)` }} />
          </motion.div>

          <div className="relative">
            {/* Central vertical line */}
            <div
              className="absolute left-1/2 top-0 bottom-0 w-px hidden sm:block"
              style={{ background: `linear-gradient(to bottom, transparent, ${withOpacity(theme.primaryColor, 0.4)} 10%, ${withOpacity(theme.primaryColor, 0.4)} 90%, transparent)` }}
            />

            {storyItems.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.7, delay: i * 0.08 }}
                className={`relative mb-10 sm:mb-16 flex flex-col sm:flex-row items-center gap-6 ${i % 2 === 0 ? "" : "sm:flex-row-reverse"}`}
              >
                <div className="flex-1 text-center sm:text-left">
                  <div className={`inline-block rounded-2xl p-6 backdrop-blur-sm ${i % 2 === 0 ? "sm:text-right" : "sm:text-left"}`}
                       style={{ background: withOpacity("#ffffff", 0.6), border: `1px solid ${withOpacity(theme.primaryColor, 0.2)}` }}>
                    <p className="text-xs tracking-[0.3em] uppercase mb-2" style={{ color: theme.primaryColor }}>{item.year}</p>
                    <h3 className="text-xl font-semibold mb-2" style={{ color: theme.secondaryColor, fontFamily: "Georgia, serif" }}>{item.title}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: withOpacity(theme.textColor, 0.7) }}>{item.description}</p>
                  </div>
                </div>

                {/* Timeline node */}
                <motion.div
                  initial={{ scale: 0, rotate: 180 }}
                  whileInView={{ scale: 1, rotate: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 + 0.2 }}
                  className="relative flex-shrink-0 z-10"
                >
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
                    style={{
                      background: `radial-gradient(circle, ${lighten(theme.primaryColor, 0.2)}, ${theme.primaryColor})`,
                      boxShadow: `0 10px 30px -5px ${withOpacity(theme.primaryColor, 0.4)}`,
                    }}
                  >
                    <Heart className="w-5 h-5 text-white fill-white" />
                  </div>
                </motion.div>

                <div className="flex-1 hidden sm:block" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* ═══ EVENTS ═══ (Church Ceremony + Poruwa Ceremony) */}
      {isVisible("events") && (
      <section className="relative py-28 px-4 overflow-hidden" style={{ background: `linear-gradient(to bottom, ${theme.backgroundColor}, ${lighten(theme.accentColor, 0.2)})` }}>
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="tracking-[0.4em] uppercase text-xs mb-4" style={{ color: theme.primaryColor }}>Order of Ceremony</p>
            <h2 className="text-4xl sm:text-5xl font-light" style={{ color: theme.secondaryColor, fontFamily: "Georgia, serif" }}>
              Two Sacred Moments
            </h2>
            <div className="w-20 h-px mx-auto mt-6" style={{ background: `linear-gradient(to right, transparent, ${theme.primaryColor}, transparent)` }} />
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {events.slice(0, 2).map((event, i) => {
              const isChurch = /church/i.test(event.title) || i === 0;
              const iconSvg = isChurch ? ChurchArch : PoruwaCanopy;
              const Icon = iconSvg;
              const labelA = isChurch ? "CEREMONY · I" : "CEREMONY · II";
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 40, rotateY: -8 }}
                  whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.9, delay: i * 0.2, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ y: -6 }}
                  style={{ perspective: 1000 }}
                  className="relative rounded-3xl overflow-hidden"
                >
                  <div
                    className="absolute inset-0"
                    style={{
                      background: isChurch
                        ? `linear-gradient(135deg, ${withOpacity("#ffffff", 0.9)}, ${withOpacity(theme.accentColor, 0.3)})`
                        : `linear-gradient(135deg, ${withOpacity(theme.primaryColor, 0.1)}, ${withOpacity(theme.secondaryColor, 0.15)})`,
                    }}
                  />
                  <div
                    className="relative z-10 p-8 sm:p-10"
                    style={{
                      border: `1px solid ${withOpacity(theme.primaryColor, 0.2)}`,
                      borderRadius: "1.5rem",
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    {/* Corner flourish */}
                    <div className="absolute top-4 right-4 opacity-30">
                      <Star className="w-3 h-3 fill-current" style={{ color: theme.primaryColor }} />
                    </div>

                    {/* Label */}
                    <p className="text-[10px] tracking-[0.4em] uppercase mb-4" style={{ color: theme.primaryColor }}>
                      {labelA}
                    </p>

                    {/* Icon */}
                    <div className="w-20 h-20 mb-5">
                      <Icon color={theme.secondaryColor} accent={theme.primaryColor} />
                    </div>

                    {/* Title */}
                    <h3 className="text-2xl sm:text-3xl font-light mb-3" style={{ color: theme.secondaryColor, fontFamily: "Georgia, serif" }}>
                      {event.title}
                    </h3>

                    {/* Time */}
                    <div className="flex items-center gap-2 mb-2 text-sm font-medium" style={{ color: theme.primaryColor }}>
                      <span className="w-6 h-px" style={{ backgroundColor: theme.primaryColor }} />
                      <span>{event.time}</span>
                    </div>

                    {/* Venue */}
                    {event.venue && (
                      <p className="text-sm font-medium mb-3" style={{ color: theme.secondaryColor }}>
                        {event.venue}
                      </p>
                    )}

                    {/* Description */}
                    {event.description && (
                      <p className="text-sm leading-relaxed italic" style={{ color: withOpacity(theme.textColor, 0.65) }}>
                        {event.description}
                      </p>
                    )}

                    {/* Bottom decorative line */}
                    <motion.div
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: i * 0.2 + 0.5 }}
                      className="mt-6 h-px"
                      style={{ background: `linear-gradient(to right, ${theme.primaryColor}, transparent)`, transformOrigin: "left" }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Any additional events beyond the first two render as small chips */}
          {events.length > 2 && (
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="flex flex-wrap justify-center gap-3 mt-10"
            >
              {events.slice(2).map((e, i) => (
                <div
                  key={i}
                  className="px-5 py-3 rounded-full backdrop-blur-sm text-sm"
                  style={{ background: withOpacity("#ffffff", 0.6), border: `1px solid ${withOpacity(theme.primaryColor, 0.2)}`, color: theme.secondaryColor }}
                >
                  <span className="font-medium">{e.title}</span>
                  <span className="mx-2 opacity-40">·</span>
                  <span className="opacity-70">{e.time}</span>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </section>
      )}

      {/* ═══ GALLERY ═══ */}
      {isVisible("gallery") && galleryImages.length > 0 && (
      <section className="relative py-28 px-4 overflow-hidden">
        <LiquidBlob color={theme.primaryColor} size={400} top="40%" left="80%" />
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="tracking-[0.4em] uppercase text-xs mb-4" style={{ color: theme.primaryColor }}>Moments</p>
            <h2 className="text-4xl sm:text-5xl font-light" style={{ color: theme.secondaryColor, fontFamily: "Georgia, serif" }}>Captured in Bloom</h2>
            <div className="w-20 h-px mx-auto mt-6" style={{ background: `linear-gradient(to right, transparent, ${theme.primaryColor}, transparent)` }} />
          </motion.div>

          <div className="flex flex-wrap justify-center gap-8">
            {galleryImages.map((img, i) => {
              const rotate = ((i * 37) % 9) - 4;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30, rotate: 0 }}
                  whileInView={{ opacity: 1, y: 0, rotate }}
                  viewport={{ once: true }}
                  whileHover={{ rotate: 0, y: -4, scale: 1.04 }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  className="bg-white p-3 pb-10 shadow-xl relative"
                  style={{ width: 220, boxShadow: `0 15px 40px -10px ${withOpacity(theme.primaryColor, 0.3)}` }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt={`Gallery ${i + 1}`} className="w-full h-56 object-cover" />
                  <Heart className="absolute bottom-2.5 right-3 w-3.5 h-3.5 fill-current" style={{ color: theme.primaryColor }} />
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
      )}

      {/* ═══ VENUE ═══ */}
      {isVisible("venue") && (
      <section className="relative py-28 px-4 overflow-hidden" style={{ background: `linear-gradient(to bottom, ${lighten(theme.accentColor, 0.2)}, ${theme.backgroundColor})` }}>
        <LiquidBlob color={theme.primaryColor} size={500} top="10%" left="-15%" />
        <div className="max-w-4xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <p className="tracking-[0.4em] uppercase text-xs mb-4" style={{ color: theme.primaryColor }}>Location</p>
            <h2 className="text-4xl sm:text-5xl font-light mb-6" style={{ color: theme.secondaryColor, fontFamily: "Georgia, serif" }}>Where We Waltz</h2>
            <div className="flex items-center justify-center gap-2 mb-2">
              <MapPin className="w-5 h-5" style={{ color: theme.primaryColor }} />
              <h3 className="text-xl font-semibold" style={{ color: theme.secondaryColor }}>{venue}</h3>
            </div>
            <p className="mb-10" style={{ color: withOpacity(theme.textColor, 0.6) }}>{venueAddr}</p>

            <motion.div
              whileHover={{ scale: 1.01 }}
              className="rounded-3xl overflow-hidden shadow-2xl"
              style={{ boxShadow: `0 20px 60px -10px ${withOpacity(theme.primaryColor, 0.3)}` }}
            >
              <iframe
                src={mapSrc}
                className="w-full h-72 sm:h-80 border-0 block"
                loading="lazy"
                allowFullScreen
                title={`${venue} map`}
              />
            </motion.div>

            {mapUrl && (
              <a
                href={mapUrl.startsWith("http") ? mapUrl : `https://maps.google.com/maps?q=${encodeURIComponent(mapUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-full text-sm backdrop-blur-sm"
                style={{ color: theme.primaryColor, border: `1px solid ${withOpacity(theme.primaryColor, 0.3)}`, background: withOpacity("#ffffff", 0.5) }}
              >
                <MapPin className="w-4 h-4" /> Open in Google Maps
              </a>
            )}

            <SecondaryVenue second={content.venue?.second} primaryColor={theme.primaryColor} secondaryColor={theme.secondaryColor} accentColor={theme.accentColor} />
          </motion.div>
        </div>
      </section>
      )}

      {/* ═══ RSVP ═══ */}
      {isVisible("rsvp") && (
      <section className="relative py-28 px-4 overflow-hidden" style={{ background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})` }}>
        <FallingPetals count={14} color={theme.accentColor} />
        <div className="max-w-lg mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex justify-center mb-6"
            >
              <Heart className="w-10 h-10 text-white fill-white opacity-80" />
            </motion.div>
            <p className="tracking-[0.4em] uppercase text-xs mb-4 text-white/70">RSVP</p>
            <h2 className="text-4xl sm:text-5xl font-light mb-3 text-white" style={{ fontFamily: "Georgia, serif" }}>{rsvpTitle}</h2>
            {rsvpDeadline && <p className="text-white/70 text-sm mb-10 italic">{rsvpDeadline}</p>}

            <AnimatePresence mode="wait">
              {rsvpSent ? (
                <motion.div
                  key="sent"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="rounded-2xl p-8"
                  style={{ background: withOpacity("#ffffff", 0.15), backdropFilter: "blur(10px)" }}
                >
                  <Sparkles className="w-10 h-10 mx-auto mb-3 text-white" />
                  <p className="text-xl text-white font-medium">Thank you!</p>
                  <p className="text-white/70 text-sm mt-2">Your response has been saved to the dance card.</p>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={(e) => { e.preventDefault(); setRsvpSent(true); }}
                  className="space-y-3 text-left"
                >
                  <input
                    type="text"
                    placeholder="Your name"
                    required
                    className="w-full px-5 py-3.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/30 text-white placeholder-white/50 focus:outline-none focus:bg-white/20 focus:border-white/60 transition-colors"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    required
                    className="w-full px-5 py-3.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/30 text-white placeholder-white/50 focus:outline-none focus:bg-white/20 focus:border-white/60 transition-colors"
                  />
                  <select
                    required
                    className="w-full px-5 py-3.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/30 text-white focus:outline-none focus:bg-white/20 focus:border-white/60 transition-colors"
                    defaultValue=""
                  >
                    <option value="" disabled className="text-gray-800">Attending?</option>
                    <option value="yes" className="text-gray-800">Yes, joyfully</option>
                    <option value="no" className="text-gray-800">Regretfully, no</option>
                  </select>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02, boxShadow: "0 10px 40px rgba(255,255,255,0.3)" }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-4 rounded-full font-semibold tracking-wider uppercase text-sm mt-2"
                    style={{ backgroundColor: "#ffffff", color: theme.primaryColor }}
                  >
                    Send RSVP
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>
      )}

      {/* ═══ FOOTER ═══ */}
      {isVisible("footer") && (
      <footer className="py-14 text-center px-4 relative overflow-hidden" style={{ backgroundColor: theme.backgroundColor }}>
        <LiquidBlob color={theme.primaryColor} size={400} top="-30%" left="50%" />
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="relative z-10"
        >
          <div className="flex justify-center mb-4">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
              className="w-10 h-10"
            >
              <SignatureRose color={theme.primaryColor} accent={theme.accentColor} />
            </motion.div>
          </div>
          <p className="text-xl font-light mb-2" style={{ color: theme.secondaryColor, fontFamily: "Georgia, serif" }}>{groom} &amp; {bride}</p>
          <p className="text-sm mb-8" style={{ color: withOpacity(theme.textColor, 0.6) }}>{formattedDate} &middot; {venue}</p>

          {footerMessage && (
            <p className="text-sm italic max-w-md mx-auto mb-6" style={{ color: withOpacity(theme.textColor, 0.7) }}>{footerMessage}</p>
          )}

          {(groomPhone || bridePhone) && (
            <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
              {groomPhone && (
                <motion.a
                  href={`tel:${groomPhone.replace(/\s+/g, "")}`}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full backdrop-blur-sm"
                  style={{ border: `1px solid ${withOpacity(theme.primaryColor, 0.3)}`, color: theme.primaryColor, background: withOpacity("#ffffff", 0.5) }}
                >
                  <Phone className="w-4 h-4" />
                  <span className="text-sm tracking-wide">Call {groom.split(" ")[0]}</span>
                </motion.a>
              )}
              {bridePhone && (
                <motion.a
                  href={`tel:${bridePhone.replace(/\s+/g, "")}`}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full backdrop-blur-sm"
                  style={{ border: `1px solid ${withOpacity(theme.primaryColor, 0.3)}`, color: theme.primaryColor, background: withOpacity("#ffffff", 0.5) }}
                >
                  <Phone className="w-4 h-4" />
                  <span className="text-sm tracking-wide">Call {bride.split(" ")[0]}</span>
                </motion.a>
              )}
            </div>
          )}

          <p className="text-xs" style={{ color: withOpacity(theme.textColor, 0.4) }}>
            Created with <Heart className="w-2.5 h-2.5 inline fill-current" style={{ color: theme.primaryColor }} /> by{" "}
            <Link href="/" className="hover:underline" style={{ color: theme.primaryColor }}>INVITATION.LK</Link>
          </p>
        </motion.div>
      </footer>
      )}

      {/* Unused placeholder for build-time import verification */}
      <div className="hidden">
        <Mail className="w-0 h-0" />
        <Camera className="w-0 h-0" />
      </div>
    </div>
  );
}
