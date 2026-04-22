"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  Loader2, ArrowLeft, Mail, Phone, CheckCircle2, XCircle,
  Calendar, Shield, Heart, CreditCard, ExternalLink, Ban, UserCheck, X, Eye,
  Activity, UserPlus, Edit3, LifeBuoy, MessageCircle, Globe, RefreshCw,
} from "lucide-react";

type TimelineEventType =
  | "account.signup"
  | "account.email_verified"
  | "account.suspended"
  | "account.unsuspended"
  | "account.plan_changed"
  | "account.role_changed"
  | "account.impersonated"
  | "invitation.created"
  | "invitation.published"
  | "invitation.paid"
  | "order.created"
  | "order.completed"
  | "order.failed"
  | "order.refunded"
  | "support.ticket_opened"
  | "support.ticket_replied";

interface TimelineEvent {
  type: TimelineEventType;
  at: string;
  summary: string;
  detail?: string;
  actorEmail?: string | null;
}

const timelineMeta: Record<TimelineEventType, { icon: React.ComponentType<{ className?: string }>; color: string }> = {
  "account.signup":         { icon: UserPlus,     color: "bg-blue-100 text-blue-700" },
  "account.email_verified": { icon: CheckCircle2, color: "bg-emerald-100 text-emerald-700" },
  "account.suspended":      { icon: Ban,          color: "bg-red-100 text-red-700" },
  "account.unsuspended":    { icon: UserCheck,    color: "bg-emerald-100 text-emerald-700" },
  "account.plan_changed":   { icon: Edit3,        color: "bg-blue-100 text-blue-700" },
  "account.role_changed":   { icon: Shield,       color: "bg-violet-100 text-violet-700" },
  "account.impersonated":   { icon: Eye,          color: "bg-amber-100 text-amber-700" },
  "invitation.created":     { icon: Heart,        color: "bg-rose-100 text-rose-700" },
  "invitation.published":   { icon: Globe,        color: "bg-emerald-100 text-emerald-700" },
  "invitation.paid":        { icon: CheckCircle2, color: "bg-blue-100 text-blue-700" },
  "order.created":          { icon: CreditCard,   color: "bg-gray-100 text-gray-700" },
  "order.completed":        { icon: CheckCircle2, color: "bg-emerald-100 text-emerald-700" },
  "order.failed":           { icon: XCircle,      color: "bg-red-100 text-red-700" },
  "order.refunded":         { icon: RefreshCw,    color: "bg-gray-100 text-gray-700" },
  "support.ticket_opened":  { icon: LifeBuoy,     color: "bg-amber-100 text-amber-700" },
  "support.ticket_replied": { icon: MessageCircle,color: "bg-blue-100 text-blue-700" },
};

interface UserDetail {
  user: {
    id: string; email: string;
    yourName: string | null; partnerName: string | null;
    weddingDate: string | null; venue: string | null;
    phone: string | null; image: string | null;
    role: string; plan: string;
    emailVerified: string | null;
    suspendedAt: string | null; suspendedReason: string | null;
    createdAt: string; updatedAt: string;
    invitations: {
      id: string; slug: string; templateSlug: string;
      groomName: string; brideName: string; weddingDate: string;
      venue: string; isPublished: boolean; isPaid: boolean; createdAt: string;
      _count: { events: number; pageViews: number };
    }[];
    orders: {
      id: string; plan: string; amount: string; currency: string;
      paymentMethod: string; paymentStatus: string; createdAt: string;
    }[];
    _count: { guests: number; tasks: number; vendors: number; budgetItems: number };
  };
  guestRsvp: { PENDING: number; ACCEPTED: number; DECLINED: number; MAYBE: number };
  providers: string[];
  lastSessionExpires: string | null;
}

const planBadge: Record<string, string> = {
  FREE: "bg-gray-100 text-gray-600",
  BASIC: "bg-blue-100 text-blue-700",
  STANDARD: "bg-amber-100 text-amber-700",
  PREMIUM: "bg-rose-100 text-rose-700",
};

const roleBadge: Record<string, string> = {
  CUSTOMER: "bg-gray-100 text-gray-600",
  ADMIN: "bg-violet-100 text-violet-700",
};

const statusBadge: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  FAILED: "bg-red-100 text-red-700",
  REFUNDED: "bg-gray-100 text-gray-600",
};

