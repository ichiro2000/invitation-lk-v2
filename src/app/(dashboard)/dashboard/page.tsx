"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Heart, Users, Eye, Palette, ArrowRight, Calendar,
  Crown, Loader2, CheckCircle2, Send, ExternalLink,
} from "lucide-react";
import Sparkline from "@/components/dashboard/Sparkline";

interface OverviewResponse {
  user: { name: string; plan: string };
  invitation: { slug: string; isPublished: boolean } | null;
  stats: {
    guests: { total: number; series: number[] };
    rsvps: { total: number; series: number[] };
    pageViews: { total: number; series: number[] };
    template: string | null;
  };
  gettingStarted: {
    templateChosen: boolean;
    guestsAdded: boolean;
    invitationEdited: boolean;
    published: boolean;
  };
}

export default function DashboardPage() {
  const [data, setData] = useState<OverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/dashboard/overview");
        if (res.ok) setData(await res.json());
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-rose-600 animate-spin" />
      </div>
    );
  }

  const { user, invitation, stats, gettingStarted } = data;
  const isPaid = user.plan !== "FREE";

  const steps: { label: string; done: boolean; href: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { label: "Choose Template", done: gettingStarted.templateChosen, href: "/dashboard/invitations", icon: Palette },
    { label: "Add Guests", done: gettingStarted.guestsAdded, href: "/dashboard/guests", icon: Users },
    { label: "Edit Invitation", done: gettingStarted.invitationEdited, href: "/dashboard/editor", icon: Palette },
    { label: "Publish & Share", done: gettingStarted.published, href: "/dashboard/invitations", icon: Send },
  ];
  const completedSteps = steps.filter((s) => s.done).length;

  return (
    <div>
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome, {user.name}! <span aria-hidden>👋</span>
        </h1>
        <p className="text-gray-400 mt-1">Manage your wedding invitation from here.</p>
      </div>

      {/* Plan banner */}
      <div
        className={`rounded-2xl p-6 mb-8 ${
          isPaid
            ? "bg-gradient-to-r from-rose-600 to-pink-500 text-white"
            : "bg-gradient-to-r from-gray-100 to-gray-50 border border-gray-200"
        }`}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                isPaid ? "bg-white/15 text-amber-300" : "bg-white text-gray-400"
              }`}
            >
              <Crown className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className={`font-semibold ${isPaid ? "text-white" : "text-gray-700"}`}>
                {user.plan === "FREE" ? "Free Plan" : `${user.plan} Plan`}
              </p>
              <p className={`text-sm mt-0.5 truncate ${isPaid ? "text-rose-100" : "text-gray-500"}`}>
                {isPaid
                  ? invitation?.isPublished
                    ? "Your invitation is live and shareable."
                    : "Your invitation is ready to publish!"
                  : "Upgrade to publish your invitation and unlock all features."}
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/checkout"
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors flex-shrink-0 ${
              isPaid
                ? "bg-white/15 hover:bg-white/25 text-white"
                : "bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/20"
            }`}
          >
            {isPaid ? "View Plan Details" : "Upgrade"}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Guests"
          value={stats.guests.total}
          series={stats.guests.series}
          icon={Users}
          tint="bg-violet-100 text-violet-600"
          stroke="#8b5cf6"
          fill="#ede9fe"
          subtitle="All invited guests"
        />
        <StatCard
          label="Page Views"
          value={stats.pageViews.total}
          series={stats.pageViews.series}
          icon={Eye}
          tint="bg-blue-100 text-blue-600"
          stroke="#2563eb"
          fill="#dbeafe"
          subtitle="Total views so far"
        />
        <StatCard
          label="RSVPs"
          value={stats.rsvps.total}
          series={stats.rsvps.series}
          icon={Heart}
          tint="bg-emerald-100 text-emerald-600"
          stroke="#059669"
          fill="#d1fae5"
          subtitle="Guests responded"
        />
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-400">Template</p>
            <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <Palette className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 truncate">
            {stats.template ? formatSlug(stats.template) : "None"}
          </p>
          <p className="text-xs text-gray-400 mt-2">
            {stats.template ? "Current design" : "No template selected"}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">Quick Actions</h2>
        <Link
          href="/dashboard/tools/tasks"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-rose-600 px-3 py-1.5 rounded-lg border border-gray-200 hover:border-rose-200"
        >
          View All Tools
        </Link>
      </div>
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <QuickAction
          href="/dashboard/invitations"
          label="Choose Template"
          desc="Pick a beautiful design for your invitation"
          icon={Palette}
          gradient="from-rose-50 to-pink-50"
          iconBg="bg-rose-500"
          cta="Choose Template"
        />
        <QuickAction
          href="/dashboard/guests"
          label="Add Guests"
          desc="Build and manage your guest list"
          icon={Users}
          gradient="from-violet-50 to-purple-50"
          iconBg="bg-violet-500"
          cta="Add Guests"
        />
        <QuickAction
          href="/dashboard/tools/tasks"
          label="Plan Wedding"
          desc="Manage tasks, checklist and budget"
          icon={Calendar}
          gradient="from-emerald-50 to-teal-50"
          iconBg="bg-emerald-500"
          cta="Go to Planner"
        />
      </div>

      {/* Getting Started */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-bold text-gray-900">Getting Started</h2>
          <span className="text-sm text-gray-500">
            {completedSteps} of {steps.length} complete
          </span>
        </div>
        <p className="text-sm text-gray-400 mb-5">
          Complete these steps to publish your invitation
        </p>

        {/* Progress bar */}
        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden mb-6">
          <div
            className="h-full bg-gradient-to-r from-rose-500 to-pink-500 transition-all"
            style={{ width: `${(completedSteps / steps.length) * 100}%` }}
          />
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {steps.map((s, i) => (
            <Link
              key={s.label}
              href={s.href}
              className={`group flex items-start gap-3 p-4 rounded-xl border transition-colors ${
                s.done
                  ? "bg-emerald-50/50 border-emerald-100 hover:bg-emerald-50"
                  : "bg-white border-gray-100 hover:border-rose-200 hover:bg-rose-50/30"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  s.done ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-500"
                }`}
              >
                {s.done ? <CheckCircle2 className="w-4 h-4" /> : <span className="text-xs font-bold">{i + 1}</span>}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900">{s.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {s.done ? "Done" : "Tap to continue"}
                </p>
              </div>
              {!s.done && (
                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-rose-500 transition-colors flex-shrink-0 mt-1" />
              )}
            </Link>
          ))}
        </div>

        {invitation?.isPublished && invitation.slug && (
          <div className="mt-5 pt-5 border-t border-gray-100 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Your invitation is live at</p>
              <p className="text-sm font-mono text-gray-700 truncate">/w/{invitation.slug}</p>
            </div>
            <Link
              href={`/w/${invitation.slug}`}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-sm font-medium text-gray-700 flex-shrink-0"
            >
              View <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  series,
  icon: Icon,
  tint,
  stroke,
  fill,
  subtitle,
}: {
  label: string;
  value: number;
  series: number[];
  icon: React.ComponentType<{ className?: string }>;
  tint: string;
  stroke: string;
  fill: string;
  subtitle: string;
}) {
  const hasActivity = series.some((n) => n > 0);
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-gray-400">{label}</p>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${tint}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <div className="flex items-end justify-between mt-2 gap-2">
        <p className="text-xs text-gray-400">{subtitle}</p>
        {hasActivity ? (
          <Sparkline data={series} stroke={stroke} fill={fill} ariaLabel={`${label} over the last 14 days`} />
        ) : (
          <span className="text-[10px] text-gray-300">last 14 days</span>
        )}
      </div>
    </div>
  );
}

function QuickAction({
  href,
  label,
  desc,
  icon: Icon,
  gradient,
  iconBg,
  cta,
}: {
  href: string;
  label: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  iconBg: string;
  cta: string;
}) {
  return (
    <Link
      href={href}
      className={`group relative overflow-hidden bg-gradient-to-br ${gradient} rounded-2xl p-6 border border-gray-100 hover:shadow-md hover:border-rose-200 transition-all`}
    >
      <div className={`w-11 h-11 rounded-2xl ${iconBg} text-white flex items-center justify-center mb-4 shadow-sm`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="font-semibold text-gray-900 text-base">{label}</p>
      <p className="text-sm text-gray-500 mt-1 mb-5">{desc}</p>
      <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-white ${iconBg} shadow-sm group-hover:brightness-110 transition-all`}>
        {cta} <ArrowRight className="w-4 h-4" />
      </span>
    </Link>
  );
}

// Turn a slug like "royal-elegance" into "Royal Elegance" for display.
function formatSlug(slug: string): string {
  return slug
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");
}
