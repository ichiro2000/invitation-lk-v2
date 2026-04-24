"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Heart, Users, Eye, Palette, ArrowRight, Calendar,
  Loader2, CheckCircle2, ExternalLink, Copy, Check,
  UserPlus, ListTodo, DollarSign, Mail,
} from "lucide-react";
import Sparkline from "@/components/dashboard/Sparkline";

interface OverviewResponse {
  user: { name: string; plan: string };
  invitation: {
    slug: string;
    isPublished: boolean;
    weddingDate: string;
    venue: string;
    groomName: string;
    brideName: string;
    daysUntil: number;
  } | null;
  stats: {
    guests: { total: number; series: number[]; addedRecent: number };
    rsvps: {
      total: number;
      series: number[];
      accepted: number;
      declined: number;
      pending: number;
      maybe: number;
    };
    pageViews: { total: number; series: number[]; recent7: number; prior7: number };
    template: string | null;
  };
  awaitingGuests: { id: string; name: string; category: string; addedAt: string; inviteSent: boolean }[];
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
  const [copied, setCopied] = useState(false);

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

  const { user, invitation, stats, awaitingGuests, gettingStarted } = data;
  const isPaid = user.plan !== "FREE";
  const isLive = !!invitation?.isPublished;

  // Steps mirror the publication flow. The 5th "Customize invitation" step
  // (templateChosen + invitationEdited together would be cleaner) is split so
  // the user gets a more granular sense of progress.
  const steps = [
    { label: "Create account", done: true, href: "/dashboard/profile" },
    { label: "Choose template", done: gettingStarted.templateChosen, href: "/dashboard/invitations", sub: stats.template ? formatSlug(stats.template) : undefined },
    { label: "Add guest list", done: gettingStarted.guestsAdded, href: "/dashboard/guests", sub: stats.guests.total > 0 ? `${stats.guests.total} guests` : undefined },
    { label: "Customize invitation", done: gettingStarted.invitationEdited, href: "/dashboard/editor" },
    { label: "Publish & share", done: gettingStarted.published, href: "/dashboard/invitations" },
  ];
  const completedSteps = steps.filter((s) => s.done).length;
  const progressPct = Math.round((completedSteps / steps.length) * 100);

  // Page-views delta vs prior 7-day window. Computed in the API; rendered as
  // "+23%" or "—" for the first week when there's no prior window data.
  const pvDelta = stats.pageViews.prior7 > 0
    ? Math.round(((stats.pageViews.recent7 - stats.pageViews.prior7) / stats.pageViews.prior7) * 100)
    : null;

  const totalRsvpResponses = stats.rsvps.accepted + stats.rsvps.declined + stats.rsvps.maybe;
  const responseRate = stats.guests.total > 0 ? Math.round((totalRsvpResponses / stats.guests.total) * 100) : 0;

