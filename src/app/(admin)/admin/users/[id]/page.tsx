"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  Loader2, ArrowLeft, Mail, Phone, CheckCircle2, XCircle,
  Calendar, Shield, Heart, CreditCard, ExternalLink,
} from "lucide-react";

interface UserDetail {
  user: {
    id: string; email: string;
    yourName: string | null; partnerName: string | null;
    weddingDate: string | null; venue: string | null;
    phone: string | null; image: string | null;
    role: string; plan: string;
    emailVerified: string | null;
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
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
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
        </div>
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
    </div>
  );
}
