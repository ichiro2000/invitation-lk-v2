"use client";

import { useState, useEffect, use, useCallback } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Loader2, ArrowLeft, Send, ShieldCheck, User as UserIcon } from "lucide-react";

interface Reply {
  id: string;
  message: string;
  createdAt: string;
  author: { id: string; email: string; yourName: string | null; role: string };
}

interface Ticket {
  id: string;
  userId: string;
  subject: string;
  status: "OPEN" | "PENDING" | "RESOLVED" | "CLOSED";
  priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  createdAt: string;
  updatedAt: string;
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

function formatDate(d: string) {
  return new Date(d).toLocaleString(undefined, {
    month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
  });
}

export default function DashboardSupportThreadPage(
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = use(params);
  const { data: session } = useSession();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/support/tickets/${id}`);
      if (res.status === 404 || res.status === 403) {
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

  const send = async () => {
    const message = reply.trim();
    if (!message) return;
    setSending(true);
    setReplyError(null);
    try {
      const res = await fetch(`/api/support/tickets/${id}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setReplyError(data.error || "Failed to send reply");
        return;
      }
      setReply("");
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
        <Link href="/dashboard/support" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-rose-600 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to support
        </Link>
        <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-sm text-red-700">{error || "No data."}</div>
      </div>
    );
  }

  const canReply = ticket.status !== "CLOSED";

  return (
    <div className="max-w-3xl">
      <Link href="/dashboard/support" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-rose-600 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to support
      </Link>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{ticket.subject}</h1>
            <p className="text-xs text-gray-400 mt-1">Opened {formatDate(ticket.createdAt)}</p>
          </div>
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${statusBadge[ticket.status]}`}>{ticket.status}</span>
            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${priorityBadge[ticket.priority]}`}>{ticket.priority}</span>
          </div>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        {ticket.replies.map((r) => {
          const isAdmin = r.author.role === "ADMIN";
          const isMe = r.author.id === session?.user?.id;
          return (
            <div key={r.id} className={`flex gap-3 ${isMe ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] rounded-2xl p-4 ${isAdmin ? "bg-rose-50 border border-rose-100" : isMe ? "bg-white border border-gray-100" : "bg-gray-50 border border-gray-100"}`}>
                <div className="flex items-center gap-2 mb-1.5">
                  {isAdmin ? <ShieldCheck className="w-3.5 h-3.5 text-rose-600" /> : <UserIcon className="w-3.5 h-3.5 text-gray-500" />}
                  <p className="text-xs font-semibold text-gray-700">
                    {isAdmin ? "INVITATION.LK Support" : r.author.yourName || r.author.email}
                  </p>
                  <p className="text-xs text-gray-400">· {formatDate(r.createdAt)}</p>
                </div>
                <p className="text-sm text-gray-900 whitespace-pre-wrap">{r.message}</p>
              </div>
            </div>
          );
        })}
      </div>

      {canReply ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            disabled={sending}
            placeholder="Type your reply…"
            maxLength={10000}
            rows={4}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
          />
          {replyError && (
            <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2 mt-2">{replyError}</p>
          )}
          <div className="flex justify-end mt-3">
            <button
              onClick={send}
              disabled={sending || !reply.trim()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium transition-colors disabled:opacity-50"
            >
              {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              Send reply
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-2xl border border-gray-100 p-4 text-center">
          <p className="text-sm text-gray-500">This ticket is closed. Please <Link href="/dashboard/support" className="text-rose-600 hover:underline">open a new ticket</Link> if you need further help.</p>
        </div>
      )}
    </div>
  );
}
