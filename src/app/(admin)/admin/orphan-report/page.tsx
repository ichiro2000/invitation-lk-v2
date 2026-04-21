"use client";

import { useState, useEffect } from "react";
import {
  Loader2, AlertTriangle, CheckCircle2, Download, RefreshCw,
  Users, Heart, CreditCard, Key, Plug, LifeBuoy,
} from "lucide-react";

type Category =
  | "guests"
  | "invitations"
  | "orders"
  | "sessions"
  | "accounts"
  | "supportTickets";

interface ReportItem {
  category: Category;
  label: string;
  count: number;
  samples: Record<string, unknown>[];
}

const iconFor: Record<Category, React.ComponentType<{ className?: string }>> = {
  guests: Users,
  invitations: Heart,
  orders: CreditCard,
  sessions: Key,
  accounts: Plug,
  supportTickets: LifeBuoy,
};

const blurbFor: Record<Category, string> = {
  guests: "Guest rows whose linked user no longer exists. Often pre-migration records created before Guest.userId got its FK. Safe to delete.",
  invitations: "Invitation rows whose linked user no longer exists. Should not happen with cascade delete; any present are legacy data.",
  orders: "Order rows whose linked user no longer exists. FK is NOT NULL so this should always be zero — treat any count as a data-integrity warning.",
  sessions: "NextAuth DB session rows for deleted users. Stateless JWT auth doesn't use these but leftovers may exist. Safe to delete.",
  accounts: "NextAuth OAuth account links for deleted users. Safe to delete.",
  supportTickets: "Support tickets whose customer account no longer exists. Either delete or reassign to a placeholder system account.",
};

function formatValue(v: unknown): string {
  if (v === null || v === undefined) return "—";
  if (v instanceof Date) return v.toISOString();
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

export default function AdminOrphanReportPage() {
  const [report, setReport] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshedAt, setRefreshedAt] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/orphan-report");
      if (!res.ok) throw new Error("Failed");
      const json = await res.json();
      setReport(json.report || []);
      setRefreshedAt(new Date().toLocaleString());
    } catch {
      setError("Failed to load orphan report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const totalOrphans = report.reduce((sum, r) => sum + Math.max(r.count, 0), 0);
  const hasErrors = report.some((r) => r.count < 0);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-8">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-amber-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Orphan report</h1>
            <p className="text-gray-400 mt-1">Rows whose owning user is missing. Read-only — this page never mutates.</p>
          </div>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white hover:border-rose-200 hover:text-rose-600 text-sm font-medium text-gray-700 transition-colors disabled:opacity-60"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          Refresh
        </button>
      </div>

      {loading && report.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-rose-600 animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-sm text-red-700">{error}</div>
      ) : (
        <>
          <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6 flex items-center gap-4">
            {totalOrphans === 0 && !hasErrors ? (
              <>
                <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">No orphaned rows found.</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Safe to add <code>NOT NULL</code> + <code>ON DELETE CASCADE</code> constraints on the userId columns.
                  </p>
                </div>
              </>
            ) : (
              <>
                <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {totalOrphans} orphaned {totalOrphans === 1 ? "row" : "rows"} across {report.filter((r) => r.count > 0).length} {report.filter((r) => r.count > 0).length === 1 ? "table" : "tables"}.
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Export each table&apos;s sample as CSV below. No cleanup happens unless you run a separate migration.
                  </p>
                </div>
              </>
            )}
            {refreshedAt && (
              <span className="text-xs text-gray-400 ml-auto">Refreshed {refreshedAt}</span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {report.map((r) => {
              const Icon = iconFor[r.category];
              const isError = r.count < 0;
              const isClean = r.count === 0;
              return (
                <div
                  key={r.category}
                  className={`bg-white rounded-2xl border p-5 ${isError ? "border-red-200" : isClean ? "border-gray-100" : "border-amber-200"}`}
                >
                  <div className="flex items-start justify-between">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isError ? "bg-red-50 text-red-600" : isClean ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <p className={`text-2xl font-bold ${isError ? "text-red-700" : isClean ? "text-gray-900" : "text-amber-700"}`}>
                      {isError ? "—" : r.count}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 mt-3">{r.label}</p>
                  <p className="text-xs text-gray-500 mt-1 leading-snug">{blurbFor[r.category]}</p>
                  {isError && (
                    <p className="text-xs text-red-600 mt-2">Query failed — check server logs.</p>
                  )}
                  {r.count > 0 && (
                    <a
                      href={`/api/admin/orphan-report?format=csv&category=${r.category}`}
                      className="inline-flex items-center gap-1.5 mt-3 text-xs font-medium text-rose-600 hover:underline"
                    >
                      <Download className="w-3.5 h-3.5" /> Download sample CSV
                    </a>
                  )}
                </div>
              );
            })}
          </div>

          {report.some((r) => r.samples.length > 0) && (
            <div className="space-y-6">
              <h2 className="text-sm font-semibold text-gray-900">Sample rows (up to 20 per table)</h2>
              {report.filter((r) => r.samples.length > 0).map((r) => {
                const keys = Object.keys(r.samples[0]);
                return (
                  <div key={r.category} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-900">{r.label}</p>
                      <span className="text-xs text-gray-500">{r.count} total · showing {r.samples.length}</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-gray-100">
                            {keys.map((k) => (
                              <th key={k} className="text-left px-4 py-2 font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">{k}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {r.samples.map((row, i) => (
                            <tr key={i}>
                              {keys.map((k) => (
                                <td key={k} className="px-4 py-2 text-gray-700 font-mono whitespace-nowrap max-w-[220px] truncate" title={formatValue(row[k])}>
                                  {formatValue(row[k])}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-8 bg-blue-50 border border-blue-100 rounded-2xl p-5">
            <p className="text-sm font-semibold text-gray-900 mb-2">How to clean up (after review)</p>
            <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
              <li>Download each sample CSV so you have a record.</li>
              <li>If counts look safe to delete, ship a separate one-shot migration:<br/>
                <code className="text-xs bg-white border border-gray-200 rounded px-1.5 py-0.5 mt-1 inline-block">DELETE FROM &quot;Guest&quot; WHERE &quot;userId&quot; NOT IN (SELECT id FROM &quot;User&quot;);</code>
              </li>
              <li>Then add NOT NULL + ON DELETE CASCADE to the FK:<br/>
                <code className="text-xs bg-white border border-gray-200 rounded px-1.5 py-0.5 mt-1 inline-block">ALTER TABLE &quot;Guest&quot; ALTER COLUMN &quot;userId&quot; SET NOT NULL; ...</code>
              </li>
              <li>Take a DB snapshot / fork before either step. Sessions and Accounts may be safest to batch-delete first since they don&apos;t carry user-visible data.</li>
            </ol>
          </div>
        </>
      )}
    </div>
  );
}
