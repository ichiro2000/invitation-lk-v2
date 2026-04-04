"use client";

import { motion } from "framer-motion";
import { ArrowRight, Heart } from "lucide-react";
import Link from "next/link";

export default function CTA() {
  return (
    <section className="py-20 bg-gradient-to-r from-rose-600 to-pink-500 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white"
            style={{ width: 4 + (i % 4) * 3, height: 4 + (i % 4) * 3, left: `${(i * 47) % 100}%`, top: `${(i * 31) % 100}%` }}
            animate={{ y: [0, -20, 0], opacity: [0.1, 0.3, 0.1] }}
            transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.3 }}
          />
        ))}
      </div>

      <div className="max-w-4xl mx-auto px-4 text-center text-white relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <Heart className="w-10 h-10 text-white/50 fill-white/50 mx-auto mb-6" />
          <h2 className="text-3xl sm:text-5xl font-bold mb-4">Start Creating Your Invitation Today</h2>
          <p className="text-rose-100 mb-10 text-lg max-w-xl mx-auto">It&apos;s free to create and preview. No payment needed until you&apos;re ready to publish.</p>
          <Link href="/onboard" className="inline-flex items-center gap-2 bg-white text-rose-600 px-10 py-4 rounded-full font-semibold text-lg hover:bg-rose-50 transition-colors shadow-xl">
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