function formatDate(d: string | null, withTime = false) {
  if (!d) return "—";
  const date = new Date(d);
  if (withTime) {
    return date.toLocaleString(undefined, {
      month: "short", day: "numeric", year: "numeric",
      hour: "numeric", minute: "2-digit",
    });
  }
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function formatMoney(amount: string, currency = "LKR") {
  return `${currency} ${parseFloat(amount || "0").toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function AdminUserDetailPage(
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = use(params);
  const [data, setData] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [suspendOpen, setSuspendOpen] = useState(false);
  const [suspendReason, setSuspendReason] = useState("");
  const [suspendLoading, setSuspendLoading] = useState(false);
  const [suspendError, setSuspendError] = useState<string | null>(null);
  const [unsuspendLoading, setUnsuspendLoading] = useState(false);
  const [impersonateLoading, setImpersonateLoading] = useState(false);
  const [impersonateError, setImpersonateError] = useState<string | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [timelineLoading, setTimelineLoading] = useState(true);

  const startImpersonation = async () => {
    setImpersonateLoading(true);
    setImpersonateError(null);
    try {
      const res = await fetch(`/api/admin/users/${id}/impersonate`, { method: "POST" });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setImpersonateError(body.error || "Failed to start impersonation");
        return;
      }
      // Full reload — the session cookie just changed. Land on customer dashboard.
      window.location.href = "/dashboard";
    } catch {
      setImpersonateError("Failed to start impersonation");
    } finally {
      setImpersonateLoading(false);
    }
  };

  const reload = async () => {
    const res = await fetch(`/api/admin/users/${id}`);
    if (res.ok) setData(await res.json());
  };

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/admin/users/${id}`);
        if (res.status === 404) {
          setError("User not found.");
          return;
        }
        if (!res.ok) throw new Error("Failed");
        const json = await res.json();
        setData(json);
      } catch {
        setError("Failed to load user.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  useEffect(() => {
    const load = async () => {
      setTimelineLoading(true);
      try {
        const res = await fetch(`/api/admin/users/${id}/timeline`);
        if (!res.ok) return;
        const json = await res.json();
        setTimeline(json.events || []);
      } finally {
        setTimelineLoading(false);
      }
    };
    load();
  }, [id]);

  const handleSuspend = async () => {
    const reason = suspendReason.trim();
    if (!reason) {
      setSuspendError("Reason is required");
      return;
    }
    setSuspendLoading(true);
    setSuspendError(null);
    try {
      const res = await fetch(`/api/admin/users/${id}/suspend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setSuspendError(body.error || "Failed to suspend");
        return;
      }
      setSuspendOpen(false);
      setSuspendReason("");
      await reload();
    } catch {
      setSuspendError("Failed to suspend");
    } finally {
      setSuspendLoading(false);
    }
  };

  const handleUnsuspend = async () => {
    setUnsuspendLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${id}/unsuspend`, { method: "POST" });
      if (res.ok) await reload();
    } finally {
      setUnsuspendLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-rose-600 animate-spin" />
      </div>
    );
  }
  if (error || !data) {
    return (
      <div>
        <Link href="/admin/users" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-rose-600 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to users
        </Link>
        <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-sm text-red-700">
          {error || "No data."}
        </div>
      </div>
    );
  }

  const { user, guestRsvp, providers, lastSessionExpires } = data;
  const totalSpent = user.orders
    .filter((o) => o.paymentStatus === "COMPLETED")
    .reduce((sum, o) => sum + parseFloat(o.amount), 0);

  return (
    <div>
      <Link href="/admin/users" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-rose-600 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to users
      </Link>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 text-xl font-bold flex-shrink-0">
            {user.yourName?.charAt(0)?.toUpperCase() || user.email.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gray-900">
              {user.yourName || "—"}
              {user.partnerName && <span className="text-gray-500 font-normal"> & {user.partnerName}</span>}
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">{user.email}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${planBadge[user.plan]}`}>
                {user.plan}
              </span>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${roleBadge[user.role]}`}>
                {user.role}
              </span>
              {user.suspendedAt && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                  <Ban className="w-3 h-3" /> Suspended
                </span>
              )}
              {user.emailVerified ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                  <CheckCircle2 className="w-3 h-3" /> Email verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                  <XCircle className="w-3 h-3" /> Email not verified
                </span>
              )}
              {providers.map((p) => (
                <span key={p} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                  <Shield className="w-3 h-3" /> {p}
                </span>
              ))}
            </div>
          </div>
          {user.role !== "ADMIN" && (
            <div className="flex-shrink-0 flex flex-col sm:flex-row gap-2">
              {!user.suspendedAt && (
                <button
                  onClick={startImpersonation}
                  disabled={impersonateLoading}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-sm font-medium hover:bg-blue-100 transition-colors disabled:opacity-50"
                  title="Log into the app as this customer for support purposes"
                >
                  {impersonateLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                  Impersonate
                </button>
              )}
              {user.suspendedAt ? (
                <button
                  onClick={handleUnsuspend}
                  disabled={unsuspendLoading}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium hover:bg-emerald-100 transition-colors disabled:opacity-50"
                >
                  {unsuspendLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserCheck className="w-4 h-4" />}
                  Unsuspend
                </button>
              ) : (
                <button
                  onClick={() => {
                    setSuspendError(null);
                    setSuspendReason("");
                    setSuspendOpen(true);
                  }}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-sm font-medium hover:bg-amber-100 transition-colors"
                >
                  <Ban className="w-4 h-4" /> Suspend
                </button>
              )}
            </div>
          )}
        </div>
        {impersonateError && (
          <p className="mt-3 text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{impersonateError}</p>
        )}
        {user.suspendedAt && user.suspendedReason && (
          <div className="mt-4 bg-red-50 border border-red-100 rounded-xl p-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-red-700">Suspension reason</p>
            <p className="text-sm text-gray-900 mt-1 whitespace-pre-wrap">{user.suspendedReason}</p>
            <p className="text-xs text-gray-500 mt-2">
              Suspended since {new Date(user.suspendedAt).toLocaleString()}
            </p>
          </div>
        )}
      </div>

      {/* Contact + meta */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Contact</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-400" />
              <span className="text-gray-700 truncate">{user.email}</span>
            </div>
            {user.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-gray-700">{user.phone}</span>
              </div>
            )}
            {user.weddingDate && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-gray-700">{formatDate(user.weddingDate)}</span>
              </div>
            )}
          </dl>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Account</h2>
          <dl className="space-y-2 text-sm">
            <div>
              <dt className="text-xs text-gray-400">Joined</dt>
              <dd className="text-gray-900">{formatDate(user.createdAt, true)}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-400">Last session expires</dt>
              <dd className="text-gray-900">{lastSessionExpires ? formatDate(lastSessionExpires, true) : "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-400">User ID</dt>
              <dd className="text-gray-500 font-mono text-xs">{user.id}</dd>
            </div>
          </dl>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Activity</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Invitations</span>
              <span className="font-semibold text-gray-900">{user.invitations.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Guests</span>
              <span className="font-semibold text-gray-900">{user._count.guests}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Tasks</span>
              <span className="font-semibold text-gray-900">{user._count.tasks}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Vendors</span>
              <span className="font-semibold text-gray-900">{user._count.vendors}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Budget items</span>
              <span className="font-semibold text-gray-900">{user._count.budgetItems}</span>
            </div>
          </dl>
        </div>
      </div>

      {/* RSVP + revenue */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <div className="bg-emerald-50 rounded-xl border border-emerald-100 p-3">
          <p className="text-xs text-emerald-700 uppercase tracking-wider">Accepted</p>
          <p className="text-lg font-bold text-gray-900 mt-0.5">{guestRsvp.ACCEPTED}</p>
        </div>
        <div className="bg-amber-50 rounded-xl border border-amber-100 p-3">
          <p className="text-xs text-amber-700 uppercase tracking-wider">Pending</p>
          <p className="text-lg font-bold text-gray-900 mt-0.5">{guestRsvp.PENDING}</p>
        </div>
        <div className="bg-red-50 rounded-xl border border-red-100 p-3">
          <p className="text-xs text-red-700 uppercase tracking-wider">Declined</p>
          <p className="text-lg font-bold text-gray-900 mt-0.5">{guestRsvp.DECLINED}</p>
        </div>
        <div className="bg-gray-50 rounded-xl border border-gray-100 p-3">
          <p className="text-xs text-gray-600 uppercase tracking-wider">Maybe</p>
          <p className="text-lg font-bold text-gray-900 mt-0.5">{guestRsvp.MAYBE}</p>
        </div>
        <div className="bg-blue-50 rounded-xl border border-blue-100 p-3">
          <p className="text-xs text-blue-700 uppercase tracking-wider">Total spent</p>
          <p className="text-lg font-bold text-gray-900 mt-0.5">{formatMoney(String(totalSpent))}</p>
        </div>
      </div>

      {/* Invitations */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Heart className="w-4 h-4 text-rose-500" /> Wedding sites ({user.invitations.length})
        </h2>
        {user.invitations.length === 0 ? (
          <p className="text-sm text-gray-400 py-6 text-center">No invitation sites.</p>
        ) : (
          <div className="space-y-3">
            {user.invitations.map((inv) => (
              <div key={inv.id} className="flex items-start justify-between gap-3 p-3 rounded-xl border border-gray-100 hover:border-rose-100 transition-colors">
                <div className="flex-1 min-w-0">
                  <Link href={`/admin/weddings/${inv.id}`} className="font-medium text-gray-900 hover:text-rose-600">
                    {inv.groomName} & {inv.brideName}
                  </Link>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-1">
                    <span className="font-mono">/w/{inv.slug}</span>
                    <span>·</span>
                    <span>{formatDate(inv.weddingDate)}</span>
                    <span>·</span>
                    <span>{inv._count.events} events</span>
                    <span>·</span>
                    <span>{inv._count.pageViews} views</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${inv.isPublished ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"}`}>
                    {inv.isPublished ? "Live" : "Draft"}
                  </span>
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${inv.isPaid ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>
                    {inv.isPaid ? "Paid" : "Unpaid"}
                  </span>
                  <Link href={`/w/${inv.slug}`} target="_blank"
                    className="inline-flex items-center gap-1 text-xs text-rose-600 hover:underline ml-2">
                    Open <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Orders */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-blue-500" /> Orders ({user.orders.length})
        </h2>
        {user.orders.length === 0 ? (
          <p className="text-sm text-gray-400 py-6 text-center">No orders.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-xs text-gray-500">
                  <th className="text-left py-2 font-medium uppercase tracking-wider">Date</th>
                  <th className="text-left py-2 font-medium uppercase tracking-wider">Plan</th>
                  <th className="text-left py-2 font-medium uppercase tracking-wider">Method</th>
                  <th className="text-left py-2 font-medium uppercase tracking-wider">Status</th>
                  <th className="text-right py-2 font-medium uppercase tracking-wider">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {user.orders.map((o) => (
                  <tr key={o.id}>
                    <td className="py-2 text-gray-500 text-xs">{formatDate(o.createdAt, true)}</td>
                    <td className="py-2 text-gray-900">{o.plan}</td>
                    <td className="py-2 text-gray-500 text-xs">{o.paymentMethod.replace(/_/g, " ")}</td>
                    <td className="py-2">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${statusBadge[o.paymentStatus]}`}>{o.paymentStatus}</span>
                    </td>
                    <td className="py-2 text-right font-medium text-gray-900">{formatMoney(o.amount, o.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Activity timeline */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mt-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-gray-500" /> Activity timeline
          <span className="text-xs font-normal text-gray-400 ml-1">({timeline.length})</span>
        </h2>
        {timelineLoading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="w-5 h-5 text-rose-600 animate-spin" />
          </div>
        ) : timeline.length === 0 ? (
          <p className="text-sm text-gray-400 py-6 text-center">No activity recorded.</p>
        ) : (
          <ol className="relative border-l border-gray-200 ml-2 space-y-4">
            {timeline.map((e, i) => {
              const meta = timelineMeta[e.type] ?? { icon: Activity, color: "bg-gray-100 text-gray-700" };
              const Icon = meta.icon;
              return (
                <li key={`${e.type}-${e.at}-${i}`} className="ml-6">
                  <span className={`absolute -left-3 flex items-center justify-center w-6 h-6 rounded-full ${meta.color} ring-2 ring-white`}>
                    <Icon className="w-3 h-3" />
                  </span>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900">{e.summary}</p>
                      {e.detail && (
                        <p className="text-xs text-gray-500 mt-0.5 break-words">{e.detail}</p>
                      )}
                      {e.actorEmail && (
                        <p className="text-xs text-gray-400 mt-0.5 font-mono">by {e.actorEmail}</p>
                      )}
                    </div>
                    <time className="text-xs text-gray-400 flex-shrink-0 whitespace-nowrap" title={new Date(e.at).toLocaleString()}>
                      {formatDate(e.at, true)}
                    </time>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>

      {/* Suspend modal */}
      {suspendOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => !suspendLoading && setSuspendOpen(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0">
                <Ban className="w-5 h-5 text-amber-700" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900">Suspend user?</h3>
                <p className="text-sm text-gray-500 mt-1">
                  <span className="font-medium text-gray-900">{user.yourName || user.email}</span>
                  {" — "}
                  <span className="text-gray-500">{user.email}</span>
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Suspended users can&apos;t log in or access any customer routes. Data stays intact. The reason below is shown on their /suspended page.
                </p>
              </div>
              <button
                onClick={() => !suspendLoading && setSuspendOpen(false)}
                className="text-gray-400 hover:text-gray-600"
                disabled={suspendLoading}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <label className="block mt-2">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Reason (visible to the user)</span>
              <textarea
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                disabled={suspendLoading}
                maxLength={500}
                rows={3}
                placeholder="e.g., Repeated policy violations"
                className="mt-2 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
              <span className="text-xs text-gray-400">{suspendReason.length} / 500</span>
            </label>

            {suspendError && (
              <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2 mt-3">{suspendError}</p>
            )}

            <div className="flex gap-3 justify-end mt-4">
              <button
                onClick={() => setSuspendOpen(false)}
                disabled={suspendLoading}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSuspend}
                disabled={suspendLoading || !suspendReason.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-xl hover:bg-amber-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {suspendLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                Suspend user
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
