"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, UserPlus, Search, Download, Mail, Check } from "lucide-react";

interface Guest {
  id: string;
  name: string;
  email: string | null;
  whatsapp: string | null;
  inviteType: string;
  headCount: number;
  confirmedCount: number;
  category: string;
  side: string;
  rsvpStatus: "PENDING" | "ACCEPTED" | "DECLINED" | "MAYBE";
  inviteSent: boolean;
  linkOpened: boolean;
  linkOpenedAt: string | null;
  createdAt: string;
  user: {
    id: string;
    email: string;
    yourName: string | null;
    partnerName: string | null;
  } | null;
}

type RsvpFilter = "" | "PENDING" | "ACCEPTED" | "DECLINED" | "MAYBE";

const rsvpBadge: Record<Guest["rsvpStatus"], string> = {
  PENDING: "bg-amber-100 text-amber-700",
  ACCEPTED: "bg-emerald-100 text-emerald-700",
  DECLINED: "bg-red-100 text-red-700",
  MAYBE: "bg-gray-100 text-gray-600",
};

const filters: { value: RsvpFilter; label: string }[] = [
  { value: "", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "ACCEPTED", label: "Accepted" },
  { value: "DECLINED", label: "Declined" },
  { value: "MAYBE", label: "Maybe" },
];

export default function AdminGuestsPage() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [rsvpFilter, setRsvpFilter] = useState<RsvpFilter>("");

  const buildQuery = useCallback(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (rsvpFilter) params.set("rsvp", rsvpFilter);
    return params.toString();
  }, [search, rsvpFilter]);

  const fetchGuests = useCallback(async () => {
    setLoading(true);
    try {
      const qs = buildQuery();
      const res = await fetch(`/api/admin/guests${qs ? `?${qs}` : ""}`);
      const data = await res.json();
      setGuests(data.guests || []);
    } catch {
      console.error("Failed to fetch guests");
    } finally {
      setLoading(false);
    }
  }, [buildQuery]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchGuests();
    }, 300);
    return () => clearTimeout(timeout);
  }, [fetchGuests]);

  const handleExport = () => {
    const qs = buildQuery();
    const sep = qs ? "&" : "";
    window.location.href = `/api/admin/guests?${qs}${sep}format=csv`;
  };

  const totals = {
    all: guests.length,
    accepted: guests.filter((g) => g.rsvpStatus === "ACCEPTED").length,
    pending: guests.filter((g) => g.rsvpStatus === "PENDING").length,
    declined: guests.filter((g) => g.rsvpStatus === "DECLINED").length,
    maybe: guests.filter((g) => g.rsvpStatus === "MAYBE").length,
    confirmedHeadCount: guests.reduce((sum, g) => sum + (g.confirmedCount || 0), 0),
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Guests & RSVPs</h1>
          <p className="text-gray-400 mt-1">Master guest list across every couple on the platform.</p>
        </div>
        <button
          onClick={handleExport}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white hover:border-rose-200 hover:text-rose-600 text-sm font-medium text-gray-700 transition-colors"
        >
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 p-3">
          <p className="text-xs text-gray-400 uppercase tracking-wider">Total</p>
          <p className="text-lg font-bold text-gray-900 mt-0.5">{totals.all}</p>
        </div>
        <div className="bg-emerald-50 rounded-xl border border-emerald-100 p-3">
          <p className="text-xs text-emerald-700 uppercase tracking-wider">Accepted</p>
          <p className="text-lg font-bold text-gray-900 mt-0.5">{totals.accepted}</p>
        </div>
        <div className="bg-amber-50 rounded-xl border border-amber-100 p-3">
          <p className="text-xs text-amber-700 uppercase tracking-wider">Pending</p>
          <p className="text-lg font-bold text-gray-900 mt-0.5">{totals.pending}</p>
        </div>
        <div className="bg-red-50 rounded-xl border border-red-100 p-3">
          <p className="text-xs text-red-700 uppercase tracking-wider">Declined</p>
          <p className="text-lg font-bold text-gray-900 mt-0.5">{totals.declined}</p>
        </div>
        <div className="bg-blue-50 rounded-xl border border-blue-100 p-3">
          <p className="text-xs text-blue-700 uppercase tracking-wider">Confirmed heads</p>
          <p className="text-lg font-bold text-gray-900 mt-0.5">{totals.confirmedHeadCount}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search guest, email, phone, or couple..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
          />
        </div>
        <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setRsvpFilter(f.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                rsvpFilter === f.value ? "bg-rose-600 text-white" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-rose-600 animate-spin" />
        </div>
      ) : guests.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <UserPlus className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No guests found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Guest</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Couple</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Category / Side</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">RSVP</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Heads</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Invite</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {guests.map((g) => (
                  <tr key={g.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3">
                      <p className="font-medium text-gray-900">{g.name}</p>
                      <p className="text-xs text-gray-400">{g.inviteType.replace(/_/g, " ").toLowerCase()}</p>
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-gray-700 truncate max-w-[180px]">{g.user?.yourName || "—"}</p>
                      <p className="text-xs text-gray-400 truncate max-w-[180px]">{g.user?.email || <span className="text-amber-600">(orphaned)</span>}</p>
                    </td>
                    <td className="px-5 py-3">
                      {g.email && <p className="text-gray-600 truncate max-w-[180px]">{g.email}</p>}
                      {g.whatsapp && <p className="text-xs text-gray-400">{g.whatsapp}</p>}
                      {!g.email && !g.whatsapp && <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-gray-600 text-xs">{g.category}</p>
                      <p className="text-gray-400 text-xs">{g.side}</p>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${rsvpBadge[g.rsvpStatus]}`}>
                        {g.rsvpStatus}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-gray-700 font-medium">{g.confirmedCount}<span className="text-gray-400 font-normal"> / {g.headCount}</span></p>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3 text-xs">
                        <span className={`inline-flex items-center gap-1 ${g.inviteSent ? "text-emerald-600" : "text-gray-300"}`}>
                          <Mail className="w-3.5 h-3.5" /> Sent
                        </span>
                        <span className={`inline-flex items-center gap-1 ${g.linkOpened ? "text-emerald-600" : "text-gray-300"}`}>
                          <Check className="w-3.5 h-3.5" /> Opened
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
