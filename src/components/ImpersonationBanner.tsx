"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { Eye, LogOut, Loader2, AlertTriangle } from "lucide-react";

const WARN_THRESHOLD_MS = 10 * 60 * 1000; // < 10 min remaining → red
const PULSE_THRESHOLD_MS = 60 * 1000;     // < 1 min remaining → pulse

function formatRemaining(ms: number): string {
  if (ms <= 0) return "expired";
  const totalSec = Math.floor(ms / 1000);
  const mins = Math.floor(totalSec / 60);
  const secs = totalSec % 60;
  if (mins >= 60) {
    const hrs = Math.floor(mins / 60);
    return `${hrs}h ${mins % 60}m`;
  }
  return `${mins}m ${secs.toString().padStart(2, "0")}s`;
}

export default function ImpersonationBanner() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const autoExitFiredRef = useRef(false);

  const isImpersonating = !!session?.user?.impersonatedBy;
  const expiresAt = session?.expires ? new Date(session.expires).getTime() : null;

  useEffect(() => {
    if (!isImpersonating) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [isImpersonating]);

  useEffect(() => {
    if (!isImpersonating || !expiresAt) return;
    if (autoExitFiredRef.current) return;
    if (expiresAt - now > 0) return;
    // JWT expired. Hit exit to clear cookies and redirect home; if the
    // server already booted us, the redirect still lands somewhere sane.
    autoExitFiredRef.current = true;
    fetch("/api/impersonate/exit", { method: "POST" })
      .catch(() => {})
      .finally(() => {
        window.location.href = "/login";
      });
  }, [now, expiresAt, isImpersonating]);

  if (!isImpersonating) return null;

  const remainingMs = expiresAt ? expiresAt - now : null;
  const isWarning = remainingMs !== null && remainingMs < WARN_THRESHOLD_MS;
  const isPulsing = remainingMs !== null && remainingMs < PULSE_THRESHOLD_MS;

  const exit = async () => {
    setLoading(true);
    try {
      await fetch("/api/impersonate/exit", { method: "POST" });
    } finally {
      window.location.href = "/admin/users";
    }
  };

  const bgClass = isWarning ? "bg-red-600" : "bg-amber-500";
  const pulseClass = isPulsing ? "animate-pulse" : "";

  return (
    <div className={`sticky top-0 z-50 ${bgClass} text-white text-sm ${pulseClass}`}>
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          {isWarning ? (
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          ) : (
            <Eye className="w-4 h-4 flex-shrink-0" />
          )}
          <p className="truncate">
            <span className="font-semibold">Impersonating</span>{" "}
            <span className="font-mono">{session?.user?.email}</span>
            {remainingMs !== null && (
              <>
                <span className="opacity-80"> · </span>
                <span className="font-mono text-xs opacity-90" title={expiresAt ? `Session expires at ${new Date(expiresAt).toLocaleTimeString()}` : undefined}>
                  {isWarning ? "Expires in " : ""}{formatRemaining(remainingMs)}
                </span>
                {isWarning && (
                  <span className="hidden sm:inline opacity-90"> — exit before auto-logout</span>
                )}
              </>
            )}
          </p>
        </div>
        <button
          onClick={exit}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-semibold transition-colors disabled:opacity-60 flex-shrink-0"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LogOut className="w-3.5 h-3.5" />}
          Exit impersonation
        </button>
      </div>
    </div>
  );
}
