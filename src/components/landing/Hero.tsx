"use client";

import { motion } from "framer-motion";
import { ArrowRight, Play, Sparkles, Star, Heart, ChevronDown } from "lucide-react";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Animated background */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: [
            "radial-gradient(ellipse at 20% 50%, rgba(254,205,211,0.4) 0%, transparent 50%), radial-gradient(ellipse at 80% 50%, rgba(253,230,138,0.2) 0%, transparent 50%), linear-gradient(to br, #fef2f2, #fff, #fffbeb)",
            "radial-gradient(ellipse at 60% 30%, rgba(254,205,211,0.3) 0%, transparent 50%), radial-gradient(ellipse at 30% 70%, rgba(253,230,138,0.25) 0%, transparent 50%), linear-gradient(to br, #fff1f2, #fff, #fefce8)",
            "radial-gradient(ellipse at 20% 50%, rgba(254,205,211,0.4) 0%, transparent 50%), radial-gradient(ellipse at 80% 50%, rgba(253,230,138,0.2) 0%, transparent 50%), linear-gradient(to br, #fef2f2, #fff, #fffbeb)",
          ],
        }}
        transition={{ duration: 10, repeat: Infinity }}
      />

      {/* Dot pattern */}
      <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: "radial-gradient(circle, #e11d48 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="text-center lg:text-left">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 bg-rose-100/80 text-rose-700 px-4 py-1.5 rounded-full text-sm font-medium mb-8 border border-rose-200/50">
              <Sparkles className="w-4 h-4" />
              Start Free — No Credit Card Needed
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.1] mb-6">
              <span className="text-shimmer">Create Your Dream Wedding Invitation</span>
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-lg text-gray-500 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Design beautiful digital wedding invitations in minutes. Share via WhatsApp, track RSVPs, and manage your guest list — all in one place.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <Link href="/onboard" className="group relative bg-rose-600 text-white px-8 py-4 rounded-full text-base font-semibold hover:bg-rose-700 transition-all shadow-xl shadow-rose-600/20 flex items-center gap-2">
                Get Started Free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/templates" className="group flex items-center gap-3 text-gray-700 font-medium hover:text-rose-600 transition-colors px-6 py-4">
                <div className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center group-hover:shadow-xl transition-all">
                  <Play className="w-4 h-4 text-rose-600 ml-0.5" />
                </div>
                View Templates
              </Link>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="mt-12 flex items-center gap-4 justify-center lg:justify-start">
              <div className="flex -space-x-2">
                {["bg-rose-400", "bg-amber-400", "bg-violet-400", "bg-teal-400"].map((bg, i) => (
                  <div key={i} className={`w-8 h-8 rounded-full border-2 border-white ${bg} flex items-center justify-center text-[10px] text-white font-bold shadow-sm`}>
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <span className="text-sm text-gray-400">Trusted by 500+ Sri Lankan couples</span>
            </motion.div>
          </div>

          {/* Phone mockup */}
          <motion.div initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1, delay: 0.3 }} className="relative hidden lg:block">
            <motion.div className="relative mx-auto w-[300px]" animate={{ rotateY: [0, 3, 0, -3, 0] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} style={{ transformStyle: "preserve-3d" }}>
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-[200px] h-[30px] bg-black/10 rounded-full blur-xl" />
              <div className="bg-gray-900 rounded-[3rem] p-3 shadow-2xl shadow-gray-900/30">
                <div className="bg-white rounded-[2.3rem] overflow-hidden">
                  <div className="h-[580px] bg-gradient-to-b from-rose-50 via-white to-rose-50/50 p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-rose-100/40 rounded-full blur-2xl" />
                    <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 3, repeat: Infinity }} className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mb-4">
                      <Heart className="w-8 h-8 text-rose-500 fill-rose-500" />
                    </motion.div>
                    <p className="text-[10px] text-rose-400 font-medium tracking-[0.3em] uppercase mb-3">You are invited to</p>
                    <h3 className="text-3xl font-bold text-gray-900 mb-0.5">Kasun</h3>
                    <p className="text-rose-400 text-xl">&amp;</p>
                    <h3 className="text-3xl font-bold text-gray-900 mb-5">Dilini</h3>
                    <div className="w-10 h-px bg-rose-200 mb-5" />
                    <p className="text-sm text-gray-400 mb-0.5">Saturday, June 15, 2026</p>
                    <p className="text-xs text-gray-300 mb-6">Cinnamon Grand, Colombo</p>
                    <div className="grid grid-cols-4 gap-2 mb-6 w-full px-2">
                      {[{ val: "74", label: "Days" }, { val: "12", label: "Hrs" }, { val: "45", label: "Min" }, { val: "30", label: "Sec" }].map((item) => (
                        <div key={item.label} className="bg-rose-50 rounded-xl p-2.5">
                          <div className="text-lg font-bold text-rose-600">{item.val}</div>
                          <div className="text-[9px] text-gray-400 uppercase tracking-wider">{item.label}</div>
                        </div>
                      ))}
                    </div>
                    <button className="bg-rose-600 text-white px-8 py-2.5 rounded-full text-sm font-semibold shadow-lg shadow-rose-600/20">RSVP Now</button>
                  </div>
                </div>
              </div>
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-28 h-7 bg-gray-900 rounded-b-2xl" />
            </motion.div>

            <motion.div animate={{ y: [0, -12, 0] }} transition={{ duration: 3, repeat: Infinity }} className="absolute -left-12 top-24 bg-white rounded-2xl shadow-xl p-4 flex items-center gap-3 border border-gray-100">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center"><span className="text-green-600 text-lg">&#10003;</span></div>
              <div><p className="text-sm font-semibold text-gray-900">RSVP Received</p><p className="text-xs text-gray-400">Just now</p></div>
            </motion.div>

            <motion.div animate={{ y: [0, 15, 0] }} transition={{ duration: 4, repeat: Infinity }} className="absolute -right-8 bottom-36 bg-white rounded-2xl shadow-xl p-4 flex items-center gap-3 border border-gray-100">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center"><span className="text-amber-600 text-sm font-bold">150+</span></div>
              <div><p className="text-sm font-semibold text-gray-900">Guests Confirmed</p><p className="text-xs text-gray-400">Keep growing!</p></div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2" animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}>
        <ChevronDown className="w-5 h-5 text-gray-300" />
      </motion.div>
    </section>
  );
}
