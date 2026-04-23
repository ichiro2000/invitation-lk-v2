"use client";

import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import {
  Loader2, Send, Search, X, Mail, MessageCircle, Phone,
  CheckCircle2, XCircle, Clock, Eye, AlertTriangle, ChevronDown, RefreshCw,
} from "lucide-react";

type Channel = "EMAIL" | "SMS" | "WHATSAPP";
type Status = "SENT" | "FAILED" | "DELIVERED" | "BOUNCED" | "OPENED" | "CLICKED";

interface Entry {
  id: string;
  channel: Channel;
  status: Status;
  provider: string | null;
  providerId: string | null;
  recipient: string;
  subject: string | null;
  template: string | null;
  userId: string | null;
  error: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

interface Response {
  entries: Entry[];
  statusCounts: Record<string, number>;
  sinceDays: number;
}

const CHANNEL_ICON: Record<Channel, React.ComponentType<{ className?: string }>> = {
  EMAIL: Mail,
  SMS: Phone,
  WHATSAPP: MessageCircle,
};

const STATUS_META: Record<Status, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  SENT:      { label: "Sent",      color: "bg-blue-100 text-blue-700",     icon: Send },
  DELIVERED: { label: "Delivered", color: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
  OPENED:    { label: "Opened",    color: "bg-violet-100 text-violet-700", icon: Eye },
  CLICKED:   { label: "Clicked",   color: "bg-violet-100 text-violet-700", icon: Eye },
  BOUNCED:   { label: "Bounced",   color: "bg-amber-100 text-amber-700",   icon: AlertTriangle },
  FAILED:    { label: "Failed",    color: "bg-red-100 text-red-700",       icon: XCircle },
};

const TEMPLATE_LABELS: Record<string, string> = {
  welcome: "Welcome",
  email_verification: "Email verification",
  password_reset: "Password reset",
  payment_confirmation: "Payment confirmation",
  admin_new_user: "Admin: new user",
  admin_payment_alert: "Admin: payment alert",
  support_ticket_created_admin: "Support ticket (admin)",
  support_ticket_reply_customer: "Support reply (customer)",
};

function formatDate(iso: string) {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return d.toLocaleString(undefined, {
    month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
  });
}

export default function AdminCommunicationsPage() {
  const [data, setData] = useState<Response | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [channel, setChannel] = useState<"" | Channel>("");
  const [status, setStatus] = useState<"" | Status>("");
  const [template, setTemplate] = useState("");
  const [search, setSearch] = useState("");
  const [sinceDays, setSinceDays] = useState(30);
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const params = new URLSearchParams();
      if (channel) params.set("channel", channel);
      if (status) params.set("status", status);
      if (template) params.set("template", template);
      if (search) params.set("search", search);
      params.set("sinceDays", String(sinceDays));
      const res = await fetch(`/api/admin/delivery-logs?${params}`);
      if (res.ok) setData(await res.json());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [channel, status, template, search, sinceDays]);

  useEffect(() => {
    load();
  }, [load]);

