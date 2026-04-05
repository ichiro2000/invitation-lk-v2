"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Users, CreditCard, FileText, Palette, ArrowRight, Loader2 } from "lucide-react";

const quickLinks = [
  { href: "/admin/bank-transfers", label: "Bank Transfers", desc: "Review pending payment receipts", icon: CreditCard, color: "bg-rose-50 text-rose-600" },
  { href: "/admin/orders", label: "Orders", desc: "View all orders & payments", icon: FileText, color: "bg-amber-50 text-amber-600" },
  { href: "/admin/users", label: "Users", desc: "Manage registered users", icon: Users, color: "bg-blue-50 text-blue-600" },
  { href: "/admin/templates", label: "Templates", desc: "Manage invitation templates", icon: Palette, color: "bg-purple-50 text-purple-600" },
];

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
    </div>
  );
}
