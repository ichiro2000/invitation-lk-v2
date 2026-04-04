"use client";

import { motion } from "framer-motion";
import { UserPlus, Palette, Share2, PartyPopper } from "lucide-react";

const steps = [
  { icon: UserPlus, step: "01", title: "Create Your Account", desc: "Sign up with your names and wedding date. It's free to start — no payment needed.", color: "from-rose-500 to-pink-500", light: "bg-rose-50" },
  { icon: Palette, step: "02", title: "Choose a Template", desc: "Pick from our stunning collection of wedding invitation designs.", color: "from-violet-500 to-purple-500", light: "bg-violet-50" },
  { icon: Share2, step: "03", title: "Customize & Share", desc: "Add your details, guest list, and share via WhatsApp or unique links.", color: "from-amber-500 to-orange-500", light: "bg-amber-50" },
  { icon: PartyPopper, step: "04", title: "Track RSVPs", desc: "See who's coming, manage your guest list, and enjoy your day!", color: "from-teal-500 to-emerald-500", light: "bg-teal-50" },
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
              {i < 3 && <div className="hidden lg:block absolute top-12 left-[60%] w-[80%] h-px overflow-hidden"><motion.div className="h-full bg-gradient-to-r from-rose-300 to-rose-200" initial={{ width: 0 }} whileInView={{ width: "100%" }} viewport={{ once: true }} transition={{ duration: 1, delay: 0.5 + i * 0.2 }} /></div>}
              <motion.div whileHover={{ y: -8 }}>
                <div className={`relative inline-flex items-center justify-center w-24 h-24 ${s.light} rounded-3xl mb-6 group-hover:shadow-xl transition-shadow`}>
                  <div className={`w-16 h-16 bg-gradient-to-br ${s.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all`}>
                    <s.icon className="w-7 h-7 text-white" />
                  </div>
                  <span className={`absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br ${s.color} text-white text-xs font-bold rounded-full flex items-center justify-center shadow-md`}>{s.step}</span>
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
