"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Eye, LogOut, Loader2 } from "lucide-react";

export default function ImpersonationBanner() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);

  if (!session?.user?.impersonatedBy) return null;

  const exit = async () => {
    setLoading(true);
    try {
      await fetch("/api/impersonate/exit", { method: "POST" });
    } finally {
      // Full page reload — the session cookie just changed out from under us.
      window.location.href = "/admin/users";
    }
  };

  return (
    <div className="sticky top-0 z-50 bg-amber-500 text-white text-sm">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <Eye className="w-4 h-4 flex-shrink-0" />
          <p className="truncate">
            <span className="font-semibold">Impersonating</span>{" "}
            <span className="font-mono">{session.user.email}</span> — any action you take here is performed as this customer.
          </p>
        </div>
        <button
          onClick={exit}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-semibold transition-colors disabled:opacity-60"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LogOut className="w-3.5 h-3.5" />}
          Exit impersonation
        </button>
      </div>
    </div>
  );
}
