"use client";

import { useSession } from "next-auth/react";
import { Heart, Users, Eye, Palette, ArrowRight, Calendar, MapPin, Crown } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { data: session } = useSession();
  const plan = session?.user?.plan || "FREE";
  const isPaid = plan !== "FREE";

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome, {session?.user?.name}!</h1>
        <p className="text-gray-400 mt-1">Manage your wedding invitation from here.</p>
      </div>

      {/* Plan Status */}
      <div className={`rounded-2xl p-6 mb-8 ${isPaid ? "bg-gradient-to-r from-rose-600 to-pink-500 text-white" : "bg-gradient-to-r from-gray-100 to-gray-50 border border-gray-200"}`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Crown className={`w-5 h-5 ${isPaid ? "text-amber-300" : "text-gray-400"}`} />
              <p className={`font-semibold ${isPaid ? "text-white" : "text-gray-700"}`}>{plan === "FREE" ? "Free Plan" : `${plan} Plan`}</p>
            </div>
            <p className={`text-sm ${isPaid ? "text-rose-100" : "text-gray-400"}`}>
              {isPaid ? "Your invitation is ready to publish!" : "Upgrade to publish your invitation and unlock all features."}
            </p>
          </div>
          {!isPaid && (
            <Link href="/dashboard/checkout" className="bg-rose-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-rose-700 transition-colors shadow-lg shadow-rose-600/20 flex items-center gap-2">
              Upgrade <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Guests", value: "0", icon: Users, color: "bg-violet-100 text-violet-600" },
          { label: "Page Views", value: "0", icon: Eye, color: "bg-blue-100 text-blue-600" },
          { label: "RSVPs", value: "0", icon: Heart, color: "bg-green-100 text-green-600" },
          { label: "Template", value: "None", icon: Palette, color: "bg-rose-100 text-rose-600" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-400">{stat.label}</p>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { href: "/dashboard/templates", label: "Choose Template", desc: "Pick a design for your invitation", icon: Palette, color: "text-rose-500" },
          { href: "/dashboard/guests", label: "Add Guests", desc: "Build your guest list", icon: Users, color: "text-violet-500" },
          { href: "/dashboard/tools/tasks", label: "Plan Wedding", desc: "Task checklist & budget", icon: Calendar, color: "text-teal-500" },
        ].map((action) => (
          <Link key={action.href} href={action.href} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-rose-200 transition-all group">
            <action.icon className={`w-8 h-8 ${action.color} mb-3 group-hover:scale-110 transition-transform`} />
            <p className="font-semibold text-gray-900">{action.label}</p>
            <p className="text-sm text-gray-400">{action.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
