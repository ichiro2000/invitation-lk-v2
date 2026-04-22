"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signOut } from "next-auth/react";
import { Loader2, ShieldCheck, LogOut } from "lucide-react";

function ChallengeForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/admin";
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Invalid code");
        setCode("");
        return;
      }
      router.replace(next);
    } catch {
      setError("Network error — please try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="block text-xs font-medium uppercase tracking-wider text-gray-500 mb-2">
          Authenticator code
        </label>
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          inputMode="numeric"
          autoComplete="one-time-code"
          autoFocus
          placeholder="6-digit code or backup code"
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-center text-lg font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
          disabled={loading}
        />
        <p className="text-xs text-gray-400 mt-2">
          Enter the 6-digit code from your authenticator app, or one of your backup codes if you&apos;ve lost access.
        </p>
      </div>

      {error && (
        <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading || !code.trim()}
        className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold transition-colors disabled:opacity-60"
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        Verify and continue
      </button>

      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/" })}
        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-sm text-gray-500 hover:text-red-600 rounded-xl hover:bg-red-50 transition-colors"
      >
        <LogOut className="w-4 h-4" /> Sign out instead
      </button>
    </form>
  );
}

export default function TwoFactorChallengePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 via-white to-violet-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
        <div className="w-14 h-14 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-4">
          <ShieldCheck className="w-7 h-7 text-rose-600" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 text-center">
          Two-factor authentication
        </h1>
        <p className="text-sm text-gray-500 text-center mt-2 mb-6">
          Confirm it&apos;s you before entering the admin portal.
        </p>
        <Suspense fallback={<div className="h-32" />}>
          <ChallengeForm />
        </Suspense>
      </div>
    </div>
  );
}
