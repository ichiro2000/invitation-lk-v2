"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  Loader2, ArrowLeft, ExternalLink, Eye, Calendar, MapPin,
  Mail, Phone, Globe, FileText, Users as UsersIcon, Heart,
} from "lucide-react";

interface WeddingDetail {
  invitation: {
    id: string;
    slug: string;
    templateSlug: string;
    groomName: string;
    brideName: string;
    weddingDate: string;
    venue: string;
    venueAddress: string | null;
    config: unknown;
    isPublished: boolean;
    isPaid: boolean;
    createdAt: string;
    updatedAt: string;
    user: {
      id: string; email: string; yourName: string | null; partnerName: string | null;
      phone: string | null; plan: string; role: string; emailVerified: string | null;
      createdAt: string;
    };
    events: {
      id: string; title: string; time: string;
      venue: string | null; description: string | null;
    }[];
    _count: { pageViews: number };
  };
  guests: {
    id: string; name: string; email: string | null; whatsapp: string | null;
    rsvpStatus: "PENDING" | "ACCEPTED" | "DECLINED" | "MAYBE";
    headCount: number; confirmedCount: number;
    category: string; side: string;
    inviteSent: boolean; linkOpened: boolean;
    createdAt: string;
  }[];
  guestSummary: {
    PENDING: number; ACCEPTED: number; DECLINED: number; MAYBE: number; total: number;
  };
  orders: {
    id: string; plan: string; amount: string; currency: string;
    paymentMethod: string; paymentStatus: string; createdAt: string;
  }[];
  pageViews30d: number;
}

const rsvpBadge: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  ACCEPTED: "bg-emerald-100 text-emerald-700",
  DECLINED: "bg-red-100 text-red-700",
  MAYBE: "bg-gray-100 text-gray-600",
};

const statusBadge: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  FAILED: "bg-red-100 text-red-700",
  REFUNDED: "bg-gray-100 text-gray-600",
};

const planBadge: Record<string, string> = {
  FREE: "bg-gray-100 text-gray-600",
  BASIC: "bg-blue-100 text-blue-700",
  STANDARD: "bg-amber-100 text-amber-700",
  PREMIUM: "bg-rose-100 text-rose-700",
};