  const inviteUrl = invitation
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/i/${invitation.slug}`
    : "";

  const copyLink = async () => {
    if (!inviteUrl) return;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard blocked */ }
  };

  return (
    <div>
      {/* Welcome row */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, <span className="italic font-serif text-rose-600">{user.name.split(/\s+/)[0] || user.name}</span>
          </h1>
          <p className="text-gray-500 mt-1.5 text-sm">
            {isLive
              ? "Your invitation is live and looking beautiful. Here's what's happening with your big day."
              : "Let's get your invitation ready to share. Here's what's next."}
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          {invitation?.slug && (
            <button
              type="button"
              onClick={copyLink}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:border-rose-200 hover:text-rose-600 text-sm font-medium text-gray-700 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied" : "Share link"}
            </button>
          )}
          <Link
            href="/dashboard/guests"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium shadow-sm shadow-rose-600/20 transition-colors"
          >
            <UserPlus className="w-4 h-4" /> Invite more guests
          </Link>
        </div>
      </div>

      {/* Hero — invitation publication status */}
      <HeroCard
        invitation={invitation}
        pageViews={stats.pageViews.recent7}
        isPaid={isPaid}
        copyLink={copyLink}
        copied={copied}
        inviteUrl={inviteUrl}
      />

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total guests"
          value={stats.guests.total}
          series={stats.guests.series}
          icon={Users}
          tint="bg-rose-50 text-rose-600"
          stroke="#e11d48"
          fill="#ffe4e6"
          delta={stats.guests.addedRecent > 0 ? `+${stats.guests.addedRecent}` : undefined}
          deltaTone="emerald"
          subtitle="invited"
        />
        <StatCard
          label="Page views"
          value={stats.pageViews.total}
          series={stats.pageViews.series}
          icon={Eye}
          tint="bg-violet-50 text-violet-600"
          stroke="#8b5cf6"
          fill="#ede9fe"
          delta={pvDelta !== null ? `${pvDelta >= 0 ? "+" : ""}${pvDelta}%` : undefined}
          deltaTone={pvDelta !== null && pvDelta < 0 ? "rose" : "emerald"}
          subtitle="last 7 days"
        />
        <RsvpStatCard
          accepted={stats.rsvps.accepted}
          total={stats.guests.total}
          rate={responseRate}
        />
        <DaysToWeddingCard invitation={invitation} />
      </div>

      {/* Two-col: Guest responses + Awaiting */}
      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        <ResponsesCard
          accepted={stats.rsvps.accepted}
          declined={stats.rsvps.declined}
          pending={stats.rsvps.pending + stats.rsvps.maybe}
          totalGuests={stats.guests.total}
        />
        <AwaitingCard guests={awaitingGuests} pendingTotal={stats.rsvps.pending + stats.rsvps.maybe} />
      </div>

      {/* Quick actions */}
      <div className="flex items-end justify-between mb-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Quick actions</h2>
          <p className="text-sm text-gray-500">Jump back into what matters most this week.</p>
        </div>
        <Link
          href="/dashboard/tools/tasks"
          className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-rose-600 px-3 py-1.5 rounded-lg border border-gray-200 hover:border-rose-200"
        >
          View all tools <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <QuickAction
          href="/dashboard/invitations"
          label="Choose template"
          desc={stats.template ? `${formatSlug(stats.template)} · switch anytime` : "Pick a beautiful design"}
          icon={Palette}
          tone="rose"
          cta="Browse gallery"
        />
        <QuickAction
          href="/dashboard/guests"
          label="Manage guests"
          desc={`${stats.guests.total} invited · ${stats.rsvps.pending + stats.rsvps.maybe} pending RSVP`}
          icon={Users}
          tone="violet"
          cta="Open guest list"
        />
        <QuickAction
          href="/dashboard/tools/tasks"
          label="Plan wedding"
          desc="Tasks, checklist & vendors"
          icon={ListTodo}
          tone="emerald"
          cta="Go to planner"
        />
        <QuickAction
          href="/dashboard/tools/budget"
          label="Track budget"
          desc="Estimates, payments & vendors"
          icon={DollarSign}
          tone="amber"
          cta="Open budget"
        />
      </div>

      {/* Getting started */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-bold text-gray-900">Getting started</h2>
          <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">
            <Heart className="w-3 h-3 fill-emerald-600 text-emerald-600" /> {progressPct}% complete
          </span>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          {completedSteps} of {steps.length} steps complete
        </p>

        {/* Progress bar */}
        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden mb-5">
          <div
            className="h-full bg-gradient-to-r from-rose-500 to-pink-500 transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {steps.map((s, i) => (
            <Link
              key={s.label}
              href={s.href}
              className={`group flex items-start gap-3 p-3.5 rounded-xl border transition-colors ${
                s.done
                  ? "bg-emerald-50/40 border-emerald-100 hover:bg-emerald-50"
                  : "bg-white border-gray-100 hover:border-rose-200 hover:bg-rose-50/30"
              }`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                  s.done ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-500 border border-gray-200"
                }`}
              >
                {s.done ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 leading-tight">{s.label}</p>
                <p className="text-xs text-gray-500 mt-0.5 truncate">
                  {s.done ? (s.sub ?? "Done") : (i === 4 && completedSteps === 4 ? "Ready" : "In progress")}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {invitation?.isPublished && invitation.slug && (
          <div className="mt-5 pt-5 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1">Your invitation is live at</p>
              <p className="text-sm font-mono text-gray-700 truncate">/i/{invitation.slug}</p>
            </div>
            <Link
              href={`/i/${invitation.slug}`}
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

// ─── Hero card ──────────────────────────────────────────────────────────────

function HeroCard({
  invitation,
  pageViews,
  isPaid,
  copyLink,
  copied,
  inviteUrl,
}: {
  invitation: OverviewResponse["invitation"];
  pageViews: number;
  isPaid: boolean;
  copyLink: () => void;
  copied: boolean;
  inviteUrl: string;
}) {
  const isLive = !!invitation?.isPublished;
  const planLabel = isPaid ? "PREMIUM" : "FREE";
  const statusLabel = isLive ? "LIVE" : "DRAFT";

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-600 via-rose-500 to-pink-500 text-white mb-6">
      {/* Decorative pattern overlay — keeps the right side visually rich
          without a real image asset. */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.08] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "16px 16px",
        }}
      />
      <div className="relative grid md:grid-cols-[1fr_auto] gap-6 p-6 md:p-8">
        <div className="flex flex-col">
          <div className="flex items-center gap-3 mb-5">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wider px-2.5 py-1 rounded-full bg-white/15 backdrop-blur">
              <Heart className="w-3 h-3 fill-white" /> {planLabel} · {statusLabel}
            </span>
            {invitation?.slug && (
              <span className="text-xs text-rose-100 font-mono truncate">
                invitation.lk/{invitation.slug}
              </span>
            )}
          </div>
          <h2 className="text-2xl md:text-3xl font-bold leading-tight max-w-xl">
            {isLive ? (
              <>Your invitation is <em className="font-serif italic font-semibold">published</em> and ready to share.</>
            ) : (
              <>Your invitation is <em className="font-serif italic font-semibold">almost ready</em> to publish.</>
            )}
          </h2>
          <p className="text-sm text-rose-100 mt-2 max-w-lg">
            {isLive
              ? `${pageViews.toLocaleString()} page view${pageViews === 1 ? "" : "s"} in the last 7 days. Copy the link below to share.`
              : "Finish the steps below to publish your invitation and start collecting RSVPs."}
          </p>

          <div className="flex flex-wrap items-center gap-2.5 mt-6">
            {invitation?.slug && (
              <button
                type="button"
                onClick={copyLink}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-rose-700 hover:bg-rose-50 text-sm font-semibold shadow-sm transition-colors"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "Link copied" : "Copy link"}
              </button>
            )}
            {invitation?.slug && isLive && (
              <Link
                href={`/i/${invitation.slug}`}
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur text-sm font-medium transition-colors"
              >
                <ExternalLink className="w-4 h-4" /> Open invitation
              </Link>
            )}
            <Link
              href={isPaid ? "/dashboard/checkout" : "/dashboard/checkout"}
              className="inline-flex items-center gap-1 text-sm font-medium text-white/90 hover:text-white px-2 py-2.5"
            >
              {isPaid ? "View plan" : "Upgrade plan"} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Mini invitation card preview — a stylized stand-in that hints at
            the live invitation without depending on a generated thumbnail. */}
        <div className="hidden md:flex items-center justify-end">
          <MiniInvitationPreview invitation={invitation} />
        </div>
      </div>
      {/* Hidden text for SR / autofill of the live URL */}
      <span className="sr-only">{inviteUrl}</span>
    </div>
  );
}

