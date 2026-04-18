"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { Heart, MapPin, Clock, Calendar, Mail, Phone, Camera, ChevronDown } from "lucide-react";
import Countdown from "./shared/Countdown";
import SecondaryVenue from "./shared/SecondaryVenue";
import { useState, useRef } from "react";
import type { InvitationData } from "@/types/invitation";
import { deepMerge } from "@/lib/deep-merge";
import { withOpacity } from "@/lib/with-opacity";
import type { TemplateConfig, ThemeConfig } from "@/types/template-config";
import { DEFAULT_SECTIONS } from "@/types/template-config";

export const DEFAULT_CONFIG: TemplateConfig = {
  theme: {
    primaryColor: "#f472b6",
    secondaryColor: "#ec4899",
    backgroundColor: "#ffffff",
    textColor: "#1f2937",
    accentColor: "#f9a8d4",
    fontFamily: "sans-serif",
  },
  sections: [...DEFAULT_SECTIONS],
  content: {
    hero: { subtitle: "We're getting married", message: "" },
    story: { title: "Our Love Story" },
    rsvp: { title: "Be Our Guest", deadline: "Please let us know by July 22, 2026" },
    footer: { message: "" },
  },
};

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

export default function ModernBloom({ data, config }: { data?: InvitationData; config?: TemplateConfig } = {}) {
  const merged = deepMerge(DEFAULT_CONFIG as Record<string, unknown>, (config || {}) as Record<string, unknown>) as TemplateConfig;
  const theme = merged.theme as ThemeConfig;
  const sections = (merged.sections || DEFAULT_SECTIONS).filter(s => s.visible).sort((a, b) => a.order - b.order);
  const content = merged.content || {};

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

  const dateObj = new Date(date + "T00:00:00");
  const dayName = dateObj.toLocaleDateString("en-US", { weekday: "long" }).toUpperCase();
  const formattedDate = dateObj.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  const storyItems = content.story?.items || [
    { year: "2019", title: "First Meeting", description: "Our paths crossed at the University of Peradeniya, where Sachini was studying architecture and Kavinda was pursuing engineering." },
    { year: "2021", title: "Started Dating", description: "What started as study sessions in the library blossomed into late-night conversations and weekend adventures across the island." },
    { year: "2024", title: "The Proposal", description: "Kavinda proposed on a misty morning at Horton Plains, overlooking World's End." },
    { year: "2026", title: "The Wedding", description: "Now we invite you to join us as we begin this new chapter, celebrating with a beach ceremony." },
  ];

  const [rsvpSent, setRsvpSent] = useState(false);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const HeroSection = () => (
    <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 overflow-hidden">
      <WatercolorBlob className="top-0 left-0 w-[280px] sm:w-[500px] h-[280px] sm:h-[500px]" color={withOpacity(theme.accentColor, 0.25)} delay={0} />
      <WatercolorBlob className="bottom-0 right-0 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px]" color={withOpacity(theme.primaryColor, 0.12)} delay={2} />
      <WatercolorBlob className="top-1/3 right-1/4 w-[200px] sm:w-[300px] h-[200px] sm:h-[300px]" color={withOpacity(theme.accentColor, 0.15)} delay={4} />
      <WatercolorBlob className="bottom-1/4 left-1/3 w-[180px] sm:w-[250px] h-[180px] sm:h-[250px]" color={withOpacity(theme.primaryColor, 0.18)} delay={1} />

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
            stroke={theme.accentColor} fill="none" strokeWidth="1.5"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2 }}
          />
          <motion.path
            d="M10 15 Q30 30 60 15 Q90 0 110 15"
            stroke={theme.accentColor} fill="none" strokeWidth="1.5"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, delay: 0.5 }}
          />
        </motion.svg>

        <motion.p
          className="tracking-[0.3em] uppercase text-sm mb-10 font-light"
          style={{ color: theme.primaryColor }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          {content.hero?.subtitle || "We're getting married"}
        </motion.p>

        <motion.h1
          className="text-6xl sm:text-8xl lg:text-9xl font-extralight tracking-tight leading-none mb-2"
          style={{ color: theme.textColor }}
          initial={{ opacity: 0, y: 50, filter: "blur(12px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1.2, delay: 0.3 }}
        >
          {bride}
        </motion.h1>

        <motion.p
          className="text-4xl font-light italic my-5"
          style={{ color: theme.accentColor }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.8, type: "spring" }}
        >
          &amp;
        </motion.p>

        <motion.h1
          className="text-6xl sm:text-8xl lg:text-9xl font-extralight tracking-tight leading-none"
          style={{ color: theme.textColor }}
          initial={{ opacity: 0, y: 50, filter: "blur(12px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1.2, delay: 0.6 }}
        >
          {groom}
        </motion.h1>

        <motion.div
          className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6"
          style={{ color: withOpacity(theme.textColor, 0.5) }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          {[
            { icon: Calendar, text: formattedDate },
            { icon: Clock, text: time },
            { icon: MapPin, text: venue },
          ].map((item, i) => (
            <motion.div
              key={i}
              className="flex items-center gap-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.5 + i * 0.2 }}
            >
              <item.icon className="w-4 h-4" style={{ color: theme.primaryColor }} />
              <span className="text-sm">{item.text}</span>
              {i < 2 && <div className="hidden sm:block w-1.5 h-1.5 rounded-full ml-4" style={{ backgroundColor: theme.accentColor }} />}
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 z-10"
      >
        <ChevronDown className="w-6 h-6" style={{ color: theme.accentColor }} />
      </motion.div>
    </section>
  );

  const CountdownSection = () => (
    <section className="relative py-20 text-center overflow-hidden" style={{ background: `linear-gradient(to right, ${withOpacity(theme.primaryColor, 0.05)}, ${withOpacity(theme.secondaryColor, 0.05)}, ${withOpacity(theme.primaryColor, 0.05)})` }}>
      <FloatingPetals count={8} />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative z-10"
      >
        <p className="tracking-[0.3em] uppercase text-xs mb-8" style={{ color: theme.primaryColor }}>Counting the days</p>
        <Countdown
          targetDate={`${date}T15:00:00`}
          valueClassName="text-3xl sm:text-6xl font-extralight"
          valueStyle={{ color: theme.textColor }}
          labelClassName="text-[10px] tracking-[0.2em] uppercase mt-3"
          labelStyle={{ color: theme.primaryColor }}
          boxClassName="flex flex-col items-center bg-white rounded-xl sm:rounded-2xl shadow-lg px-3 sm:px-6 py-5 min-w-[60px] sm:min-w-[100px]"
          separatorClassName="text-xl sm:text-3xl font-extralight mx-1 self-start mt-3"
          separatorStyle={{ color: theme.accentColor }}
        />
      </motion.div>
    </section>
  );

  const StorySection = () => (
    <section className="py-28 px-4 max-w-3xl mx-auto text-center">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <motion.div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-8"
          style={{ backgroundColor: withOpacity(theme.primaryColor, 0.1) }}
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          <Heart className="w-7 h-7" style={{ color: theme.primaryColor, fill: theme.primaryColor }} />
        </motion.div>
        <h2 className="text-4xl sm:text-5xl font-extralight mb-10" style={{ color: theme.textColor }}>{content.story?.title || "Our Love Story"}</h2>

        {storyItems.map((item, i) => (
          <motion.p
            key={i}
            className="text-lg leading-loose mb-8"
            style={{ color: withOpacity(theme.textColor, 0.5) }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.2 }}
          >
            <span className="font-semibold" style={{ color: theme.primaryColor }}>{item.year} - {item.title}:</span> {item.description}
          </motion.p>
        ))}
      </motion.div>
    </section>
  );

  const EventsSection = () => (
    <section className="relative py-28 px-4 overflow-hidden" style={{ backgroundColor: withOpacity(theme.primaryColor, 0.03) }}>
      <FloatingPetals count={6} />
      <div className="max-w-5xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="tracking-[0.3em] uppercase text-xs mb-4" style={{ color: theme.primaryColor }}>Timeline</p>
          <h2 className="text-4xl sm:text-5xl font-extralight" style={{ color: theme.textColor }}>Wedding Day Schedule</h2>
        </motion.div>

        <div className="relative">
          {/* Animated center line */}
          <motion.div
            className="absolute left-1/2 top-0 w-px hidden md:block"
            style={{ background: `linear-gradient(to bottom, ${withOpacity(theme.primaryColor, 0.5)}, ${withOpacity(theme.primaryColor, 0.3)}, transparent)` }}
            initial={{ height: 0 }}
            whileInView={{ height: "100%" }}
            viewport={{ once: true }}
            transition={{ duration: 2 }}
          />

          {events.map((event, i) => (
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
                whileHover={{ y: -4, boxShadow: `0 16px 40px -8px ${withOpacity(theme.primaryColor, 0.15)}` }}
                className={`flex-1 bg-white p-6 rounded-2xl shadow-sm ${
                  i % 2 === 1 ? "md:text-left" : "md:text-right"
                } text-center transition-shadow`}
                style={{ borderWidth: 1, borderStyle: "solid", borderColor: withOpacity(theme.primaryColor, 0.15) }}
              >
                <p className="font-medium text-sm mb-1" style={{ color: theme.primaryColor }}>{event.time}</p>
                <h3 className="text-lg font-semibold mb-2" style={{ color: theme.textColor }}>{event.title}</h3>
                <p className="text-sm" style={{ color: withOpacity(theme.textColor, 0.5) }}>{event.description}</p>
              </motion.div>

              <motion.div
                className="w-12 h-12 rounded-full flex items-center justify-center z-10 flex-shrink-0 shadow-lg"
                style={{ backgroundColor: theme.primaryColor, boxShadow: `0 4px 15px ${withOpacity(theme.primaryColor, 0.25)}` }}
                animate={{
                  boxShadow: [
                    `0 0 0 0 ${withOpacity(theme.primaryColor, 0)}`,
                    `0 0 0 10px ${withOpacity(theme.primaryColor, 0.15)}`,
                    `0 0 0 0 ${withOpacity(theme.primaryColor, 0)}`,
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
  );

  const GallerySection = () => (
    <section className="py-28 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="tracking-[0.3em] uppercase text-xs mb-4" style={{ color: theme.primaryColor }}>Photos</p>
          <h2 className="text-4xl sm:text-5xl font-extralight" style={{ color: theme.textColor }}>Captured Moments</h2>
        </motion.div>

        {content.gallery?.images?.length ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {content.gallery.images.map((src: string, i: number) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                whileHover={{ scale: 1.05, zIndex: 10 }}
                className="rounded-2xl overflow-hidden aspect-[4/3]"
              >
                <img src={src} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover" />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                whileHover={{ scale: 1.05, zIndex: 10 }}
                className={`${i === 0 || i === 5 ? "col-span-2 row-span-2" : ""} rounded-2xl min-h-[120px] flex items-center justify-center cursor-pointer group relative overflow-hidden`}
                style={{ background: `linear-gradient(to bottom right, ${withOpacity(theme.primaryColor, 0.1)}, ${withOpacity(theme.secondaryColor, 0.1)})` }}
              >
                <Camera className="w-6 h-6 group-hover:text-pink-400 transition-colors" style={{ color: withOpacity(theme.primaryColor, 0.3) }} />
                <div className="absolute inset-0 group-hover:opacity-100 opacity-0 transition-opacity" style={{ backgroundColor: withOpacity(theme.primaryColor, 0.05) }} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );

  const VenueSection = () => (
    <section className="py-28 px-4" style={{ backgroundColor: withOpacity(theme.primaryColor, 0.03) }}>
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="tracking-[0.3em] uppercase text-xs mb-4" style={{ color: theme.primaryColor }}>Venue</p>
          <h2 className="text-4xl sm:text-5xl font-extralight mb-2" style={{ color: theme.textColor }}>{venue}</h2>
          <p className="mb-10" style={{ color: withOpacity(theme.textColor, 0.5) }}>{venueAddr}</p>
          {(content.venue?.mapUrl || venue || venueAddr) ? (
            <iframe
              src={`https://maps.google.com/maps?q=${encodeURIComponent(
                content.venue?.mapUrl && content.venue.mapUrl.includes("google")
                  ? content.venue.mapUrl
                  : [venue, venueAddr].filter(Boolean).join(", ")
              )}&output=embed`}
              className="w-full h-64 rounded-2xl border-0"
              loading="lazy"
              allowFullScreen
              title="Wedding Venue Map"
            />
          ) : (
            <div className="rounded-2xl h-72 sm:h-80 flex items-center justify-center shadow-inner" style={{ background: `linear-gradient(to bottom right, ${withOpacity(theme.primaryColor, 0.1)}, ${withOpacity(theme.secondaryColor, 0.1)})` }}>
              <MapPin className="w-10 h-10" style={{ color: withOpacity(theme.primaryColor, 0.3) }} />
            </div>
          )}
          {content.venue?.mapUrl && (
            <a
              href={content.venue.mapUrl.startsWith("http") ? content.venue.mapUrl : `https://maps.google.com/maps?q=${encodeURIComponent(content.venue.mapUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full text-sm"
              style={{ color: theme.primaryColor, border: `1px solid ${withOpacity(theme.primaryColor, 0.3)}` }}
            >
              <MapPin className="w-4 h-4" /> Open in Google Maps
            </a>
          )}
          <SecondaryVenue second={content.venue?.second} primaryColor={theme.primaryColor} secondaryColor={theme.secondaryColor} accentColor={theme.accentColor} />
        </motion.div>
      </div>
    </section>
  );

  const RsvpSection = () => (
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
            <Heart className="w-10 h-10 mx-auto mb-6" style={{ color: theme.primaryColor, fill: theme.primaryColor }} />
          </motion.div>
          <h2 className="text-4xl sm:text-5xl font-extralight mb-2" style={{ color: theme.textColor }}>{content.rsvp?.title || "Be Our Guest"}</h2>
          <p className="text-sm mb-12" style={{ color: withOpacity(theme.textColor, 0.4) }}>{content.rsvp?.deadline || "Please let us know by July 22, 2026"}</p>

          {rsvpSent ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="rounded-2xl p-10"
              style={{ backgroundColor: withOpacity(theme.primaryColor, 0.05) }}
            >
              <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 3, repeat: 1 }}>
                <Heart className="w-12 h-12 mx-auto mb-4" style={{ color: theme.primaryColor, fill: theme.primaryColor }} />
              </motion.div>
              <p className="text-2xl font-extralight" style={{ color: theme.textColor }}>Thank you!</p>
              <p className="mt-2 text-sm" style={{ color: withOpacity(theme.textColor, 0.5) }}>We can&apos;t wait to see you there.</p>
            </motion.div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); setRsvpSent(true); }} className="space-y-4">
              <input type="text" placeholder="Full Name" required className="w-full px-5 py-4 rounded-xl focus:outline-none bg-white text-sm transition-all" style={{ borderWidth: 1, borderStyle: "solid", borderColor: withOpacity(theme.primaryColor, 0.3) }} />
              <input type="email" placeholder="Email" className="w-full px-5 py-4 rounded-xl focus:outline-none bg-white text-sm transition-all" style={{ borderWidth: 1, borderStyle: "solid", borderColor: withOpacity(theme.primaryColor, 0.3) }} />
              <select className="w-full px-5 py-4 rounded-xl focus:outline-none bg-white text-sm" style={{ borderWidth: 1, borderStyle: "solid", borderColor: withOpacity(theme.primaryColor, 0.3), color: withOpacity(theme.textColor, 0.5) }}>
                <option value="">Attending?</option>
                <option value="yes">Yes, I&apos;ll be there!</option>
                <option value="no">Sorry, can&apos;t make it</option>
              </select>
              <input type="number" min="1" max="5" placeholder="Number of guests" className="w-full px-5 py-4 rounded-xl focus:outline-none bg-white text-sm transition-all" style={{ borderWidth: 1, borderStyle: "solid", borderColor: withOpacity(theme.primaryColor, 0.3) }} />
              <textarea placeholder="Any message for the couple?" rows={3} className="w-full px-5 py-4 rounded-xl focus:outline-none bg-white text-sm resize-none transition-all" style={{ borderWidth: 1, borderStyle: "solid", borderColor: withOpacity(theme.primaryColor, 0.3) }} />
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02, boxShadow: `0 8px 30px ${withOpacity(theme.primaryColor, 0.25)}` }}
                whileTap={{ scale: 0.98 }}
                className="w-full text-white py-4 rounded-xl font-medium shadow-lg"
                style={{ background: `linear-gradient(to right, ${theme.primaryColor}, ${theme.secondaryColor})`, boxShadow: `0 4px 15px ${withOpacity(theme.primaryColor, 0.2)}` }}
              >
                Send RSVP
              </motion.button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );

  const FooterSection = () => (
    <footer className="py-14 text-center px-4" style={{ backgroundColor: withOpacity(theme.primaryColor, 0.03) }}>
      <Heart className="w-5 h-5 mx-auto mb-3" style={{ color: theme.primaryColor, fill: theme.primaryColor }} />
      <p className="font-extralight text-xl" style={{ color: theme.textColor }}>{bride} & {groom}</p>
      <p className="text-sm mt-2" style={{ color: withOpacity(theme.textColor, 0.3) }}>{formattedDate} &middot; {venue}</p>
      <div className="flex justify-center gap-3 mt-6 mb-6">
        {[Phone, Mail].map((Icon, i) => (
          <motion.div key={i} whileHover={{ scale: 1.15 }} className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer" style={{ borderWidth: 1, borderStyle: "solid", borderColor: withOpacity(theme.primaryColor, 0.3) }}>
            <Icon className="w-4 h-4" style={{ color: theme.primaryColor }} />
          </motion.div>
        ))}
      </div>
      <p className="text-xs" style={{ color: withOpacity(theme.textColor, 0.2) }}>
        Created with <Heart className="w-3 h-3 inline" style={{ color: theme.primaryColor, fill: theme.primaryColor }} /> by{" "}
        <Link href="/" style={{ color: theme.primaryColor }} className="hover:underline">INVITATION.LK</Link>
      </p>
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
