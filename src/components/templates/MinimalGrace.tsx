"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { Heart, MapPin, Mail, Phone, Camera, ArrowDown } from "lucide-react";
import Countdown from "./shared/Countdown";
import { useState, useRef } from "react";
import type { InvitationData } from "@/types/invitation";
import { deepMerge } from "@/lib/deep-merge";
import { withOpacity } from "@/lib/with-opacity";
import type { TemplateConfig, ThemeConfig } from "@/types/template-config";
import { DEFAULT_SECTIONS } from "@/types/template-config";

export const DEFAULT_CONFIG: TemplateConfig = {
  theme: {
    primaryColor: "#78716c",
    secondaryColor: "#a8a29e",
    backgroundColor: "#faf9f6",
    textColor: "#111827",
    accentColor: "#d6d3d1",
    fontFamily: "sans-serif",
  },
  sections: [...DEFAULT_SECTIONS],
  content: {
    hero: { subtitle: "The Wedding Of", message: "" },
    story: { title: "Our Story" },
    rsvp: { title: "Will you join us?", deadline: "" },
    footer: { message: "" },
  },
};

/* ── Dramatic text reveal animation ── */
function RevealText({ children, delay = 0, className = "" }: { children: string; delay?: number; className?: string }) {
  return (
    <motion.div className={`overflow-hidden ${className}`}>
      <motion.div
        initial={{ y: "110%" }}
        animate={{ y: 0 }}
        transition={{ duration: 1.2, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

/* ── Thin decorative diamond ornament ── */
function DiamondOrnament({ className = "", color = "#a8a29e" }: { className?: string; color?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`}>
      <div className="w-16 h-px" style={{ background: `linear-gradient(to right, transparent, ${color})` }} />
      <div className="w-2 h-2 rotate-45" style={{ borderWidth: 1, borderStyle: "solid", borderColor: color }} />
      <div className="w-16 h-px" style={{ background: `linear-gradient(to left, transparent, ${color})` }} />
    </div>
  );
}


export default function MinimalGrace({ data, config }: { data?: InvitationData; config?: TemplateConfig } = {}) {
  const merged = deepMerge(DEFAULT_CONFIG as Record<string, unknown>, (config || {}) as Record<string, unknown>) as TemplateConfig;
  const theme = merged.theme as ThemeConfig;
  const sections = (merged.sections || DEFAULT_SECTIONS).filter(s => s.visible).sort((a, b) => a.order - b.order);
  const content = merged.content || {};

  const groom = data?.groomName || "Ruwan";
  const bride = data?.brideName || "Amaya";
  const date = data?.weddingDate || "2026-09-12";
  const time = data?.weddingTime || "10:00 AM";
  const venue = data?.venue || "Trinity College Chapel";
  const venueAddr = data?.venueAddress || "Chapel Road, Kandy, Sri Lanka";
  const events = data?.events || [
    { title: "Church Ceremony", time: "10:00 AM", venue: "Trinity College Chapel, Kandy" },
    { title: "Lunch Reception", time: "12:30 PM", venue: "The Radh Hotel, Peradeniya Road" },
    { title: "Garden Party", time: "4:00 PM", venue: "Royal Botanical Gardens" },
    { title: "Dinner & Dancing", time: "7:00 PM", venue: "The Radh Hotel, Grand Hall" },
  ];

  const dateObj = new Date(date + "T00:00:00");
  const formattedDate = dateObj.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const shortDate = `${dateObj.getDate().toString().padStart(2, "0")}.${(dateObj.getMonth() + 1).toString().padStart(2, "0")}.${dateObj.getFullYear()}`;

  const storyItems = content.story?.items || [
    { year: "2019", title: "First Meeting", description: "Amaya and Ruwan found each other in the quiet corridors of the Kandy Public Library." },
    { year: "2020", title: "First Date", description: "Their hands reached for the same shelf, and in that small, unremarkable moment, everything changed." },
    { year: "2024", title: "The Proposal", description: "Five years later, they still share books, morning tea overlooking the hills, and an unshakeable certainty." },
    { year: "2026", title: "The Wedding", description: "They were meant to find each other." },
  ];

  const [rsvpSent, setRsvpSent] = useState(false);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.6], [1, 0.95]);

  const HeroSection = () => (
    <section ref={heroRef} className="min-h-screen flex flex-col items-center justify-center text-center px-4 relative">
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: `linear-gradient(${theme.accentColor} 1px, transparent 1px), linear-gradient(90deg, ${theme.accentColor} 1px, transparent 1px)`,
        backgroundSize: "60px 60px",
      }} />

      <motion.div style={{ opacity: heroOpacity, scale: heroScale }} className="relative z-10">
        <motion.p
          className="text-[10px] tracking-[0.7em] uppercase mb-16"
          style={{ color: theme.primaryColor }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, delay: 1.5 }}
        >
          {content.hero?.subtitle || "The Wedding Of"}
        </motion.p>

        <RevealText delay={0.3} className="text-5xl sm:text-9xl lg:text-[10rem] font-extralight tracking-tight leading-none" >
          {bride}
        </RevealText>

        <motion.p
          className="text-5xl font-extralight my-4"
          style={{ color: theme.secondaryColor }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 1, type: "spring" }}
        >
          &amp;
        </motion.p>

        <RevealText delay={0.6} className="text-5xl sm:text-9xl lg:text-[10rem] font-extralight tracking-tight leading-none">
          {groom}
        </RevealText>

        {/* Animated vertical line */}
        <div className="flex justify-center my-14">
          <motion.div
            className="w-px"
            style={{ backgroundColor: theme.secondaryColor }}
            initial={{ height: 0 }}
            animate={{ height: 80 }}
            transition={{ duration: 1.5, delay: 1.2 }}
          />
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          <p className="text-sm tracking-[0.4em]" style={{ color: theme.primaryColor }}>
            {formattedDate}
          </p>
          <p className="text-[10px] tracking-[0.5em] mt-3" style={{ color: theme.secondaryColor }}>
            {venue}
          </p>
        </motion.div>
      </motion.div>

      <motion.div
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
        className="absolute bottom-10"
      >
        <ArrowDown className="w-4 h-4" style={{ color: theme.secondaryColor }} />
      </motion.div>
    </section>
  );

  const CountdownSection = () => (
    <section className="py-24 text-center" style={{ borderTop: `1px solid ${theme.accentColor}`, borderBottom: `1px solid ${theme.accentColor}` }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
      >
        <DiamondOrnament className="mb-10" color={theme.secondaryColor} />
        <Countdown
          targetDate={`${date}T10:00:00`}
          valueClassName="text-3xl sm:text-7xl font-extralight"
          valueStyle={{ color: theme.textColor }}
          labelClassName="text-[9px] tracking-[0.4em] uppercase mt-4"
          labelStyle={{ color: theme.primaryColor }}
          boxClassName="flex flex-col items-center min-w-[60px] sm:min-w-[110px]"
          separatorClassName="text-2xl sm:text-4xl font-extralight mx-1 sm:mx-4 self-start"
          separatorStyle={{ color: theme.accentColor }}
        />
        <DiamondOrnament className="mt-10" color={theme.secondaryColor} />
      </motion.div>
    </section>
  );

  const StorySection = () => (
    <section className="py-36 px-4 max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="text-center"
      >
        <motion.p
          className="text-[10px] tracking-[0.7em] uppercase mb-12"
          style={{ color: theme.primaryColor }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          {content.story?.title || "Our Story"}
        </motion.p>

        {storyItems.map((item, i) => (
          <div key={i}>
            <motion.p
              className="text-xl sm:text-2xl leading-loose font-extralight"
              style={{ color: withOpacity(theme.textColor, 0.6) }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
            >
              <span className="font-medium" style={{ color: theme.textColor }}>{item.year}:</span> {item.description}
            </motion.p>
            {i < storyItems.length - 1 && (
              <motion.div
                className="w-px mx-auto my-14"
                style={{ backgroundColor: theme.secondaryColor }}
                initial={{ height: 0 }}
                whileInView={{ height: 64 }}
                viewport={{ once: true }}
              />
            )}
          </div>
        ))}
      </motion.div>
    </section>
  );

  const EventsSection = () => (
    <section className="py-28 px-4" style={{ backgroundColor: withOpacity(theme.accentColor, 0.3) }}>
      <div className="max-w-2xl mx-auto">
        <motion.p
          className="text-[10px] tracking-[0.7em] uppercase text-center mb-4"
          style={{ color: theme.primaryColor }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Schedule
        </motion.p>
        <DiamondOrnament className="mb-14" color={theme.secondaryColor} />

        <div className="space-y-0">
          {events.map((event, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              whileHover={{ x: 8, backgroundColor: "rgba(0,0,0,0.02)" }}
              className="flex items-baseline gap-8 py-7 cursor-default transition-all"
              style={{ borderBottom: `1px solid ${theme.accentColor}` }}
            >
              <span className="text-sm font-light w-24 flex-shrink-0 tracking-wider" style={{ color: theme.primaryColor }}>{event.time}</span>
              <div>
                <h3 className="font-medium text-lg" style={{ color: theme.textColor }}>{event.title}</h3>
                {event.venue && <p className="text-sm mt-1" style={{ color: theme.primaryColor }}>{event.venue}</p>}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );

  const GallerySection = () => (
    <section className="py-28 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.p
          className="text-[10px] tracking-[0.7em] uppercase text-center mb-4"
          style={{ color: theme.primaryColor }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Gallery
        </motion.p>
        <DiamondOrnament className="mb-14" color={theme.secondaryColor} />

        {content.gallery?.images?.length ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {content.gallery.images.map((src: string, i: number) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                whileHover={{ scale: 1.03, zIndex: 10 }}
                className="rounded-2xl overflow-hidden aspect-[4/3]"
              >
                <img src={src} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover" />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                whileHover={{ scale: 1.03, zIndex: 10 }}
                className={`${i === 0 || i === 7 ? "col-span-2 aspect-[2/1]" : "aspect-square"} flex items-center justify-center cursor-pointer group`}
                style={{ backgroundColor: withOpacity(theme.accentColor, 0.3), borderWidth: 1, borderStyle: "solid", borderColor: theme.accentColor }}
              >
                <Camera className="w-5 h-5 group-hover:opacity-80 transition-colors" style={{ color: theme.secondaryColor }} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );

  const VenueSection = () => (
    <section className="py-28 px-4" style={{ backgroundColor: withOpacity(theme.accentColor, 0.3) }}>
      <div className="max-w-3xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <p className="text-[10px] tracking-[0.7em] uppercase mb-10" style={{ color: theme.primaryColor }}>Venue</p>
          <h2 className="text-2xl sm:text-3xl font-extralight mb-2" style={{ color: theme.textColor }}>{venue}</h2>
          <p className="text-sm mb-12" style={{ color: theme.primaryColor }}>{venueAddr}</p>
          {(content.venue?.mapUrl || venue || venueAddr) ? (
            <iframe
              src={`https://maps.google.com/maps?q=${encodeURIComponent(
                content.venue?.mapUrl && content.venue.mapUrl.includes("google")
                  ? content.venue.mapUrl
                  : [venue, venueAddr].filter(Boolean).join(", ")
              )}&output=embed`}
              className="w-full h-64 sm:h-72 border-0"
              style={{ borderWidth: 1, borderStyle: "solid", borderColor: theme.accentColor }}
              loading="lazy"
              allowFullScreen
              title="Wedding Venue Map"
            />
          ) : (
            <div className="h-64 sm:h-72 flex items-center justify-center" style={{ backgroundColor: withOpacity(theme.accentColor, 0.5), borderWidth: 1, borderStyle: "solid", borderColor: theme.accentColor }}>
              <MapPin className="w-6 h-6" style={{ color: theme.secondaryColor }} />
            </div>
          )}
          {content.venue?.mapUrl && (
            <a
              href={content.venue.mapUrl.startsWith("http") ? content.venue.mapUrl : `https://maps.google.com/maps?q=${encodeURIComponent(content.venue.mapUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 text-sm"
              style={{ color: theme.primaryColor, border: `1px solid ${theme.accentColor}` }}
            >
              <MapPin className="w-4 h-4" /> Open in Google Maps
            </a>
          )}
        </motion.div>
      </div>
    </section>
  );

  const RsvpSection = () => (
    <section className="py-36 px-4">
      <div className="max-w-sm mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-[10px] tracking-[0.7em] uppercase mb-10" style={{ color: theme.primaryColor }}>RSVP</p>
          <h2 className="text-3xl font-extralight mb-4" style={{ color: theme.textColor }}>{content.rsvp?.title || "Will you join us?"}</h2>
          {content.rsvp?.deadline && <p className="text-sm mb-4" style={{ color: theme.primaryColor }}>{content.rsvp.deadline}</p>}
          <DiamondOrnament className="mb-12" color={theme.secondaryColor} />

          {rsvpSent ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: 2 }}
              >
                <Heart className="w-8 h-8 mx-auto mb-6" style={{ color: theme.secondaryColor }} />
              </motion.div>
              <p className="font-extralight text-lg" style={{ color: withOpacity(theme.textColor, 0.6) }}>Thank you for your response.</p>
            </motion.div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); setRsvpSent(true); }} className="space-y-8">
              <motion.input
                type="text" placeholder="Name" required
                className="w-full py-4 text-center text-sm focus:outline-none bg-transparent transition-colors placeholder:opacity-50"
                style={{ color: theme.textColor, borderBottom: `1px solid ${theme.secondaryColor}` }}
              />
              <motion.input
                type="email" placeholder="Email"
                className="w-full py-4 text-center text-sm focus:outline-none bg-transparent transition-colors placeholder:opacity-50"
                style={{ color: theme.textColor, borderBottom: `1px solid ${theme.secondaryColor}` }}
              />
              <div className="flex gap-8 justify-center py-2">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="radio" name="attending" value="yes" className="w-4 h-4" style={{ accentColor: theme.textColor }} />
                  <span className="text-sm" style={{ color: withOpacity(theme.textColor, 0.6) }}>Accept</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="radio" name="attending" value="no" className="w-4 h-4" style={{ accentColor: theme.textColor }} />
                  <span className="text-sm" style={{ color: withOpacity(theme.textColor, 0.6) }}>Decline</span>
                </label>
              </div>
              <motion.input
                type="number" min="1" max="4" placeholder="Guests"
                className="w-full py-4 text-center text-sm focus:outline-none bg-transparent transition-colors placeholder:opacity-50"
                style={{ color: theme.textColor, borderBottom: `1px solid ${theme.secondaryColor}` }}
              />
              <motion.button
                type="submit"
                whileHover={{ backgroundColor: theme.textColor, color: theme.backgroundColor }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 text-[11px] tracking-[0.4em] uppercase transition-colors"
                style={{ borderWidth: 1, borderStyle: "solid", borderColor: theme.textColor, color: theme.textColor }}
              >
                Respond
              </motion.button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );

  const FooterSection = () => (
    <footer className="py-20 text-center px-4" style={{ borderTop: `1px solid ${theme.accentColor}` }}>
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <DiamondOrnament className="mb-8" color={theme.secondaryColor} />
        <p className="text-xl font-extralight tracking-widest" style={{ color: theme.textColor }}>{bride} & {groom}</p>
        <p className="text-[10px] tracking-[0.5em] mt-3" style={{ color: theme.primaryColor }}>{shortDate}</p>
        <div className="flex justify-center gap-6 mt-10 mb-10">
          {[Phone, Mail].map((Icon, i) => (
            <motion.div key={i} whileHover={{ scale: 1.2 }}>
              <Icon className="w-4 h-4 cursor-pointer transition-colors" style={{ color: theme.secondaryColor }} />
            </motion.div>
          ))}
        </div>
        <p className="text-[9px] tracking-[0.3em] uppercase" style={{ color: theme.secondaryColor }}>
          <Link href="/" className="hover:opacity-60 transition-opacity">INVITATION.LK</Link>
        </p>
      </motion.div>
    </footer>
  );

  const renderSection = (sectionId: string) => {
    switch (sectionId) {
      case "hero": return <HeroSection key="hero" />;
      case "countdown": return <CountdownSection key="countdown" />;
      case "story": return <StorySection key="story" />;
      case "events": return <EventsSection key="events" />;
      case "gallery": return <GallerySection key="gallery" />;
      case "venue": return <VenueSection key="venue" />;
      case "rsvp": return <RsvpSection key="rsvp" />;
      case "footer": return <FooterSection key="footer" />;
      default: return null;
    }
  };

  return (
    <div className="overflow-hidden" style={{ backgroundColor: theme.backgroundColor, color: theme.textColor, fontFamily: theme.fontFamily }}>
      {sections.map(s => renderSection(s.id))}
    </div>
  );
}
