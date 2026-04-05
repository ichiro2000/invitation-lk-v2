"use client";

import { Palette, Crown, Star, Sparkles } from "lucide-react";

interface Template {
  name: string;
  plan: string;
  gradient: string;
}

const templates: Template[] = [
  // BASIC
  { name: "Elegant Rose", plan: "BASIC", gradient: "from-rose-200 to-pink-300" },
  { name: "Vintage Botanical", plan: "BASIC", gradient: "from-green-200 to-emerald-300" },
  { name: "Sinhala Mangalya", plan: "BASIC", gradient: "from-orange-200 to-amber-300" },
  // STANDARD
  { name: "Golden Glow", plan: "STANDARD", gradient: "from-amber-300 to-yellow-400" },
  { name: "Midnight Garden", plan: "STANDARD", gradient: "from-indigo-300 to-purple-400" },
  { name: "Beach Paradise", plan: "STANDARD", gradient: "from-cyan-300 to-blue-400" },
  // PREMIUM
  { name: "Royal Luxury", plan: "PREMIUM", gradient: "from-yellow-400 to-amber-500" },
  { name: "Minimalist White", plan: "PREMIUM", gradient: "from-gray-100 to-slate-200" },
  { name: "Celestial Night", plan: "PREMIUM", gradient: "from-slate-700 to-indigo-900" },
];

const planBadge: Record<string, { class: string; icon: React.ReactNode }> = {
  BASIC: {
    class: "bg-blue-100 text-blue-700",
    icon: <Star className="w-3 h-3" />,
  },
  STANDARD: {
    class: "bg-amber-100 text-amber-700",
    icon: <Sparkles className="w-3 h-3" />,
  },
  PREMIUM: {
    class: "bg-rose-100 text-rose-700",
    icon: <Crown className="w-3 h-3" />,
  },
};

export default function AdminTemplatesPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Templates</h1>
        <p className="text-gray-400 mt-1">Browse available invitation templates by plan tier.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {templates.map((template) => {
          const badge = planBadge[template.plan] || {
            class: "bg-gray-100 text-gray-600",
            icon: null,
          };
          return (
            <div
              key={template.name}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className={`h-40 bg-gradient-to-br ${template.gradient} flex items-center justify-center`}>
                <Palette className="w-10 h-10 text-white/60" />
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-gray-900 text-sm">{template.name}</h3>
                <div className="mt-2">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${badge.class}`}>
                    {badge.icon}
                    {template.plan}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
