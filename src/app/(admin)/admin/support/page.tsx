"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Loader2, LifeBuoy, Search, MessageCircle } from "lucide-react";

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

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <LifeBuoy className="w-6 h-6 text-rose-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Support tickets</h1>
          <p className="text-gray-400 mt-1">All customer tickets across the platform.</p>
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
              {tickets.map((t) => (
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
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusBadge[t.status]}`}>{t.status}</span>
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${priorityBadge[t.priority]}`}>{t.priority}</span>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
