"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Loader2, ShieldCheck, Search, X, User as UserIcon, CreditCard,
  Trash2, Edit3, CheckCircle2, XCircle, Globe, Ban, UserCheck, LifeBuoy, Eye,
} from "lucide-react";

interface AuditEntry {
  id: string;
  actorUserId: string | null;
  action: string;
  targetType: string | null;
  targetId: string | null;
  metadata: Record<string, unknown> | null;
  ipAddress: string | null;
  createdAt: string;
  actor: {
    id: string;
    email: string;
    yourName: string | null;
  } | null;
}

type ActionFilter =
  | ""
  | "user.delete"
  | "user.plan.update"
  | "user.role.update"
  | "user.suspend"
  | "user.unsuspend"
  | "user.impersonate.start"
  | "user.impersonate.end"
  | "user.2fa.enable"
  | "user.2fa.disable"
  | "user.2fa.backup_codes_regenerated"
  | "bank_transfer.approve"
  | "bank_transfer.reject"
  | "support.ticket.status.update"
  | "support.ticket.priority.update";

const actionFilters: { value: ActionFilter; label: string }[] = [
  { value: "", label: "All" },
  { value: "user.plan.update", label: "Plan changed" },
  { value: "user.role.update", label: "Role changed" },
  { value: "user.suspend", label: "Suspended" },
  { value: "user.unsuspend", label: "Unsuspended" },
  { value: "user.impersonate.start", label: "Impersonate start" },
  { value: "user.impersonate.end", label: "Impersonate end" },
  { value: "user.delete", label: "User deleted" },
  { value: "bank_transfer.approve", label: "Transfer approved" },
  { value: "bank_transfer.reject", label: "Transfer rejected" },
  { value: "support.ticket.status.update", label: "Ticket status" },
  { value: "support.ticket.priority.update", label: "Ticket priority" },
  { value: "user.2fa.enable", label: "2FA enabled" },
  { value: "user.2fa.disable", label: "2FA disabled" },
  { value: "user.2fa.backup_codes_regenerated", label: "2FA backup codes" },
];

const actionMeta: Record<string, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  "user.delete": { label: "User deleted", color: "bg-red-100 text-red-700", icon: Trash2 },
  "user.plan.update": { label: "Plan changed", color: "bg-blue-100 text-blue-700", icon: Edit3 },
  "user.role.update": { label: "Role changed", color: "bg-violet-100 text-violet-700", icon: Edit3 },
  "user.suspend": { label: "User suspended", color: "bg-red-100 text-red-700", icon: Ban },
  "user.unsuspend": { label: "User unsuspended", color: "bg-emerald-100 text-emerald-700", icon: UserCheck },
  "user.impersonate.start": { label: "Impersonation started", color: "bg-amber-100 text-amber-700", icon: Eye },
  "user.impersonate.end": { label: "Impersonation ended", color: "bg-gray-100 text-gray-700", icon: Eye },
  "bank_transfer.approve": { label: "Transfer approved", color: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
  "bank_transfer.reject": { label: "Transfer rejected", color: "bg-amber-100 text-amber-700", icon: XCircle },
  "support.ticket.status.update": { label: "Ticket status", color: "bg-blue-100 text-blue-700", icon: LifeBuoy },
  "support.ticket.priority.update": { label: "Ticket priority", color: "bg-amber-100 text-amber-700", icon: LifeBuoy },
  "user.2fa.enable": { label: "2FA enabled", color: "bg-emerald-100 text-emerald-700", icon: ShieldCheck },
  "user.2fa.disable": { label: "2FA disabled", color: "bg-red-100 text-red-700", icon: ShieldCheck },
  "user.2fa.backup_codes_regenerated": { label: "Backup codes regenerated", color: "bg-amber-100 text-amber-700", icon: ShieldCheck },
};

function formatDate(d: string) {
  return new Date(d).toLocaleString(undefined, {
    year: "numeric", month: "short", day: "numeric",
    hour: "numeric", minute: "2-digit", second: "2-digit",
  });
}

function describeMetadata(action: string, metadata: Record<string, unknown> | null): string {
  if (!metadata) return "";
  switch (action) {
    case "user.plan.update":
      return `${metadata.email ?? ""}: ${metadata.from} → ${metadata.to}`;
    case "user.role.update":
      return `${metadata.email ?? ""}: ${metadata.from} → ${metadata.to}`;
    case "user.delete":
      return `${metadata.email ?? ""} (${metadata.plan ?? "?"})`;
    case "user.suspend":
      return `${metadata.email ?? ""} — ${metadata.reason ?? ""}`;
    case "user.unsuspend":
      return `${metadata.email ?? ""}`;
    case "user.impersonate.start":
      return `${metadata.adminEmail ?? ""} → ${metadata.targetEmail ?? ""}`;
    case "user.impersonate.end":
      return `${metadata.adminEmail ?? ""} ← ${metadata.targetEmail ?? ""}`;
    case "bank_transfer.approve":
    case "bank_transfer.reject":
      return `${metadata.plan} · ${metadata.amount} LKR`;
    case "support.ticket.status.update":
    case "support.ticket.priority.update":
      return `${metadata.subject ?? ""}: ${metadata.from} → ${metadata.to}`;
    default:
      return "";
  }
}