function formatDate(d: string, withTime = false) {
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

export default function AdminWeddingDetailPage(
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = use(params);
  const [data, setData] = useState<WeddingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/admin/weddings/${id}`);
        if (res.status === 404) {
          setError("Wedding not found.");
          return;
        }
        if (!res.ok) throw new Error("Failed");
        const json = await res.json();
        setData(json);
      } catch {
        setError("Failed to load wedding.");
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
        <Link href="/admin/weddings" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-rose-600 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to weddings
        </Link>
        <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-sm text-red-700">
          {error || "No data."}
        </div>
      </div>
    );
  }

  const { invitation, guests, guestSummary, orders, pageViews30d } = data;

  return (
    <div>
      <Link href="/admin/weddings" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-rose-600 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to weddings
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {invitation.groomName} & {invitation.brideName}
          </h1>
          <p className="text-gray-400 mt-1 font-mono text-sm">/i/{invitation.slug}</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/i/${invitation.slug}`} target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium transition-colors">
            <Eye className="w-4 h-4" /> Preview site <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <Link href={`/admin/users/${invitation.user.id}`}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 hover:border-rose-200 hover:text-rose-600 text-gray-700 text-sm font-medium transition-colors">
            View owner
          </Link>
        </div>
      </div>

      {/* Status row */}
      <div className="flex flex-wrap gap-2 mb-8">
        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${invitation.isPublished ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"}`}>
          {invitation.isPublished ? "Live" : "Draft"}
        </span>
        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${invitation.isPaid ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>
          {invitation.isPaid ? "Paid" : "Unpaid"}
        </span>
        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${planBadge[invitation.user.plan]}`}>
          {invitation.user.plan} plan
        </span>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-violet-100 text-violet-700">
          <Globe className="w-3 h-3" /> Template: {invitation.templateSlug}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Wedding info */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 lg:col-span-2">
          <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-500" /> Wedding details
          </h2>
          <dl className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <dt className="text-xs text-gray-400">Wedding date</dt>
                <dd className="text-gray-900 font-medium">{formatDate(invitation.weddingDate)}</dd>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <dt className="text-xs text-gray-400">Venue</dt>
                <dd className="text-gray-900 font-medium">{invitation.venue || "—"}</dd>
                {invitation.venueAddress && (
                  <dd className="text-xs text-gray-500 mt-0.5">{invitation.venueAddress}</dd>
                )}
              </div>
            </div>
            <div className="flex items-start gap-2">
              <FileText className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <dt className="text-xs text-gray-400">Created</dt>
                <dd className="text-gray-900 text-sm">{formatDate(invitation.createdAt, true)}</dd>
                <dd className="text-xs text-gray-500">Updated {formatDate(invitation.updatedAt, true)}</dd>
              </div>
            </div>
          </dl>
        </div>

        {/* Owner */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <UsersIcon className="w-4 h-4 text-blue-500" /> Account owner
          </h2>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-xs text-gray-400">Name</dt>
              <dd className="text-gray-900 font-medium">{invitation.user.yourName || "—"}</dd>
              {invitation.user.partnerName && (
                <dd className="text-xs text-gray-500">& {invitation.user.partnerName}</dd>
              )}
            </div>
            <div className="flex items-start gap-2">
              <Mail className="w-4 h-4 text-gray-400 mt-0.5" />
              <div className="min-w-0 flex-1">
                <dt className="text-xs text-gray-400">Email</dt>
                <dd className="text-gray-900 text-sm truncate">{invitation.user.email}</dd>
                <dd className="text-xs mt-0.5">
                  {invitation.user.emailVerified ? (
                    <span className="text-emerald-600">Verified</span>
                  ) : (
                    <span className="text-amber-600">Not verified</span>
                  )}
                </dd>
              </div>
            </div>
            {invitation.user.phone && (
              <div className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-gray-400 mt-0.5" />
                <div>
                  <dt className="text-xs text-gray-400">Phone</dt>
                  <dd className="text-gray-900 text-sm">{invitation.user.phone}</dd>
                </div>
              </div>
            )}
            <div>
              <dt className="text-xs text-gray-400">Member since</dt>
              <dd className="text-gray-900 text-sm">{formatDate(invitation.user.createdAt)}</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
        <div className="bg-white rounded-xl border border-gray-100 p-3">
          <p className="text-xs text-gray-400 uppercase tracking-wider">Guests</p>
          <p className="text-lg font-bold text-gray-900 mt-0.5">{guestSummary.total}</p>
        </div>
        <div className="bg-emerald-50 rounded-xl border border-emerald-100 p-3">
          <p className="text-xs text-emerald-700 uppercase tracking-wider">Accepted</p>
          <p className="text-lg font-bold text-gray-900 mt-0.5">{guestSummary.ACCEPTED}</p>
        </div>
        <div className="bg-amber-50 rounded-xl border border-amber-100 p-3">
          <p className="text-xs text-amber-700 uppercase tracking-wider">Pending</p>
          <p className="text-lg font-bold text-gray-900 mt-0.5">{guestSummary.PENDING}</p>
        </div>
        <div className="bg-blue-50 rounded-xl border border-blue-100 p-3">
          <p className="text-xs text-blue-700 uppercase tracking-wider">Page views (all)</p>
          <p className="text-lg font-bold text-gray-900 mt-0.5">{invitation._count.pageViews}</p>
        </div>
        <div className="bg-violet-50 rounded-xl border border-violet-100 p-3">
          <p className="text-xs text-violet-700 uppercase tracking-wider">Views 30d</p>
          <p className="text-lg font-bold text-gray-900 mt-0.5">{pageViews30d}</p>
        </div>
      </div>

      {/* Events */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Events ({invitation.events.length})</h2>
        {invitation.events.length === 0 ? (
          <p className="text-sm text-gray-400 py-6 text-center">No events configured.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {invitation.events.map((e) => (
              <div key={e.id} className="py-3 first:pt-0 last:pb-0">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-gray-900">{e.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{e.time}{e.venue ? ` · ${e.venue}` : ""}</p>
                    {e.description && <p className="text-xs text-gray-400 mt-1">{e.description}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Guests */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-900">Recent guests ({guests.length}{guestSummary.total > guests.length ? ` of ${guestSummary.total}` : ""})</h2>
          <Link href={`/admin/guests?search=${encodeURIComponent(invitation.user.email)}`}
            className="text-xs text-rose-600 font-medium hover:underline">
            See all in Guests →
          </Link>
        </div>
        {guests.length === 0 ? (
          <p className="text-sm text-gray-400 py-6 text-center">No guests yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-xs text-gray-500">
                  <th className="text-left py-2 font-medium uppercase tracking-wider">Name</th>
                  <th className="text-left py-2 font-medium uppercase tracking-wider">Contact</th>
                  <th className="text-left py-2 font-medium uppercase tracking-wider">Category</th>
                  <th className="text-left py-2 font-medium uppercase tracking-wider">RSVP</th>
                  <th className="text-left py-2 font-medium uppercase tracking-wider">Heads</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {guests.map((g) => (
                  <tr key={g.id}>
                    <td className="py-2 text-gray-900 font-medium">{g.name}</td>
                    <td className="py-2 text-gray-500 text-xs">{g.email || g.whatsapp || "—"}</td>
                    <td className="py-2 text-gray-500 text-xs">{g.category} / {g.side}</td>
                    <td className="py-2">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${rsvpBadge[g.rsvpStatus]}`}>{g.rsvpStatus}</span>
                    </td>
                    <td className="py-2 text-gray-600">{g.confirmedCount} / {g.headCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Orders */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Orders for this account ({orders.length})</h2>
        {orders.length === 0 ? (
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
                {orders.map((o) => (
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
