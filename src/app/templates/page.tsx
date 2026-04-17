"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Heart, Sparkles, Moon, Camera, Star, ArrowRight, Crown, Gem, Zap, Eye } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const templates = [
  { slug: "royal-elegance", name: "Royal Elegance", category: "Traditional", plan: "STANDARD", couple: "Nadeesha & Tharaka", date: "June 15, 2026", venue: "Cinnamon Grand, Colombo", desc: "Traditional Sri Lankan design with deep burgundy and gold. Floating golden particles and ornate borders.", bg: "from-[#5c2828] via-[#7a3535] to-[#4a1e1e]", text: "text-[#f5e6d3]", accent: "text-[#c9a96e]", icon: <Heart className="w-8 h-8 text-[#c9a96e]" /> },
  { slug: "modern-bloom", name: "Modern Bloom", category: "Modern", plan: "BASIC", couple: "Sachini & Kavinda", date: "August 22, 2026", venue: "Hikkaduwa Beach", desc: "Modern floral design with soft pink and blush tones. Floating petals and watercolor effects.", bg: "from-pink-200 via-rose-100 to-pink-100", text: "text-gray-800", accent: "text-pink-400", icon: <Camera className="w-8 h-8 text-pink-400" /> },
  { slug: "golden-lotus", name: "Golden Lotus", category: "Cultural", plan: "PREMIUM", couple: "Priya & Aravind", date: "October 10, 2026", venue: "Nallur Kovil, Jaffna", desc: "Rich gold and maroon with rotating mandala patterns. Floating embers and sacred fire glow.", bg: "from-[#1a0a0a] via-[#2a1515] to-[#1a0a0a]", text: "text-[#f5e6d3]", accent: "text-[#d4a853]", icon: <Sparkles className="w-8 h-8 text-[#d4a853]" /> },
  { slug: "minimal-grace", name: "Minimal Grace", category: "Elegant", plan: "BASIC", couple: "Amaya & Ruwan", date: "September 12, 2026", venue: "Trinity Chapel, Kandy", desc: "Ultra-minimal black and white design. Dramatic text reveal with clean typography.", bg: "from-white via-gray-50 to-white", text: "text-gray-900", accent: "text-gray-400", icon: <Heart className="w-8 h-8 text-gray-300" /> },
  { slug: "tropical-paradise", name: "Tropical Paradise", category: "Beach", plan: "STANDARD", couple: "Ishara & Dinesh", date: "March 28, 2026", venue: "Mirissa Beach", desc: "Vibrant teal and coral with animated ocean waves, floating bubbles, and swaying palm trees.", bg: "from-teal-400 via-teal-500 to-teal-600", text: "text-white", accent: "text-orange-300", icon: <Star className="w-8 h-8 text-orange-300" /> },
  { slug: "eternal-night", name: "Eternal Night", category: "Dark & Moody", plan: "PREMIUM", couple: "Chamari & Nuwan", date: "December 31, 2026", venue: "Vivanta, Bentota", desc: "Dark celestial theme with twinkling stars, shooting stars, and constellation animations.", bg: "from-[#0a0e1a] via-[#1a2744] to-[#0a0e1a]", text: "text-white", accent: "text-[#c4a35a]", icon: <Moon className="w-8 h-8 text-[#c4a35a]" /> },
  { slug: "sinhala-mangalya", name: "Sinhala Mangalya", category: "Traditional", plan: "STANDARD", couple: "දිනුෂා & කනේෂ්ක", date: "August 18, 2026", venue: "Hotel Siharanam, Anuradhapura", desc: "Traditional Sinhala wedding with intricate pink mandala patterns, Sinhala poetry, and cultural elements.", bg: "from-pink-100 via-white to-pink-50", text: "text-pink-600", accent: "text-pink-400", icon: <Heart className="w-8 h-8 text-pink-500 fill-pink-500" /> },
  { slug: "vintage-botanical", name: "Vintage Botanical", category: "Elegant", plan: "STANDARD", couple: "නයෝමි & කසුන්", date: "December 21, 2026", venue: "Deshani Hall, Ratnapura", desc: "Elegant botanical design with floating green leaves, watercolor elements, and Sinhala text.", bg: "from-green-50 via-[#fefdf9] to-emerald-50", text: "text-green-800", accent: "text-green-500", icon: <Sparkles className="w-8 h-8 text-green-500" /> },
  { slug: "rose-garden", name: "Rose Garden", category: "Modern", plan: "BASIC", couple: "Susantha & Nadee", date: "November 5, 2026", venue: "Singharupagama, Bentota", desc: "Romantic homecoming invitation with red roses, interactive mini calendar, and cursive typography.", bg: "from-rose-100 via-[#fff5f5] to-red-50", text: "text-rose-700", accent: "text-rose-500", icon: <Heart className="w-8 h-8 text-rose-500 fill-rose-500" /> },
  { slug: "wings-of-honour", name: "Wings of Honour", category: "Traditional", plan: "PREMIUM", couple: "Sashini & Wing Cmdr. Ravindu", date: "November 14, 2026", venue: "SLAF Officers' Mess, Ratmalana", desc: "Sri Lanka Air Force military wedding theme with aviation wings, orbiting plane, mission briefing overlay, and ATC radio chatter.", bg: "from-[#0f2744] via-[#1e3a5f] to-[#0f2744]", text: "text-white", accent: "text-[#c9a268]", icon: <Crown className="w-8 h-8 text-[#c9a268]" /> },
];

