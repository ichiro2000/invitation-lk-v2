"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Loader2, TrendingUp, Users, Heart, CreditCard, BarChart3,
  CalendarDays, Layers,
} from "lucide-react";

type DaySeries = Record<string, number>;
type MonthSeries = Record<string, number>;

type ReportData = {
  window: { days: number; from: string; to: string };
  summary: {
    totalRevenue: number;
    avgOrderValue: number;
    orderCount: number;
    newSignups: number;
    newInvitations: number;
    publishedInvitations: number;
    paidInvitations: number;
    conversionRate: number;
    totalUsers: number;
    paidUsers: number;
  };
  series: {
    signupsByDay: DaySeries;
    revenueByDay: DaySeries;
    ordersByDay: DaySeries;
    invitationsByDay: DaySeries;
    weddingsByMonth: MonthSeries;
  };
  distributions: {
    rsvp: { PENDING: number; ACCEPTED: number; DECLINED: number; MAYBE: number };
    rsvpTotal: number;
    planBreakdown: { FREE: number; BASIC: number; STANDARD: number; PREMIUM: number };
    templates: { slug: string; count: number }[];
    paymentMethods: { method: string; count: number; revenue: string }[];
    paymentStatuses: { status: string; count: number; amount: string }[];
  };
};

const planBadge: Record<string, string> = {
  FREE: "bg-gray-100 text-gray-600",
  BASIC: "bg-blue-100 text-blue-700",
  STANDARD: "bg-amber-100 text-amber-700",
  PREMIUM: "bg-rose-100 text-rose-700",
};

const statusBadge: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  FAILED: "bg-red-100 text-red-700",
  REFUNDED: "bg-gray-100 text-gray-600",
};

