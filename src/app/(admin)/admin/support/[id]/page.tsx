"use client";

import { useState, useEffect, use, useCallback } from "react";
import Link from "next/link";
import {
  Loader2, ArrowLeft, Send, ShieldCheck, User as UserIcon,
  Lock, Mail, Phone, Calendar,
} from "lucide-react";

interface Reply {
  id: string;
  message: string;
  isInternal: boolean;
  createdAt: string;
  author: { id: string; email: string; yourName: string | null; role: string };
}

interface Ticket {
  id: string;
  subject: string;
  status: "OPEN" | "PENDING" | "RESOLVED" | "CLOSED";
  priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    yourName: string | null;
    partnerName: string | null;
    plan: string;
    phone: string | null;
    createdAt: string;
  } | null;
  replies: Reply[];
}

const statusBadge: Record<string, string> = {
  OPEN: "bg-blue-100 text-blue-700",
  PENDING: "bg-amber-100 text-amber-700",
  RESOLVED: "bg-emerald-100 text-emerald-700",
  CLOSED: "bg-gray-100 text-gray-600",
};

const priorityBadge: Record<string, string> = {
  LOW: "bg-gray-100 text-gray-600",
  NORMAL: "bg-blue-50 text-blue-700",
  HIGH: "bg-amber-100 text-amber-700",
  URGENT: "bg-red-100 text-red-700",
};

const planBadge: Record<string, string> = {
  FREE: "bg-gray-100 text-gray-600",
  BASIC: "bg-blue-100 text-blue-700",
  STANDARD: "bg-amber-100 text-amber-700",
  PREMIUM: "bg-rose-100 text-rose-700",
};

function formatDate(d: string) {
  return new Date(d).toLocaleString(undefined, {
    month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit",
  });
}

