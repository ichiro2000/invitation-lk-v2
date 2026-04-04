"use client";

import { motion } from "framer-motion";
import { UserPlus, Palette, Share2, PartyPopper } from "lucide-react";

const steps = [
  { icon: UserPlus, step: "01", title: "Create Your Account", desc: "Sign up with your names and wedding date. It's free to start — no payment needed.", bg: "bg-rose-50", iconColor: "text-rose-500", badgeBg: "bg-rose-500" },
  { icon: Palette, step: "02", title: "Choose a Template", desc: "Pick from our stunning collection of wedding invitation designs.", bg: "bg-violet-50", iconColor: "text-violet-500", badgeBg: "bg-violet-500" },
  { icon: Share2, step: "03", title: "Customize & Share", desc: "Add your details, guest list, and share via WhatsApp or unique links.", bg: "bg-amber-50", iconColor: "text-amber-500", badgeBg: "bg-amber-500" },
  { icon: PartyPopper, step: "04", title: "Track RSVPs", desc: "See who's coming, manage your guest list, and enjoy your day!", bg: "bg-teal-50", iconColor: "text-teal-500", badgeBg: "bg-teal-500" },
];

export default function HowItWorks() {
  return (
    <section className="py-28 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20">
          <motion.span initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="inline-block bg-amber-100 text-amber-700 px-5 py-1.5 rounded-full text-sm font-medium mb-6">How It Works</motion.span>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-4xl sm:text-5xl font-bold text-gray-900">Ready in 4 Simple Steps</motion.h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }} className="relative text-center group">
              {i < 3 && <div className="hidden lg:block absolute top-10 left-[60%] w-[80%] h-px overflow-hidden"><motion.div className="h-full bg-gray-200" initial={{ width: 0 }} whileInView={{ width: "100%" }} viewport={{ once: true }} transition={{ duration: 1, delay: 0.5 + i * 0.2 }} /></div>}
              <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
                <div className="relative inline-flex items-center justify-center mb-6">
                  <div className={`w-14 h-14 ${s.bg} rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform`}>
                    <s.icon className={`w-6 h-6 ${s.iconColor}`} />
                  </div>
                  <span className={`absolute -top-2 -right-2 w-6 h-6 ${s.badgeBg} text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm`}>{s.step}</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{s.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed max-w-xs mx-auto">{s.desc}</p>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
