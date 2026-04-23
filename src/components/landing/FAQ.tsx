"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";

const faqs = [
  { q: "Is it really free to start?", a: "Yes! You can create your wedding invitation, choose a template, and preview it completely free. You only pay when you're ready to publish and share it with your guests." },
  { q: "How does the invitation link work?", a: "Each guest gets a unique link (e.g., invitation.lk/i/kasun-dilini). With Standard and Premium plans, each guest sees their own name on the invitation for a personalized touch." },
  { q: "Can I add all my wedding events?", a: "Yes! You can add multiple events like Poruwa Ceremony, Church Wedding, Reception, Homecoming, and more. Guests see the full schedule on your invitation page." },
  { q: "Do you support Sinhala and Tamil?", a: "Absolutely! Your invitation can be in Sinhala, Tamil, English, or any combination. We fully support all three languages." },
  { q: "How long does my invitation stay active?", a: "Your wedding invitation stays active for 6 months from the wedding date. Extensions are available if needed." },
  { q: "What's included in the free preview?", a: "You can create your full invitation, add details, choose a template, and see exactly how it looks. The preview shows a watermark. Once you pay, the watermark is removed and you get a shareable link." },
  { q: "Can I change my template later?", a: "Yes, you can switch between templates available in your plan at any time before publishing." },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-28 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.span initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="inline-block bg-blue-100 text-blue-700 px-5 py-1.5 rounded-full text-sm font-medium mb-6">FAQ</motion.span>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-4xl sm:text-5xl font-bold text-gray-900">Frequently Asked Questions</motion.h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                className={`rounded-2xl border overflow-hidden transition-all duration-300 ${isOpen ? "border-rose-200 bg-rose-50/30 shadow-lg shadow-rose-100/30" : "border-gray-100 bg-white hover:border-gray-200"}`}
              >
                <button onClick={() => setOpenIndex(isOpen ? null : i)} className="w-full flex items-center justify-between p-6 text-left">
                  <span className={`font-medium pr-4 ${isOpen ? "text-rose-700" : "text-gray-900"}`}>{faq.q}</span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isOpen ? "bg-rose-600" : "bg-gray-100"}`}>
                    {isOpen ? <Minus className="w-4 h-4 text-white" /> : <Plus className="w-4 h-4 text-gray-400" />}
                  </div>
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}>
                      <p className="px-6 pb-6 text-gray-500 text-sm leading-relaxed">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
