"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Loader2, Heart, Search, ExternalLink, Eye, Calendar, Download } from "lucide-react";

interface Wedding {
  id: string;
  slug: string;
  templateSlug: string;
  groomName: string;
  brideName: string;
  weddingDate: string;
  venue: string;
  isPublished: boolean;
  isPaid: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    yourName: string | null;
    plan: string;
  };
  _count: {
    events: number;
    pageViews: number;
  };
}

const planBadge: Record<string, string> = {
  FREE: "bg-gray-100 text-gray-600",
  BASIC: "bg-blue-100 text-blue-700",
  STANDARD: "bg-amber-100 text-amber-700",
  PREMIUM: "bg-rose-100 text-rose-700",
};

type Filter = "" | "published" | "draft" | "paid" | "unpaid";

const filters: { value: Filter; label: string }[] = [
  { value: "", label: "All" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
  { value: "paid", label: "Paid" },
  { value: "unpaid", label: "Unpaid" },
];

export default function AdminWeddingsPage() {
  const [weddings, setWeddings] = useState<Wedding[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("");

  const fetchWeddings = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (filter) params.set("status", filter);
      const qs = params.toString();
      const res = await fetch(`/api/admin/weddings${qs ? `?${qs}` : ""}`);
      const data = await res.json();
      setWeddings(data.invitations || []);
    } catch {
      console.error("Failed to fetch weddings");
    } finally {
      setLoading(false);
    }
  }, [search, filter]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchWeddings();
    }, 300);
    return () => clearTimeout(timeout);
  }, [fetchWeddings]);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });

  const now = Date.now();
  const isUpcoming = (d: string) => new Date(d).getTime() >= now;

  const handleExport = () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (filter) params.set("status", filter);
    params.set("format", "csv");
    window.location.href = `/api/admin/weddings?${params.toString()}`;
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Wedding websites</h1>
          <p className="text-gray-400 mt-1">All invitation sites on the platform.</p>
        </div>
        <button
          onClick={handleExport}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white hover:border-rose-200 hover:text-rose-600 text-sm font-medium text-gray-700 transition-colors"
        >
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by couple name, slug, venue, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
          />
        </div>
        <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                filter === f.value ? "bg-rose-600 text-white" : "text-gray-600 hover:bg-gray-50"
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
      ) : weddings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <Heart className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No wedding sites found.</p>
        </div>
      ) : (
        <>
          <p className="text-xs text-gray-400 mb-3">{weddings.length} {weddings.length === 1 ? "site" : "sites"}</p>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Couple</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Account</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Wedding date</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Template</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Events</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Views</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {weddings.map((w) => (
                    <tr key={w.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-4">
                        <Link href={`/admin/weddings/${w.id}`} className="font-medium text-gray-900 hover:text-rose-600">
                          {w.groomName} & {w.brideName}
                        </Link>
                        <p className="text-xs text-gray-400 font-mono">/w/{w.slug}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-gray-700 truncate max-w-[180px]">{w.user.yourName || "—"}</p>
                        <p className="text-xs text-gray-400 truncate max-w-[180px]">{w.user.email}</p>
                        <span className={`inline-flex mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${planBadge[w.user.plan] || "bg-gray-100 text-gray-600"}`}>
                          {w.user.plan}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          {formatDate(w.weddingDate)}
                        </div>
                        <p className={`text-xs mt-0.5 ${isUpcoming(w.weddingDate) ? "text-emerald-600" : "text-gray-400"}`}>
                          {isUpcoming(w.weddingDate) ? "Upcoming" : "Past"}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-gray-500 font-mono text-xs">{w.templateSlug}</td>
                      <td className="px-5 py-4 text-gray-600">{w._count.events}</td>
                      <td className="px-5 py-4 text-gray-600">{w._count.pageViews}</td>
                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-1">
                          <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] font-semibold w-fit ${
                            w.isPublished ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"
                          }`}>
                            {w.isPublished ? "Live" : "Draft"}
                          </span>
                          <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] font-semibold w-fit ${
                            w.isPaid ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"
                          }`}>
                            {w.isPaid ? "Paid" : "Unpaid"}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1">
                          <Link href={`/admin/weddings/${w.id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                            Details
                          </Link>
                          <Link href={`/w/${w.slug}`} target="_blank"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors">
                            <Eye className="w-3.5 h-3.5" /> Preview <ExternalLink className="w-3 h-3" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
