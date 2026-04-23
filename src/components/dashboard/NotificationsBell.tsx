"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, LifeBuoy, CheckCircle2 } from "lucide-react";

interface NotificationItem {
  id: string;
  kind: "support.pending";
  subject: string;
  priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  updatedAt: string;
  href: string;
}

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}

const priorityDot: Record<NotificationItem["priority"], string> = {
  LOW: "bg-gray-300",
  NORMAL: "bg-blue-400",
  HIGH: "bg-amber-400",
  URGENT: "bg-red-500",
};

export default function NotificationsBell({
  count,
  items,
}: {
  count: number;
  items: NotificationItem[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click + Escape.
  const handleClick = useCallback((e: MouseEvent) => {
    if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
  }, []);
  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") setOpen(false);
  }, []);
  useEffect(() => {
    if (!open) return;
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open, handleClick, handleKey]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-label={`Notifications${count > 0 ? ` (${count} unread)` : ""}`}
        onClick={() => setOpen((o) => !o)}
        className="relative w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:border-rose-300 hover:bg-rose-50/30 transition-colors"
      >
        <Bell className="w-4 h-4 text-gray-600" />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/60 overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-900">Notifications</p>
            <span className="text-xs text-gray-400">
              {count === 0 ? "All caught up" : `${count} pending`}
            </span>
          </div>
          {items.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Nothing needs your attention.</p>
              <p className="text-xs text-gray-400 mt-1">
                Admin replies on your support tickets will show up here.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
              {items.map((n) => (
                <li key={n.id}>
                  <Link
                    href={n.href}
                    onClick={() => setOpen(false)}
                    className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center flex-shrink-0">
                      <LifeBuoy className="w-4 h-4 text-rose-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${priorityDot[n.priority]}`} />
                        <p className="text-sm font-medium text-gray-900 truncate">
                          Admin replied
                        </p>
                      </div>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{n.subject}</p>
                      <p className="text-[11px] text-gray-400 mt-1">{formatRelative(n.updatedAt)}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <div className="px-4 py-2 border-t border-gray-100 bg-gray-50/50">
            <Link
              href="/dashboard/support"
              onClick={() => setOpen(false)}
              className="text-xs font-medium text-rose-600 hover:text-rose-700"
            >
              View all support tickets →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
