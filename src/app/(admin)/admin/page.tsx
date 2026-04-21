"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users, FileText, Palette, Loader2, BarChart3, ExternalLink,
  Heart, CreditCard, CheckCircle2, Clock, XCircle, CalendarDays,
  TrendingUp, AlertTriangle, Globe, UserPlus,
} from "lucide-react";

type Totals = {
  users: number; couples: number; invitations: number;
  publishedSites: number; paidSites: number; guests: number;
};
type Rsvp = { PENDING: number; ACCEPTED: number; DECLINED: number; MAYBE: number };
type PlanBreakdown = { FREE: number; BASIC: number; STANDARD: number; PREMIUM: number };
type Payments = {
  pendingCount: number; pendingAmount: string; failedCount: number;
  completedRevenue: string; pendingBankTransfers: number; rejectedBankTransfers: number;
};
type UpcomingWedding = {
  id: string; slug: string; groomName: string; brideName: string;
  weddingDate: string; venue: string; isPublished: boolean;
};
type RecentOrder = {
  id: string; plan: string; amount: string; currency: string;
  paymentMethod: string; paymentStatus: string; createdAt: string;
  user: { email: string; yourName: string };
};
type RecentSignup = {
  id: string; email: string; yourName: string; partnerName: string;
  plan: string; createdAt: string;
};
type DashboardData = {
  totals: Totals; rsvp: Rsvp; planBreakdown: PlanBreakdown;
  payments: Payments; upcomingWeddings: UpcomingWedding[];
  recentOrders: RecentOrder[]; recentSignups: RecentSignup[];
};

const planBadge: Record<string, string> = {
  FREE: "bg-gray-100 text-gray-600",
  BASIC: "bg-blue-100 text-blue-700",
  STANDARD: "bg-amber-100 text-amber-700",
  PREMIUM: "bg-rose-100 text-rose-700",
};

const paymentStatusBadge: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  FAILED: "bg-red-100 text-red-700",
  REFUNDED: "bg-gray-100 text-gray-600",
};

const GA_REALTIME_URL = "https://analytics.google.com/analytics/web/#/p/reports/realtime";
const GA_HOME_URL = "https://analytics.google.com/";

