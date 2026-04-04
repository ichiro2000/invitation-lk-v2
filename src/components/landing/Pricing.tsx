"use client";

import { motion } from "framer-motion";
import { Check, X, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

const plans = [
  {
    name: "Basic",
    price: "2,500",
    desc: "Simple & elegant invitation",
    popular: false,
    features: [
      { text: "Single page invitation", included: true },
      { text: "Countdown timer", included: true },
      { text: "Invitation link (To You / Both / Family)", included: true },
      { text: "Mobile responsive", included: true },
      { text: "WhatsApp sharing", included: true },
      { text: "Google Maps location", included: false },
      { text: "Guest management", included: false },
      { text: "Add to calendar", included: false },
      { text: "Personalized guest links", included: false },
      { text: "Wedding planning tools", included: false },
      { text: "Template customization", included: false },
    ],
  },
  {
    name: "Standard",
    price: "5,000",
    desc: "Complete wedding website",
    popular: true,
    features: [
      { text: "Up to 2-page invitation", included: true },
      { text: "Countdown timer", included: true },
      { text: "All invitation link types", included: true },
      { text: "Personalized guest links (Target Invite)", included: true },
      { text: "Google Maps location", included: true },
      { text: "Guest management", included: true },
      { text: "Add to calendar", included: true },
      { text: "Task checklist", included: true },
      { text: "Budget management", included: true },
      { text: "Vendor list", included: true },
      { text: "Template customization", included: false },
    ],
  },
  {
    name: "Premium",
    price: "10,000",
    desc: "Fully custom experience",
    popular: false,
    features: [
      { text: "Up to 3-page custom invitation", included: true },
      { text: "Countdown timer", included: true },
      { text: "All invitation link types", included: true },
      { text: "Personalized guest links (Target Invite)", included: true },
      { text: "Google Maps location", included: true },
      { text: "Guest management", included: true },
      { text: "Add to calendar", included: true },
      { text: "Task checklist", included: true },
      { text: "Budget management", included: true },
      { text: "Vendor list", included: true },
      { text: "Fully custom design on request", included: true },
    ],
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-28 bg-gradient-to-b from-white via-rose-50/20 to-white relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-rose-100/20 rounded-full blur-3xl" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20">
          <motion.span initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="inline-block bg-green-100 text-green-700 px-5 py-1.5 rounded-full text-sm font-medium mb-6">Pricing</motion.span>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-4xl sm:text-5xl font-bold text-gray-900 mb-5">Simple, Transparent Pricing</motion.h2>
          <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-gray-500 max-w-2xl mx-auto text-lg">Start free. Preview your invitation before paying. No hidden fees.</motion.p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto items-start">
          {plans.map((plan, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }} whileHover={{ y: -8 }}
              className={`relative rounded-3xl overflow-hidden ${plan.popular ? "bg-gradient-to-b from-rose-600 via-rose-600 to-rose-700 text-white shadow-2xl shadow-rose-600/25 lg:scale-105 z-10" : "bg-white border border-gray-100 shadow-lg shadow-gray-100/50"}`}
            >
              {plan.popular && <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400" />}
              <div className="p-8">
                {plan.popular && (
                  <span className="inline-flex items-center gap-1.5 bg-amber-400 text-amber-900 px-3 py-1 rounded-full text-xs font-bold mb-4">
                    <Sparkles className="w-3 h-3" /> Most Popular
                  </span>
                )}
                <h3 className={`text-xl font-bold mb-2 ${plan.popular ? "text-white" : "text-gray-900"}`}>{plan.name}</h3>
                <p className={`text-sm mb-6 ${plan.popular ? "text-rose-100" : "text-gray-400"}`}>{plan.desc}</p>
                <div className="mb-8">
                  <span className={`text-sm ${plan.popular ? "text-rose-200" : "text-gray-300"}`}>Rs.</span>
                  <span className={`text-5xl font-bold tracking-tight ${plan.popular ? "text-white" : "text-gray-900"}`}>{plan.price}</span>
                  <span className={`text-sm ${plan.popular ? "text-rose-200" : "text-gray-300"}`}> one-time</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f, fi) => (
                    <li key={fi} className="flex items-start gap-3">
                      {f.included ? (
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${plan.popular ? "bg-white/20" : "bg-rose-100"}`}>
                          <Check className={`w-3 h-3 ${plan.popular ? "text-white" : "text-rose-600"}`} />
                        </div>
                      ) : (
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${plan.popular ? "bg-white/10" : "bg-gray-50"}`}>
                          <X className={`w-3 h-3 ${plan.popular ? "text-white/30" : "text-gray-300"}`} />
                        </div>
                      )}
                      <span className={`text-sm ${f.included ? (plan.popular ? "text-rose-50" : "text-gray-600") : (plan.popular ? "text-rose-200/50" : "text-gray-300")}`}>{f.text}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/onboard" className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-medium text-sm transition-all hover:-translate-y-0.5 ${plan.popular ? "bg-white text-rose-600 hover:bg-rose-50 shadow-lg" : "bg-gray-900 text-white hover:bg-gray-800 shadow-lg shadow-gray-900/10"}`}>
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        <p className="text-center text-sm text-gray-400 mt-10">Start free — create and preview your invitation without paying. Upgrade when you&apos;re ready to publish.</p>
      </div>
    </section>
  );
}