const planInfo: Record<string, { label: string; price: string; icon: React.ElementType; color: string; badge: string }> = {
  BASIC: { label: "Basic", price: "Rs. 2,500", icon: Zap, color: "text-gray-600", badge: "bg-gray-100 text-gray-600" },
  STANDARD: { label: "Standard", price: "Rs. 5,000", icon: Crown, color: "text-rose-600", badge: "bg-rose-100 text-rose-600" },
  PREMIUM: { label: "Premium", price: "Rs. 10,000", icon: Gem, color: "text-amber-600", badge: "bg-amber-100 text-amber-600" },
};


export default function TemplatesPage() {
  const [filterPlan, setFilterPlan] = useState("ALL");
  const [filterCategory, setFilterCategory] = useState("ALL");

  const categories = ["ALL", ...Array.from(new Set(templates.map((t) => t.category)))];
  const filtered = templates.filter((t) => {
    if (filterPlan !== "ALL" && t.plan !== filterPlan) return false;
    if (filterCategory !== "ALL" && t.category !== filterCategory) return false;
    return true;
  });

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white pt-20">
        {/* Hero */}
        <section className="relative py-20 bg-gradient-to-b from-rose-50/50 to-white overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-rose-100/20 rounded-full blur-3xl" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="inline-flex items-center gap-2 bg-rose-100 text-rose-600 px-5 py-1.5 rounded-full text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" /> {templates.length} Stunning Designs
            </motion.span>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-5">Wedding Invitation Templates</motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-gray-500 max-w-2xl mx-auto text-lg mb-10">Choose from our handcrafted collection. Start free — preview before you pay.</motion.p>

            {/* Category Filters */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              {categories.map((cat) => (
                <button key={cat} onClick={() => setFilterCategory(cat)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${filterCategory === cat ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-400 hover:text-gray-600 hover:bg-gray-100"}`}>
                  {cat === "ALL" ? "All Styles" : cat}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Template Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <Sparkles className="w-10 h-10 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No templates match your filters</p>
              <button onClick={() => { setFilterPlan("ALL"); setFilterCategory("ALL"); }} className="mt-4 text-rose-600 text-sm hover:underline">Clear filters</button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map((t, i) => {
                const plan = planInfo[t.plan];
                const PlanIcon = plan.icon;
                return (
                  <motion.div key={t.slug} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="group bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-gray-100/50 transition-all">
                    <div className={`relative h-64 bg-gradient-to-br ${t.bg} flex flex-col items-center justify-center text-center p-6 overflow-hidden`}>
                      <div className="mb-3 opacity-60">{t.icon}</div>
                      <p className={`text-[10px] uppercase tracking-[0.3em] ${t.accent} mb-2 opacity-70`}>You are invited to</p>
                      <p className={`text-2xl font-light ${t.text} mb-0.5`}>{t.couple.split(" & ")[0]}</p>
                      <p className={`${t.accent} text-sm`}>&amp;</p>
                      <p className={`text-2xl font-light ${t.text}`}>{t.couple.split(" & ")[1]}</p>

                      <div className="absolute top-3 right-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-white/90 backdrop-blur-sm ${plan.color}`}>
                          <PlanIcon className="w-3 h-3" /> {plan.label}
                        </span>
                      </div>

                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <span className="bg-white text-gray-900 px-5 py-2 rounded-full text-sm font-medium shadow-xl flex items-center gap-2">
                          <Eye className="w-4 h-4" /> Preview
                        </span>
                      </div>
                    </div>

                    <div className="p-5">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="font-bold text-gray-900">{t.name}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${plan.badge}`}>{plan.price}</span>
                      </div>
                      <p className="text-xs text-gray-400 mb-3">{t.category} &middot; {t.date}</p>
                      <p className="text-sm text-gray-500 mb-4 line-clamp-2">{t.desc}</p>

                      <div className="flex gap-2">
                        <Link href={`/samples/${t.slug}`} className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors">
                          <Eye className="w-3.5 h-3.5" /> Preview
                        </Link>
                        <Link href="/onboard" className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-rose-600 text-white rounded-xl text-sm font-medium hover:bg-rose-700 transition-colors shadow-lg shadow-rose-600/20">
                          Get Started <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-r from-rose-600 to-pink-500 py-16">
          <div className="max-w-4xl mx-auto px-4 text-center text-white">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Can&apos;t decide? Start free!</h2>
            <p className="text-rose-100 mb-8 text-lg">Create your invitation and preview any template. No payment needed until you publish.</p>
            <Link href="/onboard" className="inline-flex items-center gap-2 bg-white text-rose-600 px-8 py-3.5 rounded-full font-semibold hover:bg-rose-50 transition-colors shadow-xl">
              Get Started Free <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