export default function AdminSupportThreadPage(
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = use(params);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [sending, setSending] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);
  const [metaLoading, setMetaLoading] = useState<"status" | "priority" | null>(null);
  const [metaError, setMetaError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/support/${id}`);
      if (res.status === 404) {
        setError("Ticket not found.");
        return;
      }
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setTicket(data.ticket);
    } catch {
      setError("Failed to load ticket");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const updateMeta = async (field: "status" | "priority", value: string) => {
    setMetaLoading(field);
    setMetaError(null);
    try {
      const res = await fetch(`/api/admin/support/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setMetaError(body.error || `Failed to update ${field}`);
        return;
      }
      await load();
    } catch {
      setMetaError(`Failed to update ${field}`);
    } finally {
      setMetaLoading(null);
    }
  };

  const send = async () => {
    const message = reply.trim();
    if (!message) return;
    setSending(true);
    setReplyError(null);
    try {
      const res = await fetch(`/api/admin/support/${id}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, isInternal }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setReplyError(data.error || "Failed to send reply");
        return;
      }
      setReply("");
      setIsInternal(false);
      await load();
    } catch {
      setReplyError("Failed to send reply");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-rose-600 animate-spin" />
      </div>
    );
  }
  if (error || !ticket) {
    return (
      <div>
        <Link href="/admin/support" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-rose-600 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to support
        </Link>
        <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-sm text-red-700">{error || "No data."}</div>
      </div>
    );
  }

  return (
    <div>
      <Link href="/admin/support" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-rose-600 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to support
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <h1 className="text-xl font-bold text-gray-900">{ticket.subject}</h1>
                <p className="text-xs text-gray-400 mt-1">Opened {formatDate(ticket.createdAt)}</p>
              </div>
            </div>
            {metaError && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mt-2">
                {metaError}
              </p>
            )}
            <div className="flex flex-wrap gap-2 mt-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Status:</span>
                <select
                  value={ticket.status}
                  onChange={(e) => updateMeta("status", e.target.value)}
                  disabled={metaLoading === "status"}
                  aria-label="Ticket status"
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-500/20 ${statusBadge[ticket.status]}`}
                >
                  {["OPEN", "PENDING", "RESOLVED", "CLOSED"].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Priority:</span>
                <select
                  value={ticket.priority}
                  onChange={(e) => updateMeta("priority", e.target.value)}
                  disabled={metaLoading === "priority"}
                  aria-label="Ticket priority"
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-500/20 ${priorityBadge[ticket.priority]}`}
                >
                  {["LOW", "NORMAL", "HIGH", "URGENT"].map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            {ticket.replies.map((r) => {
              const isAdmin = r.author.role === "ADMIN";
              if (r.isInternal) {
                return (
                  <div key={r.id} className="rounded-2xl p-4 bg-yellow-50 border border-yellow-200">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Lock className="w-3.5 h-3.5 text-yellow-700" />
                      <p className="text-xs font-semibold text-yellow-900">Internal note · {r.author.yourName || r.author.email}</p>
                      <p className="text-xs text-yellow-700">· {formatDate(r.createdAt)}</p>
                    </div>
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">{r.message}</p>
                  </div>
                );
              }
              return (
                <div key={r.id} className={`rounded-2xl p-4 ${isAdmin ? "bg-rose-50 border border-rose-100" : "bg-white border border-gray-100"}`}>
                  <div className="flex items-center gap-2 mb-1.5">
                    {isAdmin ? <ShieldCheck className="w-3.5 h-3.5 text-rose-600" /> : <UserIcon className="w-3.5 h-3.5 text-gray-500" />}
                    <p className="text-xs font-semibold text-gray-700">
                      {isAdmin ? "INVITATION.LK Support" : r.author.yourName || r.author.email}
                    </p>
                    <p className="text-xs text-gray-400">· {formatDate(r.createdAt)}</p>
                  </div>
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">{r.message}</p>
                </div>
              );
            })}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              disabled={sending}
              placeholder={isInternal ? "Type an internal note (customer won't see this)…" : "Type your reply to the customer…"}
              maxLength={10000}
              rows={4}
              className={`w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 ${isInternal ? "border-yellow-300 bg-yellow-50/50 focus:border-yellow-500" : "border-gray-200 focus:border-rose-500"}`}
            />
            <div className="flex items-center justify-between mt-3">
              <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isInternal}
                  onChange={(e) => setIsInternal(e.target.checked)}
                  disabled={sending}
                  className="w-4 h-4 rounded border-gray-300 text-rose-600 focus:ring-rose-500/30"
                />
                <Lock className="w-3.5 h-3.5 text-yellow-700" />
                Internal note (admins only)
              </label>
              {replyError && (
                <p className="text-xs text-red-600">{replyError}</p>
              )}
              <button
                onClick={send}
                disabled={sending || !reply.trim()}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-medium transition-colors disabled:opacity-50 ${isInternal ? "bg-yellow-600 hover:bg-yellow-700" : "bg-rose-600 hover:bg-rose-700"}`}
              >
                {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                {isInternal ? "Save note" : "Send reply"}
              </button>
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Customer</h2>
            {ticket.user ? (
              <dl className="space-y-2 text-sm">
                <div>
                  <dt className="text-xs text-gray-400">Name</dt>
                  <dd>
                    <Link href={`/admin/users/${ticket.user.id}`} className="text-gray-900 font-medium hover:text-rose-600">
                      {ticket.user.yourName || "—"}
                    </Link>
                    {ticket.user.partnerName && <span className="text-xs text-gray-500"> & {ticket.user.partnerName}</span>}
                  </dd>
                </div>
                <div className="flex items-start gap-2">
                  <Mail className="w-4 h-4 text-gray-400 mt-0.5" />
                  <span className="text-gray-700 truncate">{ticket.user.email}</span>
                </div>
                {ticket.user.phone && (
                  <div className="flex items-start gap-2">
                    <Phone className="w-4 h-4 text-gray-400 mt-0.5" />
                    <span className="text-gray-700">{ticket.user.phone}</span>
                  </div>
                )}
                <div className="flex items-start gap-2">
                  <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                  <span className="text-gray-700">Joined {new Date(ticket.user.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="pt-2">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${planBadge[ticket.user.plan] || "bg-gray-100 text-gray-600"}`}>
                    {ticket.user.plan}
                  </span>
                </div>
              </dl>
            ) : (
              <p className="text-sm text-amber-600">Orphaned — customer account no longer exists.</p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