function formatMoney(amount: string, currency = "LKR") {
  const num = parseFloat(amount || "0");
  return `${currency} ${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(dateStr: string, withTime = false) {
  const d = new Date(dateStr);
  if (withTime) {
    return d.toLocaleString(undefined, {
      month: "short", day: "numeric", year: "numeric",
      hour: "numeric", minute: "2-digit",
    });
  }
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export default function AdminOverviewPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/admin/dashboard");
        if (!res.ok) throw new Error("Failed to load");
        const json = await res.json();
        setData(json);
      } catch {
        setError("Failed to load dashboard stats.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-rose-600 animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-sm text-red-700">
        {error || "No data available."}
      </div>
    );
  }

  const { totals, rsvp, planBreakdown, payments, upcomingWeddings, recentOrders, recentSignups } = data;
  const planTotal = planBreakdown.FREE + planBreakdown.BASIC + planBreakdown.STANDARD + planBreakdown.PREMIUM;

  const primaryCards = [
    { label: "Total users", value: totals.users, icon: Users, color: "bg-blue-50 text-blue-600" },
    { label: "Couples", value: totals.couples, icon: Heart, color: "bg-rose-50 text-rose-600" },
    { label: "Published sites", value: totals.publishedSites, icon: Globe, color: "bg-emerald-50 text-emerald-600" },
    { label: "Invitations", value: totals.invitations, icon: FileText, color: "bg-violet-50 text-violet-600" },
    { label: "Total guests", value: totals.guests, icon: UserPlus, color: "bg-amber-50 text-amber-600" },
    { label: "Revenue (completed)", value: formatMoney(payments.completedRevenue), icon: TrendingUp, color: "bg-teal-50 text-teal-600" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-400 mt-1">Platform at a glance — {formatDate(new Date().toISOString())}.</p>
      </div>

      {/* Primary metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {primaryCards.map((c) => (
          <div key={c.label} className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${c.color} mb-3`}>
              <c.icon className="w-4 h-4" />
            </div>
            <p className="text-xs text-gray-400 uppercase tracking-wider">{c.label}</p>
            <p className="text-lg font-bold text-gray-900 mt-1">{c.value}</p>
          </div>
        ))}
      </div>

      {/* Payments row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Link href="/admin/orders" className="bg-amber-50 border border-amber-100 rounded-2xl p-5 hover:shadow-sm transition-all">
          <div className="flex items-center gap-2 text-amber-700 mb-2">
            <Clock className="w-4 h-4" />
            <p className="text-xs font-semibold uppercase tracking-wider">Pending payments</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{payments.pendingCount}</p>
          <p className="text-xs text-amber-700 mt-1">{formatMoney(payments.pendingAmount)} owed</p>
        </Link>
        <Link href="/admin/orders" className="bg-yellow-50 border border-yellow-100 rounded-2xl p-5 hover:shadow-sm transition-all">
          <div className="flex items-center gap-2 text-yellow-700 mb-2">
            <CreditCard className="w-4 h-4" />
            <p className="text-xs font-semibold uppercase tracking-wider">Bank transfers to review</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{payments.pendingBankTransfers}</p>
          <p className="text-xs text-yellow-700 mt-1">receipts awaiting approval</p>
        </Link>
        <div className="bg-red-50 border border-red-100 rounded-2xl p-5">
          <div className="flex items-center gap-2 text-red-700 mb-2">
            <XCircle className="w-4 h-4" />
            <p className="text-xs font-semibold uppercase tracking-wider">Failed orders</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{payments.failedCount}</p>
          <p className="text-xs text-red-700 mt-1">payment attempts failed</p>
        </div>
        <div className="bg-rose-50 border border-rose-100 rounded-2xl p-5">
          <div className="flex items-center gap-2 text-rose-700 mb-2">
            <AlertTriangle className="w-4 h-4" />
            <p className="text-xs font-semibold uppercase tracking-wider">Rejected transfers</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{payments.rejectedBankTransfers}</p>
          <p className="text-xs text-rose-700 mt-1">receipts rejected</p>
        </div>
      </div>

      {/* Plan breakdown + RSVP */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Subscription plan breakdown</h2>
          <div className="space-y-3">
            {(["FREE", "BASIC", "STANDARD", "PREMIUM"] as const).map((plan) => {
              const count = planBreakdown[plan];
              const pct = planTotal > 0 ? Math.round((count / planTotal) * 100) : 0;
              return (
                <div key={plan}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className={`inline-flex px-2 py-0.5 rounded-full font-semibold ${planBadge[plan]}`}>{plan}</span>
                    <span className="text-gray-500">{count} ({pct}%)</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-500 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">RSVP responses</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-emerald-50 rounded-xl p-3">
              <div className="flex items-center gap-2 text-emerald-700 mb-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <p className="text-xs font-semibold">Accepted</p>
              </div>
              <p className="text-xl font-bold text-gray-900">{rsvp.ACCEPTED}</p>
            </div>
            <div className="bg-amber-50 rounded-xl p-3">
              <div className="flex items-center gap-2 text-amber-700 mb-1">
                <Clock className="w-3.5 h-3.5" />
                <p className="text-xs font-semibold">Pending</p>
              </div>
              <p className="text-xl font-bold text-gray-900">{rsvp.PENDING}</p>
            </div>
            <div className="bg-red-50 rounded-xl p-3">
              <div className="flex items-center gap-2 text-red-700 mb-1">
                <XCircle className="w-3.5 h-3.5" />
                <p className="text-xs font-semibold">Declined</p>
              </div>
              <p className="text-xl font-bold text-gray-900">{rsvp.DECLINED}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <CalendarDays className="w-3.5 h-3.5" />
                <p className="text-xs font-semibold">Maybe</p>
              </div>
              <p className="text-xl font-bold text-gray-900">{rsvp.MAYBE}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming weddings */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-900">Upcoming weddings — next 30 days</h2>
          <Link href="/admin/weddings" className="text-xs text-rose-600 font-medium hover:underline">See all →</Link>
        </div>
        {upcomingWeddings.length === 0 ? (
          <p className="text-sm text-gray-400 py-6 text-center">No weddings scheduled in the next 30 days.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Couple</th>
                  <th className="text-left py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="text-left py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Venue</th>
                  <th className="text-left py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left py-2 text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {upcomingWeddings.map((w) => (
                  <tr key={w.id}>
                    <td className="py-3 font-medium text-gray-900">{w.groomName} & {w.brideName}</td>
                    <td className="py-3 text-gray-600">{formatDate(w.weddingDate)}</td>
                    <td className="py-3 text-gray-500 truncate max-w-xs">{w.venue || "—"}</td>
                    <td className="py-3">
                      {w.isPublished ? (
                        <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">Live</span>
                      ) : (
                        <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">Draft</span>
                      )}
                    </td>
                    <td className="py-3">
                      <Link href={`/w/${w.slug}`} target="_blank" className="text-xs text-rose-600 hover:underline inline-flex items-center gap-1">
                        Preview <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900">Recent orders</h2>
            <Link href="/admin/orders" className="text-xs text-rose-600 font-medium hover:underline">View all →</Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-sm text-gray-400 py-6 text-center">No orders yet.</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((o) => (
                <div key={o.id} className="flex items-center justify-between gap-3 text-sm">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900 truncate">{o.user.yourName || o.user.email}</p>
                    <p className="text-xs text-gray-400">{formatDate(o.createdAt, true)} · {o.paymentMethod}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-semibold text-gray-900">{formatMoney(o.amount, o.currency)}</p>
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${paymentStatusBadge[o.paymentStatus] || "bg-gray-100 text-gray-600"}`}>
                      {o.paymentStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900">Recent signups</h2>
            <Link href="/admin/users" className="text-xs text-rose-600 font-medium hover:underline">View all →</Link>
          </div>
          {recentSignups.length === 0 ? (
            <p className="text-sm text-gray-400 py-6 text-center">No signups yet.</p>
          ) : (
            <div className="space-y-3">
              {recentSignups.map((u) => (
                <div key={u.id} className="flex items-center justify-between gap-3 text-sm">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900 truncate">{u.yourName || "—"}{u.partnerName ? ` & ${u.partnerName}` : ""}</p>
                    <p className="text-xs text-gray-400 truncate">{u.email} · {formatDate(u.createdAt, true)}</p>
                  </div>
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold flex-shrink-0 ${planBadge[u.plan] || "bg-gray-100 text-gray-600"}`}>
                    {u.plan}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick links + GA */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Quick links</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { href: "/admin/orders", label: "Orders", icon: FileText, color: "bg-amber-50 text-amber-600" },
              { href: "/admin/users", label: "Users", icon: Users, color: "bg-blue-50 text-blue-600" },
              { href: "/admin/weddings", label: "Weddings", icon: Heart, color: "bg-rose-50 text-rose-600" },
              { href: "/admin/guests", label: "Guests", icon: UserPlus, color: "bg-emerald-50 text-emerald-600" },
              { href: "/admin/templates", label: "Templates", icon: Palette, color: "bg-violet-50 text-violet-600" },
            ].map((l) => (
              <Link key={l.href} href={l.href}
                className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-rose-100 hover:bg-rose-50/30 transition-colors">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${l.color}`}>
                  <l.icon className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium text-gray-700">{l.label}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-emerald-50 text-emerald-600 flex-shrink-0">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-gray-900">Google Analytics</h3>
              <p className="text-xs text-gray-400 mt-1">
                Sessions, top pages and conversions <span className="font-mono">(G-4S358FFMM7)</span>.
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                <a href={GA_REALTIME_URL} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium transition-colors">
                  Realtime <ExternalLink className="w-3 h-3" />
                </a>
                <a href={GA_HOME_URL} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 hover:border-rose-200 hover:text-rose-600 text-gray-600 text-xs font-medium transition-colors">
                  All reports <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