export default function AdminAuditLogPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState<ActionFilter>("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<AuditEntry | null>(null);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (actionFilter) params.set("action", actionFilter);
      const qs = params.toString();
      const res = await fetch(`/api/admin/audit-log${qs ? `?${qs}` : ""}`);
      const data = await res.json();
      setEntries(data.entries || []);
    } catch {
      console.error("Failed to fetch audit log");
    } finally {
      setLoading(false);
    }
  }, [actionFilter]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const filtered = search.trim()
    ? entries.filter((e) => {
        const needle = search.toLowerCase();
        return (
          e.actor?.email?.toLowerCase().includes(needle) ||
          e.actor?.yourName?.toLowerCase().includes(needle) ||
          e.targetId?.toLowerCase().includes(needle) ||
          JSON.stringify(e.metadata ?? {}).toLowerCase().includes(needle)
        );
      })
    : entries;

  return (
    <div>
      <div className="mb-8 flex items-center gap-3">
        <ShieldCheck className="w-6 h-6 text-rose-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Security logs</h1>
          <p className="text-gray-400 mt-1">Every admin mutation recorded with actor, target, and diff.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search actor, target id, or metadata..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
          />
        </div>
        <div className="flex flex-wrap gap-1 bg-white border border-gray-200 rounded-xl p-1">
          {actionFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => setActionFilter(f.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                actionFilter === f.value ? "bg-rose-600 text-white" : "text-gray-600 hover:bg-gray-50"
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
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <ShieldCheck className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No entries yet. Admin actions will appear here as they happen.</p>
        </div>
      ) : (
        <>
          <p className="text-xs text-gray-400 mb-3">{filtered.length} {filtered.length === 1 ? "entry" : "entries"}</p>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">When</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actor</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Target</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">IP</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((e) => {
                    const meta = actionMeta[e.action] ?? { label: e.action, color: "bg-gray-100 text-gray-600", icon: Edit3 };
                    const Icon = meta.icon;
                    return (
                      <tr key={e.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-5 py-3 text-gray-600 text-xs whitespace-nowrap">{formatDate(e.createdAt)}</td>
                        <td className="px-5 py-3">
                          {e.actor ? (
                            <Link href={`/admin/users/${e.actor.id}`} className="block min-w-0 text-gray-900 hover:text-rose-600">
                              <p className="font-medium truncate max-w-[200px]">{e.actor.email}</p>
                              {e.actor.yourName && (
                                <p className="text-xs text-gray-400 truncate max-w-[200px]">{e.actor.yourName}</p>
                              )}
                            </Link>
                          ) : (
                            <span className="text-xs text-gray-400">(deleted or system)</span>
                          )}
                        </td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${meta.color}`}>
                            <Icon className="w-3 h-3" /> {meta.label}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          {e.targetType && e.targetId ? (
                            <div className="flex items-center gap-1 text-xs">
                              {e.targetType === "User" && <UserIcon className="w-3 h-3 text-gray-400" />}
                              {e.targetType === "BankTransfer" && <CreditCard className="w-3 h-3 text-gray-400" />}
                              {e.targetType === "Invitation" && <Globe className="w-3 h-3 text-gray-400" />}
                              <span className="text-gray-600">{e.targetType}</span>
                              <span className="text-gray-400 font-mono">{e.targetId.slice(0, 10)}…</span>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-300">—</span>
                          )}
                        </td>
                        <td className="px-5 py-3">
                          <div className="text-xs text-gray-600 max-w-[260px] truncate" title={describeMetadata(e.action, e.metadata)}>
                            {describeMetadata(e.action, e.metadata)}
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <div className="text-xs text-gray-400 font-mono max-w-[140px] truncate" title={e.ipAddress || ""}>
                            {e.ipAddress || "—"}
                          </div>
                        </td>
                        <td className="px-5 py-3 text-right whitespace-nowrap">
                          <button
                            onClick={() => setSelected(e)}
                            className="text-xs text-rose-600 hover:underline font-medium"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <h3 className="font-semibold text-gray-900">Audit entry</h3>
                <p className="text-xs text-gray-400 font-mono mt-0.5">{selected.id}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-xs text-gray-400 uppercase tracking-wider">Timestamp</dt>
                <dd className="text-gray-900 mt-0.5">{formatDate(selected.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400 uppercase tracking-wider">Actor</dt>
                <dd className="text-gray-900 mt-0.5">
                  {selected.actor ? `${selected.actor.yourName || "—"} · ${selected.actor.email}` : "(deleted or system)"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400 uppercase tracking-wider">Action</dt>
                <dd className="text-gray-900 mt-0.5 font-mono">{selected.action}</dd>
              </div>
              {selected.targetType && selected.targetId && (
                <div>
                  <dt className="text-xs text-gray-400 uppercase tracking-wider">Target</dt>
                  <dd className="text-gray-900 mt-0.5 font-mono">{selected.targetType}:{selected.targetId}</dd>
                </div>
              )}
              {selected.ipAddress && (
                <div>
                  <dt className="text-xs text-gray-400 uppercase tracking-wider">IP</dt>
                  <dd className="text-gray-900 mt-0.5 font-mono">{selected.ipAddress}</dd>
                </div>
              )}
              {selected.metadata && Object.keys(selected.metadata).length > 0 && (
                <div>
                  <dt className="text-xs text-gray-400 uppercase tracking-wider">Metadata</dt>
                  <dd className="mt-1">
                    <pre className="bg-gray-50 rounded-lg p-3 text-xs text-gray-700 overflow-x-auto">
                      {JSON.stringify(selected.metadata, null, 2)}
                    </pre>
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      )}
    </div>
  );
}