function MiniInvitationPreview({ invitation }: { invitation: OverviewResponse["invitation"] }) {
  const groom = invitation?.groomName?.trim() || "Bride";
  const bride = invitation?.brideName?.trim() || "Groom";
  const dateLabel = invitation
    ? new Date(invitation.weddingDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
      })
    : "";
  const dayLabel = invitation
    ? new Date(invitation.weddingDate).toLocaleDateString("en-US", {
        weekday: "long",
        timeZone: "UTC",
      })
    : "";

  return (
    <div className="w-44 lg:w-52 rotate-[2deg] rounded-2xl bg-rose-50 text-rose-900 p-5 shadow-2xl shadow-rose-900/40 border border-white/40">
      <div className="text-center">
        <p className="text-[8px] uppercase tracking-[0.18em] text-rose-400 font-semibold">
          Together with their families
        </p>
        <p className="font-serif italic text-lg font-semibold mt-2 leading-tight truncate">{bride}</p>
        <p className="text-[10px] text-rose-400 my-1">— &amp; —</p>
        <p className="font-serif italic text-lg font-semibold leading-tight truncate">{groom}</p>
        <p className="text-[8px] text-rose-500 mt-3">
          Request the honour of your presence
        </p>
        <div className="mt-3 rounded-md bg-white/60 px-3 py-2">
          <p className="text-[8px] uppercase tracking-wider text-rose-400 font-semibold">{dayLabel.toUpperCase()}</p>
          <p className="font-serif text-sm font-semibold text-rose-700 mt-0.5 truncate">{dateLabel}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Stat cards ─────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  series,
  icon: Icon,
  tint,
  stroke,
  fill,
  delta,
  deltaTone,
  subtitle,
}: {
  label: string;
  value: number;
  series: number[];
  icon: React.ComponentType<{ className?: string }>;
  tint: string;
  stroke: string;
  fill: string;
  delta?: string;
  deltaTone?: "emerald" | "rose";
  subtitle: string;
}) {
  const hasActivity = series.some((n) => n > 0);
  const deltaCls = deltaTone === "rose"
    ? "bg-rose-50 text-rose-700"
    : "bg-emerald-50 text-emerald-700";
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold">{label}</p>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tint}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <p className="text-3xl font-bold text-gray-900 tabular-nums">{value.toLocaleString()}</p>
        {delta && (
          <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded ${deltaCls}`}>{delta}</span>
        )}
      </div>
      <div className="mt-3 h-9">
        {hasActivity ? (
          <Sparkline data={series} stroke={stroke} fill={fill} ariaLabel={`${label} over the last 14 days`} width={200} />
        ) : (
          <div className="h-9 flex items-end">
            <span className="text-[10px] text-gray-300">last 14 days · no activity</span>
          </div>
        )}
      </div>
      <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
    </div>
  );
}

function RsvpStatCard({ accepted, total, rate }: { accepted: number; total: number; rate: number }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold">RSVPs</p>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-50 text-emerald-600">
          <Heart className="w-4 h-4" />
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <p className="text-3xl font-bold text-gray-900 tabular-nums">{accepted}</p>
        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">{rate}%</span>
      </div>
      <div className="mt-4 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all"
          style={{ width: `${Math.min(100, rate)}%` }}
        />
      </div>
      <p className="text-xs text-gray-400 mt-2">{total > 0 ? `${accepted} of ${total} accepted` : "response rate"}</p>
    </div>
  );
}

function DaysToWeddingCard({ invitation }: { invitation: OverviewResponse["invitation"] }) {
  const days = invitation?.daysUntil ?? null;
  const dateLabel = invitation
    ? new Date(invitation.weddingDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
      })
    : "Not set";
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold">Days to wedding</p>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-amber-50 text-amber-600">
          <Calendar className="w-4 h-4" />
        </div>
      </div>
      <p className="text-3xl font-bold text-gray-900 tabular-nums">{days !== null && days >= 0 ? days : "—"}</p>
      <div className="mt-3 h-9 flex items-end">
        <span className="text-[10px] text-gray-300">
          {days !== null && days < 0 ? `Wedding day was ${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"} ago` : "until your big day"}
        </span>
      </div>
      <p className="text-xs text-gray-400 mt-1">{dateLabel}</p>
    </div>
  );
}

// ─── Responses card (donut) ─────────────────────────────────────────────────

function ResponsesCard({
  accepted,
  declined,
  pending,
  totalGuests,
}: {
  accepted: number;
  declined: number;
  pending: number;
  totalGuests: number;
}) {
  const totalResponses = accepted + declined;
  const totalAll = Math.max(1, accepted + declined + pending);
  const responseRate = totalGuests > 0 ? Math.round((totalResponses / totalGuests) * 100) : 0;

  // Donut geometry — circumference 2πr, slices stacked via stroke-dasharray.
  const r = 42;
  const c = 2 * Math.PI * r;
  const acceptedLen = (accepted / totalAll) * c;
  const declinedLen = (declined / totalAll) * c;
  const pendingLen = (pending / totalAll) * c;

  return (
    <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6">
      <div className="flex items-start justify-between mb-1">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Guest responses</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {totalGuests} invited · {totalResponses} response{totalResponses === 1 ? "" : "s"}
          </p>
        </div>
        <Link
          href="/dashboard/guests/links"
          className="inline-flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-rose-600 px-3 py-1.5 rounded-lg border border-gray-200 hover:border-rose-200"
        >
          Details <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid sm:grid-cols-[auto_1fr] items-center gap-6 mt-5">
        {/* Donut */}
        <div className="relative w-32 h-32 flex-shrink-0 mx-auto sm:mx-0">
          <svg viewBox="0 0 100 100" className="-rotate-90 w-full h-full">
            <circle cx="50" cy="50" r={r} fill="none" stroke="#f1f5f9" strokeWidth="10" />
            {accepted > 0 && (
              <circle
                cx="50" cy="50" r={r} fill="none"
                stroke="#10b981" strokeWidth="10" strokeLinecap="butt"
                strokeDasharray={`${acceptedLen} ${c}`}
                strokeDashoffset="0"
              />
            )}
            {declined > 0 && (
              <circle
                cx="50" cy="50" r={r} fill="none"
                stroke="#f59e0b" strokeWidth="10" strokeLinecap="butt"
                strokeDasharray={`${declinedLen} ${c}`}
                strokeDashoffset={-acceptedLen}
              />
            )}
            {pending > 0 && (
              <circle
                cx="50" cy="50" r={r} fill="none"
                stroke="#e2e8f0" strokeWidth="10" strokeLinecap="butt"
                strokeDasharray={`${pendingLen} ${c}`}
                strokeDashoffset={-(acceptedLen + declinedLen)}
              />
            )}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-bold text-gray-900 tabular-nums">{responseRate}%</span>
            <span className="text-[10px] text-gray-400 uppercase tracking-wider mt-0.5">Response rate</span>
          </div>
        </div>

        {/* Bars */}
        <div className="space-y-3 w-full">
          <ResponseBar label="Attending" count={accepted} total={totalGuests} color="bg-emerald-500" dot="bg-emerald-500" />
          <ResponseBar label="Declined" count={declined} total={totalGuests} color="bg-amber-500" dot="bg-amber-500" />
          <ResponseBar label="Awaiting" count={pending} total={totalGuests} color="bg-gray-300" dot="bg-gray-400" />
        </div>
      </div>

      {pending > 0 && (
        <Link
          href="/dashboard/guests/links"
          className="mt-5 flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-sm font-medium transition-colors"
        >
          <Mail className="w-4 h-4" /> Nudge {pending} guest{pending === 1 ? "" : "s"}
        </Link>
      )}
    </div>
  );
}

function ResponseBar({
  label, count, total, color, dot,
}: { label: string; count: number; total: number; color: string; dot: string }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="inline-flex items-center gap-2 text-sm text-gray-700">
          <span className={`w-2 h-2 rounded-full ${dot}`} /> {label}
        </span>
        <span className="text-sm font-semibold text-gray-900 tabular-nums">
          {count} <span className="text-gray-300 font-normal">/ {total}</span>
        </span>
      </div>
      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ─── Awaiting responses panel ───────────────────────────────────────────────

function AwaitingCard({
  guests,
  pendingTotal,
}: {
  guests: OverviewResponse["awaitingGuests"];
  pendingTotal: number;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <div className="flex items-start justify-between mb-1">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Awaiting responses</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {pendingTotal === 0 ? "All caught up — every guest has responded." : `${pendingTotal} guest${pendingTotal === 1 ? "" : "s"} pending`}
          </p>
        </div>
        <Link
          href="/dashboard/guests/links"
          className="inline-flex items-center gap-1 text-xs font-medium text-gray-600 hover:text-rose-600"
        >
          All guests <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {guests.length === 0 ? (
        <div className="mt-6 text-center py-8 px-4 rounded-xl bg-gray-50 border border-dashed border-gray-200">
          <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-700">No pending guests</p>
          <p className="text-xs text-gray-500 mt-1">Add guests and we&apos;ll track responses here.</p>
        </div>
      ) : (
        <ul className="mt-4 space-y-1">
          {guests.map((g) => (
            <li key={g.id}>
              <Link
                href="/dashboard/guests/links"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-rose-50/50 transition-colors group -mx-1"
              >
                <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                  {g.name.trim().charAt(0).toUpperCase() || "?"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">{g.name}</p>
                  <p className="text-xs text-gray-500 truncate">
                    {formatCategory(g.category)} · {g.inviteSent ? "Invite sent" : "Invite ready"}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-rose-500 flex-shrink-0" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ─── Quick action cards ─────────────────────────────────────────────────────

const QUICK_ACTION_TONES = {
  rose:    { gradient: "from-rose-50 to-pink-50",    iconBg: "bg-rose-500",    cta: "text-rose-700",    border: "border-rose-100" },
  violet:  { gradient: "from-violet-50 to-purple-50", iconBg: "bg-violet-500",  cta: "text-violet-700",  border: "border-violet-100" },
  emerald: { gradient: "from-emerald-50 to-teal-50",  iconBg: "bg-emerald-500", cta: "text-emerald-700", border: "border-emerald-100" },
  amber:   { gradient: "from-amber-50 to-yellow-50",  iconBg: "bg-amber-500",   cta: "text-amber-700",   border: "border-amber-100" },
} as const;

function QuickAction({
  href,
  label,
  desc,
  icon: Icon,
  tone,
  cta,
}: {
  href: string;
  label: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: keyof typeof QUICK_ACTION_TONES;
  cta: string;
}) {
  const t = QUICK_ACTION_TONES[tone];
  return (
    <Link
      href={href}
      className={`group relative overflow-hidden bg-gradient-to-br ${t.gradient} rounded-2xl p-5 border ${t.border} hover:shadow-md transition-all`}
    >
      <div className={`w-10 h-10 rounded-xl ${t.iconBg} text-white flex items-center justify-center mb-4 shadow-sm`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="font-bold text-gray-900 text-base">{label}</p>
      <p className="text-xs text-gray-600 mt-1 mb-4 line-clamp-2">{desc}</p>
      <span className={`inline-flex items-center gap-1 text-sm font-semibold ${t.cta}`}>
        {cta} <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatSlug(slug: string): string {
  return slug
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");
}

function formatCategory(cat: string): string {
  // Stored as upper-snake (FAMILY, FRIENDS, COLLEAGUES, ...). Render as
  // title-case for display.
  return cat
    .toLowerCase()
    .split("_")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");
}

