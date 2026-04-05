"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Heart, Sparkles, Moon, Camera, Star, Check, Eye, ArrowRight } from "lucide-react";

const templates = [
  { slug: "royal-elegance", name: "Royal Elegance", plan: "STANDARD", bg: "from-[#5c2828] to-[#4a1e1e]", icon: <Heart className="w-6 h-6 text-[#c9a96e]" />, couple: "Nadeesha & Tharaka" },
  { slug: "modern-bloom", name: "Modern Bloom", plan: "BASIC", bg: "from-pink-200 to-pink-100", icon: <Camera className="w-6 h-6 text-pink-400" />, couple: "Sachini & Kavinda" },
  { slug: "golden-lotus", name: "Golden Lotus", plan: "PREMIUM", bg: "from-[#1a0a0a] to-[#2a1515]", icon: <Sparkles className="w-6 h-6 text-[#d4a853]" />, couple: "Priya & Aravind" },
  { slug: "minimal-grace", name: "Minimal Grace", plan: "BASIC", bg: "from-white to-gray-50", icon: <Heart className="w-6 h-6 text-gray-300" />, couple: "Amaya & Ruwan" },
  { slug: "tropical-paradise", name: "Tropical Paradise", plan: "STANDARD", bg: "from-teal-400 to-teal-600", icon: <Star className="w-6 h-6 text-orange-300" />, couple: "Ishara & Dinesh" },
  { slug: "eternal-night", name: "Eternal Night", plan: "PREMIUM", bg: "from-[#0a0e1a] to-[#1a2744]", icon: <Moon className="w-6 h-6 text-[#c4a35a]" />, couple: "Chamari & Nuwan" },
  { slug: "sinhala-mangalya", name: "Sinhala Mangalya", plan: "STANDARD", bg: "from-pink-100 to-pink-50", icon: <Heart className="w-6 h-6 text-pink-500 fill-pink-500" />, couple: "දිනුෂා & කනේෂ්ක" },
  { slug: "vintage-botanical", name: "Vintage Botanical", plan: "STANDARD", bg: "from-green-50 to-emerald-50", icon: <Sparkles className="w-6 h-6 text-green-500" />, couple: "නයෝමි & කසුන්" },
  { slug: "rose-garden", name: "Rose Garden", plan: "BASIC", bg: "from-rose-100 to-red-50", icon: <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />, couple: "Susantha & Nadee" },
];

const planRank: Record<string, number> = { FREE: 0, BASIC: 1, STANDARD: 2, PREMIUM: 3 };

const planBadge: Record<string, string> = {
  BASIC: "bg-gray-100 text-gray-600",
  STANDARD: "bg-rose-100 text-rose-600",
  PREMIUM: "bg-amber-100 text-amber-600",
};

export default function TemplatesPage() {
  const { data: session } = useSession();
  const userPlan = session?.user?.plan || "FREE";
  const [selected, setSelected] = useState<string | null>(null);

  const needsUpgrade = (templatePlan: string) => planRank[userPlan] < planRank[templatePlan];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Choose Your Template</h1>
        <p className="text-gray-400 mt-1">Select a design for your wedding invitation. You can preview any template — upgrade when you&apos;re ready to publish.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((t) => {
          const isSelected = selected === t.slug;
          const upgrade = needsUpgrade(t.plan);

          return (
            <button key={t.slug} onClick={() => setSelected(t.slug)} className={`text-left rounded-2xl border overflow-hidden transition-all ${isSelected ? "border-rose-500 ring-2 ring-rose-500 shadow-lg" : "border-gray-100 hover:border-rose-200 hover:shadow-md"}`}>
              <div className={`h-44 bg-gradient-to-br ${t.bg} flex flex-col items-center justify-center text-center p-4 relative group`}>
                <div className="mb-2 opacity-60">{t.icon}</div>
                <p className="text-white text-lg font-light">{t.couple}</p>

                {isSelected && (
                  <div className="absolute top-3 right-3 w-7 h-7 bg-rose-600 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
                <span className={`absolute top-3 left-3 text-[10px] px-2 py-0.5 rounded-full font-semibold ${planBadge[t.plan] || "bg-gray-100 text-gray-600"}`}>{t.plan}</span>

                {/* Hover preview overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <span className="bg-white text-gray-900 px-4 py-1.5 rounded-full text-xs font-medium shadow-lg flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5" /> Select
                  </span>
                </div>
              </div>
              <div className="p-4 bg-white flex items-center justify-between">
                <p className="font-semibold text-gray-900">{t.name}</p>
                {upgrade && (
                  <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full font-medium">
                    Requires {t.plan}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {selected && (
        <div className="mt-8 bg-green-50 border border-green-200 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="font-semibold text-green-800">Template selected: {templates.find(t => t.slug === selected)?.name}</p>
            {needsUpgrade(templates.find(t => t.slug === selected)?.plan || "BASIC") ? (
              <p className="text-sm text-amber-600">You&apos;ll need to upgrade to the {templates.find(t => t.slug === selected)?.plan} plan to publish with this template.</p>
            ) : (
              <p className="text-sm text-green-600">Your invitation will use this design.</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Link href={`/samples/${selected}`} className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
              <Eye className="w-4 h-4" /> Preview
            </Link>
            {needsUpgrade(templates.find(t => t.slug === selected)?.plan || "BASIC") ? (
              <Link href="/dashboard/checkout" className="bg-rose-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-rose-700 flex items-center gap-2 shadow-lg shadow-rose-600/20">
                Upgrade <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <button className="bg-green-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-green-700">
                Save Selection
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
