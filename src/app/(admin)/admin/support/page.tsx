"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Loader2, LifeBuoy, Search, MessageCircle, Clock, CheckCircle2 } from "lucide-react";

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
    plan: string;
  } | null;
  _count: { replies: number };
  firstAdminReplyAt: string | null;
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

type StatusFilter = "" | "OPEN" | "PENDING" | "RESOLVED" | "CLOSED";
type PriorityFilter = "" | "LOW" | "NORMAL" | "HIGH" | "URGENT";

const statusFilters: { value: StatusFilter; label: string }[] = [
  { value: "", label: "All" },
  { value: "OPEN", label: "Open" },
  { value: "PENDING", label: "Pending" },
  { value: "RESOLVED", label: "Resolved" },
  { value: "CLOSED", label: "Closed" },
];

const priorityFilters: { value: PriorityFilter; label: string }[] = [
  { value: "", label: "All priorities" },
  { value: "URGENT", label: "Urgent" },
  { value: "HIGH", label: "High" },
  { value: "NORMAL", label: "Normal" },
  { value: "LOW", label: "Low" },
];

function formatDate(d: string) {
  return new Date(d).toLocaleString(undefined, {
    month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
  });
}

// Hours between two ISO timestamps.
function hoursBetween(a: string, b: string | null): number {
  const end = b ? new Date(b).getTime() : Date.now();
  return (end - new Date(a).getTime()) / (1000 * 60 * 60);
}

function formatDuration(hours: number): string {
  if (hours < 1) return `${Math.max(1, Math.round(hours * 60))}m`;
  if (hours < 48) return `${hours.toFixed(1)}h`;
  return `${Math.round(hours / 24)}d`;
}

// Tickets that still need a first admin response are OPEN and
// firstAdminReplyAt is null. PENDING/RESOLVED/CLOSED imply an admin has
// already engaged at some point (PENDING/RESOLVED definitely; CLOSED
// skipped from SLA tracking).
function awaitsFirstResponse(t: Ticket): boolean {
  return t.status === "OPEN" && t.firstAdminReplyAt === null;
}

function ttfrTone(hours: number): { bg: string; text: string; label: string } {
  if (hours < 4) return { bg: "bg-emerald-100", text: "text-emerald-700", label: formatDuration(hours) };
  if (hours < 24) return { bg: "bg-amber-100", text: "text-amber-700", label: formatDuration(hours) };
  return { bg: "bg-red-100", text: "text-red-700", label: formatDuration(hours) };
}

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("");
  const [priority, setPriority] = useState<PriorityFilter>("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (status) params.set("status", status);
      if (priority) params.set("priority", priority);
      const qs = params.toString();
      const res = await fetch(`/api/admin/support${qs ? `?${qs}` : ""}`);
      const data = await res.json();
      setTickets(data.tickets || []);
    } catch {
      console.error("Failed to load tickets");
    } finally {
      setLoading(false);
    }
  }, [search, status, priority]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  // SLA stats across the currently-loaded tickets (respects filters).
  const awaitingCount = tickets.filter(awaitsFirstResponse).length;
  const oldestAwaitHours = tickets
    .filter(awaitsFirstResponse)
    .reduce((max, t) => Math.max(max, hoursBetween(t.createdAt, null)), 0);
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const ttfrs = tickets
    .filter((t) => t.firstAdminReplyAt && new Date(t.createdAt).getTime() >= thirtyDaysAgo)
    .map((t) => hoursBetween(t.createdAt, t.firstAdminReplyAt));
  const medianTtfr = median(ttfrs);

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <LifeBuoy className="w-6 h-6 text-rose-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Support tickets</h1>
          <p className="text-gray-400 mt-1">All customer tickets across the platform.</p>
        </div>
      </div>

      {/* SLA strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div className={`rounded-2xl border p-4 ${awaitingCount === 0 ? "bg-emerald-50 border-emerald-100" : oldestAwaitHours > 24 ? "bg-red-50 border-red-100" : "bg-amber-50 border-amber-100"}`}>
          <div className="flex items-center gap-2 mb-1">
            {awaitingCount === 0 ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <Clock className="w-4 h-4 text-amber-600" />
            )}
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-700">Awaiting first response</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{awaitingCount}</p>
          {awaitingCount > 0 && (
            <p className="text-xs text-gray-600 mt-0.5">Oldest waiting {formatDuration(oldestAwaitHours)}</p>
          )}
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-gray-500" />
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Median TTFR · last 30 days</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {medianTtfr === null ? "—" : formatDuration(medianTtfr)}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">{ttfrs.length} ticket{ttfrs.length === 1 ? "" : "s"} in sample</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-4">
          <div className="flex items-center gap-2 mb-1">
            <LifeBuoy className="w-4 h-4 text-gray-500" />
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Total shown</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{tickets.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">matching current filters</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search subject, customer name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1">
            {statusFilters.map((f) => (
              <button
                key={f.value}
                onClick={() => setStatus(f.value)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${status === f.value ? "bg-rose-600 text-white" : "text-gray-600 hover:bg-gray-50"}`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as PriorityFilter)}
            className="px-3 py-1.5 border border-gray-200 rounded-xl bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
          >
            {priorityFilters.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-rose-600 animate-spin" />
        </div>
      ) : tickets.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <LifeBuoy className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No tickets match these filters.</p>
        </div>
      ) : (
        <>
          <p className="text-xs text-gray-400 mb-3">{tickets.length} {tickets.length === 1 ? "ticket" : "tickets"}</p>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <ul className="divide-y divide-gray-100">
              {tickets.map((t) => {
                const awaiting = awaitsFirstResponse(t);
                const ttfrHours = t.firstAdminReplyAt
                  ? hoursBetween(t.createdAt, t.firstAdminReplyAt)
                  : awaiting
                    ? hoursBetween(t.createdAt, null)
                    : null;
                const tone = ttfrHours !== null ? ttfrTone(ttfrHours) : null;
                return (
                <li key={t.id}>
                  <Link href={`/admin/support/${t.id}`} className="block px-5 py-4 hover:bg-gray-50/60 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 truncate">{t.subject}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-gray-500">
                          <span className="truncate max-w-[260px]">
                            {t.user ? (t.user.yourName || t.user.email) : <span className="text-amber-600">(orphaned)</span>}
                          </span>
                          {t.user && (
                            <>
                              <span>·</span>
                              <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${planBadge[t.user.plan] || "bg-gray-100 text-gray-600"}`}>{t.user.plan}</span>
                            </>
                          )}
                          <span>·</span>
                          <span className="inline-flex items-center gap-1">
                            <MessageCircle className="w-3 h-3" /> {t._count.replies}
                          </span>
                          <span>·</span>
                          <span>Updated {formatDate(t.updatedAt)}</span>
                          {tone && (
                            <>
                              <span>·</span>
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${tone.bg} ${tone.text}`}
                                title={awaiting ? "Waiting for first admin response" : "Time to first admin response"}
                              >
                                <Clock className="w-3 h-3" />
                                {awaiting ? "waiting " : ""}{tone.label}
                              </span>
                            </>
                          )}
                          {!tone && t.status !== "OPEN" && (
                            <>
                              <span>·</span>
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-500">
                                <CheckCircle2 className="w-3 h-3" />
                                responded
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusBadge[t.status]}`}>{t.status}</span>
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${priorityBadge[t.priority]}`}>{t.priority}</span>
                      </div>
                    </div>
                  </Link>
                </li>
                );
              })}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