  const totals = data?.statusCounts ?? {};
  const totalCount = useMemo(
    () => Object.values(totals).reduce((s, n) => s + n, 0),
    [totals]
  );

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <Send className="w-6 h-6 text-rose-600" />
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Communications</h1>
          <p className="text-gray-400 mt-1">Every email the platform sent — with failures and bounces.</p>
        </div>
        <button
          onClick={() => load(true)}
          disabled={refreshing || loading}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-sm font-medium text-gray-700 disabled:opacity-60 transition-colors"
        >
          {refreshing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          Refresh
        </button>
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        <button
          onClick={() => setStatus("")}
          className={`bg-white rounded-2xl border p-4 text-left transition-colors ${
            status === "" ? "border-rose-400 ring-2 ring-rose-500/20" : "border-gray-100 hover:border-gray-200"
          }`}
        >
          <p className="text-xs text-gray-500">All</p>
          <p className="text-xl font-bold text-gray-900 mt-1">{totalCount}</p>
        </button>
        {(["SENT", "DELIVERED", "OPENED", "BOUNCED", "FAILED"] as Status[]).map((s) => {
          const meta = STATUS_META[s];
          const count = totals[s] ?? 0;
          return (
            <button
              key={s}
              onClick={() => setStatus(status === s ? "" : s)}
              className={`bg-white rounded-2xl border p-4 text-left transition-colors ${
                status === s ? "border-rose-400 ring-2 ring-rose-500/20" : "border-gray-100 hover:border-gray-200"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <meta.icon className={`w-3.5 h-3.5 ${count > 0 ? "text-gray-500" : "text-gray-300"}`} />
                <p className="text-xs text-gray-500">{meta.label}</p>
              </div>
              <p className={`text-xl font-bold mt-1 ${count > 0 ? "text-gray-900" : "text-gray-300"}`}>{count}</p>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search recipient or subject"
              className="w-full pl-9 pr-9 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <select
            value={channel}
            onChange={(e) => setChannel(e.target.value as "" | Channel)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
          >
            <option value="">All channels</option>
            <option value="EMAIL">Email</option>
            <option value="SMS">SMS</option>
            <option value="WHATSAPP">WhatsApp</option>
          </select>

          <select
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
          >
            <option value="">All templates</option>
            {Object.entries(TEMPLATE_LABELS).map(([k, label]) => (
              <option key={k} value={k}>{label}</option>
            ))}
          </select>

          <select
            value={sinceDays}
            onChange={(e) => setSinceDays(parseInt(e.target.value, 10))}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
          >
            <option value={1}>Last 24 hours</option>
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
            <option value={365}>Last year</option>
          </select>
        </div>
      </div>

      {/* Entries */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-rose-600 animate-spin" />
        </div>
      ) : !data || data.entries.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <Clock className="w-8 h-8 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-600">No messages match these filters.</p>
          <p className="text-xs text-gray-400 mt-1">
            Logging started when the Communication Center shipped — older sends are not visible.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">When</th>
                  <th className="text-left px-4 py-3 font-medium">Channel</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="text-left px-4 py-3 font-medium">Template</th>
                  <th className="text-left px-4 py-3 font-medium">Recipient</th>
                  <th className="text-left px-4 py-3 font-medium">Subject</th>
                  <th className="w-8"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.entries.map((e) => {
                  const ChannelIcon = CHANNEL_ICON[e.channel];
                  const statusMeta = STATUS_META[e.status];
                  const isOpen = expanded === e.id;
                  const hasDetails = Boolean(e.error || e.metadata || e.providerId || e.userId);
                  return (
                    <Fragment key={e.id}>
                      <tr
                        onClick={() => hasDetails && setExpanded(isOpen ? null : e.id)}
                        className={hasDetails ? "cursor-pointer hover:bg-gray-50" : ""}
                      >
                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap" title={new Date(e.createdAt).toLocaleString()}>
                          {formatDate(e.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="inline-flex items-center gap-1.5 text-gray-700">
                            <ChannelIcon className="w-3.5 h-3.5 text-gray-500" />
                            <span className="text-xs font-medium">{e.channel}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${statusMeta.color}`}>
                            <statusMeta.icon className="w-3 h-3" />
                            {statusMeta.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {e.template ? (TEMPLATE_LABELS[e.template] ?? e.template) : "—"}
                        </td>
                        <td className="px-4 py-3 text-gray-700 max-w-[220px] truncate" title={e.recipient}>
                          {e.recipient}
                        </td>
                        <td className="px-4 py-3 text-gray-600 max-w-[280px] truncate" title={e.subject ?? ""}>
                          {e.subject ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-gray-400">
                          {hasDetails && (
                            <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                          )}
                        </td>
                      </tr>
                      {isOpen && hasDetails && (
                        <tr className="bg-gray-50/50">
                          <td colSpan={7} className="px-4 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {e.error && (
                                <div className="md:col-span-2">
                                  <p className="text-[11px] text-gray-500 uppercase tracking-wider mb-1">Error</p>
                                  <pre className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg p-2 whitespace-pre-wrap break-all font-mono">{e.error}</pre>
                                </div>
                              )}
                              {e.providerId && (
                                <div>
                                  <p className="text-[11px] text-gray-500 uppercase tracking-wider mb-1">Provider ID</p>
                                  <code className="text-xs font-mono text-gray-700 bg-white border border-gray-200 rounded px-2 py-1 block truncate">{e.providerId}</code>
                                </div>
                              )}
                              {e.userId && (
                                <div>
                                  <p className="text-[11px] text-gray-500 uppercase tracking-wider mb-1">User</p>
                                  <code className="text-xs font-mono text-gray-700 bg-white border border-gray-200 rounded px-2 py-1 block truncate">{e.userId}</code>
                                </div>
                              )}
                              {e.metadata && Object.keys(e.metadata).length > 0 && (
                                <div className="md:col-span-2">
                                  <p className="text-[11px] text-gray-500 uppercase tracking-wider mb-1">Metadata</p>
                                  <pre className="text-xs text-gray-700 bg-white border border-gray-200 rounded p-2 overflow-x-auto font-mono">{JSON.stringify(e.metadata, null, 2)}</pre>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          {data.entries.length >= 200 && (
            <div className="px-4 py-3 text-xs text-gray-500 bg-gray-50 border-t border-gray-100">
              Showing the 200 most recent — narrow the filters to see older events.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