function formatMoney(num: number, currency = "LKR") {
  return `${currency} ${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatShortDate(iso: string) {
  const d = new Date(iso + "T00:00:00Z");
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function formatMonth(ym: string) {
  const d = new Date(ym + "-01T00:00:00Z");
  return d.toLocaleDateString(undefined, { month: "short", year: "2-digit" });
}

function BarChart({
  data, color = "rose", format, labelFormat,
}: {
  data: Record<string, number>;
  color?: "rose" | "emerald" | "blue" | "amber" | "violet";
  format?: (v: number) => string;
  labelFormat?: (k: string) => string;
}) {
  const entries = Object.entries(data);
  const max = Math.max(1, ...entries.map(([, v]) => v));
  const colorClass = {
    rose: "bg-rose-500",
    emerald: "bg-emerald-500",
    blue: "bg-blue-500",
    amber: "bg-amber-500",
    violet: "bg-violet-500",
  }[color];

  return (
    <div className="flex items-end gap-0.5 h-32">
      {entries.map(([k, v]) => {
        const pct = (v / max) * 100;
        return (
          <div key={k} className="flex-1 flex flex-col items-center justify-end group relative">
            <div
              className={`w-full ${colorClass} rounded-t transition-all group-hover:opacity-80`}
              style={{ height: `${Math.max(pct, v > 0 ? 2 : 0)}%` }}
            />
            <div className="absolute bottom-full mb-1 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10">
              {labelFormat ? labelFormat(k) : k}: {format ? format(v) : v}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function AdminReportsPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState<7 | 30 | 90>(30);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/admin/reports?days=${days}`);
        if (!res.ok) throw new Error("Failed");
        const json = await res.json();
        setData(json);
      } catch {
        setError("Failed to load reports.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [days]);

  const templateMax = useMemo(() => {
    if (!data) return 1;
    return Math.max(1, ...data.distributions.templates.map((t) => t.count));
  }, [data]);

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
        {error || "No data."}
      </div>
    );
  }

  const { summary, series, distributions } = data;
  const firstDate = Object.keys(series.signupsByDay)[0];
  const lastDate = Object.keys(series.signupsByDay).slice(-1)[0];
  const planTotal = Object.values(distributions.planBreakdown).reduce((a, b) => a + b, 0);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & analytics</h1>
          <p className="text-gray-400 mt-1">
            {firstDate && lastDate ? `${formatShortDate(firstDate)} — ${formatShortDate(lastDate)}` : "—"}
          </p>
        </div>
        <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1">
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d as 7 | 30 | 90)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                days === d ? "bg-rose-600 text-white" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {d} days
            </button>
          ))}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-emerald-50 text-emerald-600 mb-3">
            <TrendingUp className="w-4 h-4" />
          </div>
          <p className="text-xs text-gray-400 uppercase tracking-wider">Revenue ({days}d)</p>
          <p className="text-lg font-bold text-gray-900 mt-1">{formatMoney(summary.totalRevenue)}</p>
          <p className="text-xs text-gray-400 mt-1">{summary.orderCount} paid orders</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-blue-50 text-blue-600 mb-3">
            <Users className="w-4 h-4" />
          </div>
          <p className="text-xs text-gray-400 uppercase tracking-wider">New signups</p>
          <p className="text-lg font-bold text-gray-900 mt-1">{summary.newSignups}</p>
          <p className="text-xs text-gray-400 mt-1">in last {days} days</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-rose-50 text-rose-600 mb-3">
            <Heart className="w-4 h-4" />
          </div>
          <p className="text-xs text-gray-400 uppercase tracking-wider">New invitations</p>
          <p className="text-lg font-bold text-gray-900 mt-1">{summary.newInvitations}</p>
          <p className="text-xs text-gray-400 mt-1">
            {summary.publishedInvitations} published · {summary.paidInvitations} paid
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-violet-50 text-violet-600 mb-3">
            <BarChart3 className="w-4 h-4" />
          </div>
          <p className="text-xs text-gray-400 uppercase tracking-wider">Free → Paid rate</p>
          <p className="text-lg font-bold text-gray-900 mt-1">{summary.conversionRate.toFixed(1)}%</p>
          <p className="text-xs text-gray-400 mt-1">
            {summary.paidUsers} of {summary.totalUsers} users
          </p>
        </div>
      </div>

      {/* Time series charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Revenue per day</h2>
          <BarChart
            data={series.revenueByDay}
            color="emerald"
            format={(v) => formatMoney(v)}
            labelFormat={formatShortDate}
          />
          <p className="text-xs text-gray-400 mt-2">Avg order: {formatMoney(summary.avgOrderValue)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Signups per day</h2>
          <BarChart
            data={series.signupsByDay}
            color="blue"
            labelFormat={formatShortDate}
          />
          <p className="text-xs text-gray-400 mt-2">{summary.newSignups} new users</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Invitations created per day</h2>
          <BarChart
            data={series.invitationsByDay}
            color="rose"
            labelFormat={formatShortDate}
          />
          <p className="text-xs text-gray-400 mt-2">{summary.newInvitations} invitations</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Weddings by month — next 6</h2>
          <BarChart
            data={series.weddingsByMonth}
            color="violet"
            labelFormat={formatMonth}
          />
          <p className="text-xs text-gray-400 mt-2">Scheduled wedding dates</p>
        </div>
      </div>

      {/* Distributions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        {/* Top templates */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Layers className="w-4 h-4 text-gray-500" />
            <h2 className="text-sm font-semibold text-gray-900">Top templates</h2>
          </div>
          {distributions.templates.length === 0 ? (
            <p className="text-sm text-gray-400 py-6 text-center">No template usage yet.</p>
          ) : (
            <div className="space-y-2">
              {distributions.templates.map((t) => {
                const pct = Math.round((t.count / templateMax) * 100);
                return (
                  <div key={t.slug}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-700 font-mono">{t.slug}</span>
                      <span className="text-gray-500">{t.count}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-rose-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Plan distribution */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Users by plan</h2>
          <div className="space-y-3">
            {(["FREE", "BASIC", "STANDARD", "PREMIUM"] as const).map((plan) => {
              const count = distributions.planBreakdown[plan];
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

        {/* Payment methods */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="w-4 h-4 text-gray-500" />
            <h2 className="text-sm font-semibold text-gray-900">Payment methods (completed)</h2>
          </div>
          {distributions.paymentMethods.length === 0 ? (
            <p className="text-sm text-gray-400 py-6 text-center">No completed payments yet.</p>
          ) : (
            <div className="space-y-3">
              {distributions.paymentMethods.map((m) => (
                <div key={m.method} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium text-gray-900">{m.method.replace(/_/g, " ")}</p>
                    <p className="text-xs text-gray-400">{m.count} {m.count === 1 ? "order" : "orders"}</p>
                  </div>
                  <p className="font-semibold text-gray-900">{formatMoney(parseFloat(m.revenue))}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Payment statuses */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Order outcomes (all time)</h2>
          {distributions.paymentStatuses.length === 0 ? (
            <p className="text-sm text-gray-400 py-6 text-center">No orders yet.</p>
          ) : (
            <div className="space-y-3">
              {distributions.paymentStatuses.map((s) => (
                <div key={s.status} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${statusBadge[s.status] || "bg-gray-100 text-gray-600"}`}>
                      {s.status}
                    </span>
                    <span className="text-xs text-gray-400">{s.count}</span>
                  </div>
                  <p className="font-semibold text-gray-900">{formatMoney(parseFloat(s.amount))}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RSVP conversion */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <CalendarDays className="w-4 h-4 text-gray-500" />
            <h2 className="text-sm font-semibold text-gray-900">RSVP conversion (all-time)</h2>
          </div>
          {distributions.rsvpTotal === 0 ? (
            <p className="text-sm text-gray-400 py-6 text-center">No guests yet.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(["ACCEPTED", "PENDING", "DECLINED", "MAYBE"] as const).map((status) => {
                const count = distributions.rsvp[status];
                const pct = distributions.rsvpTotal > 0 ? (count / distributions.rsvpTotal) * 100 : 0;
                const tone = {
                  ACCEPTED: "bg-emerald-50 text-emerald-700",
                  PENDING: "bg-amber-50 text-amber-700",
                  DECLINED: "bg-red-50 text-red-700",
                  MAYBE: "bg-gray-50 text-gray-600",
                }[status];
                return (
                  <div key={status} className={`rounded-xl p-3 ${tone}`}>
                    <p className="text-xs font-semibold uppercase tracking-wider">{status}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{count}</p>
                    <p className="text-xs mt-1">{pct.toFixed(1)}% of {distributions.rsvpTotal}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
