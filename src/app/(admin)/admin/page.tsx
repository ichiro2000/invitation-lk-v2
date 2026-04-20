"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Users, CreditCard, FileText, Palette, ArrowRight, Loader2, BarChart3, ExternalLink } from "lucide-react";

const quickLinks = [
  { href: "/admin/bank-transfers", label: "Bank Transfers", desc: "Review pending payment receipts", icon: CreditCard, color: "bg-rose-50 text-rose-600" },
  { href: "/admin/orders", label: "Orders", desc: "View all orders & payments", icon: FileText, color: "bg-amber-50 text-amber-600" },
  { href: "/admin/users", label: "Users", desc: "Manage registered users", icon: Users, color: "bg-blue-50 text-blue-600" },
  { href: "/admin/templates", label: "Templates", desc: "Manage invitation templates", icon: Palette, color: "bg-purple-50 text-purple-600" },
];

const GA_REALTIME_URL = "https://analytics.google.com/analytics/web/#/p/reports/realtime";
const GA_HOME_URL = "https://analytics.google.com/";

export default function AdminOverviewPage() {
  const [stats, setStats] = useState({ users: 0, orders: 0, pendingTransfers: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Stats can be fetched from a dedicated admin stats API later
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-rose-600 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-400 mt-1">Manage your platform from here.</p>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {quickLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md hover:border-rose-100 transition-all group"
          >
            <div className="flex items-start justify-between">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${link.color}`}>
                <link.icon className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-rose-600 transition-colors" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mt-4">{link.label}</h3>
            <p className="text-sm text-gray-400 mt-1">{link.desc}</p>
          </Link>
        ))}
      </div>

      {/* Google Analytics */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Google Analytics</h2>
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-emerald-50 text-emerald-600 flex-shrink-0">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-gray-900">Traffic &amp; engagement</h3>
              <p className="text-sm text-gray-400 mt-1">
                Live stats, sessions, top pages, and conversions live in Google Analytics
                <span className="font-mono text-xs text-gray-500"> (G-4S358FFMM7)</span>.
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                <a
                  href={GA_REALTIME_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium transition-colors"
                >
                  Open Realtime <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <a
                  href={GA_HOME_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 hover:border-rose-200 hover:text-rose-600 text-gray-600 text-sm font-medium transition-colors"
                >
                  All reports <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
