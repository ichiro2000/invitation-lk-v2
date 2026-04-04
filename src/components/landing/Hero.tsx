"use client";

import { motion } from "framer-motion";
import { ArrowRight, Play, Sparkles, Star, Heart, ChevronDown } from "lucide-react";
import Link from "next/link";


export default function Hero() {
  return (
    <section className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-rose-50/80 via-white to-white" />
      <motion.div
        className="absolute -top-32 -left-32 w-[520px] h-[520px] rounded-full blur-[100px]"
        style={{ background: "rgba(254,205,211,0.45)" }}
        animate={{ x: [0, 80, 0], y: [0, 50, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-20 -right-20 w-[440px] h-[440px] rounded-full blur-[100px]"
        style={{ background: "rgba(253,230,138,0.3)" }}
        animate={{ x: [0, -60, 0], y: [0, -40, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 3 }}
      />
      <div className="absolute inset-0 opacity-[0.018]" style={{ backgroundImage: "radial-gradient(circle, #94a3b8 1px, transparent 1px)", backgroundSize: "48px 48px" }} />

      <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 pt-28 pb-20">
        <div className="grid lg:grid-cols-[1fr,auto] gap-16 xl:gap-24 items-center">
          {/* Content */}
          <div className="text-center lg:text-left max-w-2xl mx-auto lg:mx-0">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ ease: [0.25, 0.46, 0.45, 0.94] as const }} className="badge mb-8">
              <Sparkles className="w-3.5 h-3.5" />
              Start free — no credit card needed
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="heading-xl mb-6">
              <span className="text-shimmer">Create your dream wedding invitation</span>
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }} className="body-lg max-w-lg mx-auto lg:mx-0 mb-10">
              Design beautiful digital invitations in minutes. Share via WhatsApp, track RSVPs, and manage your guest list.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }} className="flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start">
              <Link href="/onboard" className="btn-primary px-7 py-3.5 text-[0.9375rem]">
                Get Started Free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/templates" className="btn-secondary group px-6 py-3">
                <div className="w-8 h-8 bg-rose-50 rounded-full flex items-center justify-center mr-1 group-hover:bg-rose-100 transition-colors">
                  <Play className="w-3 h-3 text-rose-600 ml-0.5" />
                </div>
                View Templates
              </Link>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-12 flex items-center gap-4 justify-center lg:justify-start">
              <div className="flex -space-x-1.5">
                {["bg-rose-400", "bg-amber-400", "bg-violet-400", "bg-teal-400"].map((bg, i) => (
                  <div key={i} className={`w-7 h-7 rounded-full border-[1.5px] border-white ${bg} shadow-sm`} />
                ))}
              </div>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <span className="text-xs text-slate-400 font-medium">Trusted by 500+ couples</span>
            </motion.div>
          </div>

          {/* Phone mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative hidden lg:block w-[280px] flex-shrink-0"
          >
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-44 h-6 bg-black/8 rounded-full blur-xl" />

            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="relative"
            >
              <div className="bg-slate-900 rounded-[2.5rem] p-2.5 shadow-2xl shadow-slate-900/20">
                <div className="bg-white rounded-[2rem] overflow-hidden">
                  <div className="h-[540px] bg-gradient-to-b from-rose-50 via-white to-rose-50/30 px-5 py-8 flex flex-col items-center justify-center text-center relative">
                    <div className="absolute top-4 left-0 right-0 flex justify-center">
                      <div className="w-20 h-5 bg-slate-900 rounded-full" />
                    </div>
                    <div className="w-14 h-14 bg-rose-50 rounded-full flex items-center justify-center mb-4">
                      <Heart className="w-7 h-7 text-rose-500 fill-rose-500" />
                    </div>
                    <p className="text-[9px] text-rose-400 font-medium tracking-[0.2em] uppercase mb-2">You are invited to</p>
                    <h3 className="text-2xl font-bold text-slate-900">Kasun</h3>
                    <p className="text-rose-400 text-base my-0.5">&amp;</p>
                    <h3 className="text-2xl font-bold text-slate-900 mb-4">Dilini</h3>
                    <div className="w-8 h-px bg-rose-200 mb-4" />
                    <p className="text-xs text-slate-400 mb-0.5">Saturday, June 15, 2026</p>
                    <p className="text-[10px] text-slate-300 mb-5">Cinnamon Grand, Colombo</p>
                    <div className="grid grid-cols-4 gap-1.5 mb-5 w-full">
                      {[{ v: "74", l: "Days" }, { v: "12", l: "Hrs" }, { v: "45", l: "Min" }, { v: "30", l: "Sec" }].map((t) => (
                        <div key={t.l} className="bg-rose-50 rounded-lg py-2">
                          <div className="text-base font-bold text-rose-600">{t.v}</div>
                          <div className="text-[8px] text-slate-400 uppercase tracking-wider">{t.l}</div>
                        </div>
                      ))}
                    </div>
                    <div className="btn-primary text-xs py-2 px-6">RSVP Now</div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Floating cards */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -left-14 top-20 bg-white rounded-xl shadow-lg shadow-slate-900/5 px-3.5 py-2.5 flex items-center gap-2.5 border border-slate-100"
            >
              <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
                <span className="text-emerald-600 text-sm">✓</span>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-900 leading-tight">RSVP Received</p>
                <p className="text-[10px] text-slate-400">Just now</p>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
              className="absolute -right-10 bottom-28 bg-white rounded-xl shadow-lg shadow-slate-900/5 px-3.5 py-2.5 flex items-center gap-2.5 border border-slate-100"
            >
              <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
                <span className="text-amber-600 text-[10px] font-bold">150+</span>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-900 leading-tight">Guests Confirmed</p>
                <p className="text-[10px] text-slate-400">Keep growing!</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <motion.div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10"
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <ChevronDown className="w-5 h-5 text-slate-300" />
      </motion.div>
    </section>
  );
}
