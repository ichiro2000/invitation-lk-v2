"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Loader2, ShieldCheck, ShieldAlert, Copy, Check, Ban, RefreshCw, Download,
} from "lucide-react";

interface Status {
  enabled: boolean;
  enabledAt: string | null;
  unusedBackupCodes: number;
}

function BackupCodesBlock({ codes, onDone }: { codes: string[]; onDone?: () => void }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(codes.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const download = () => {
    const blob = new Blob([`INVITATION.LK backup codes\n${codes.join("\n")}\n`], {
      type: "text/plain",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invitation-lk-backup-codes-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mt-4">
      <p className="text-sm font-semibold text-amber-900">Save these backup codes now</p>
      <p className="text-xs text-amber-800 mt-1">
        Each code works once. Store them in a password manager — you won&apos;t see them again.
      </p>
      <div className="grid grid-cols-2 gap-2 mt-3 font-mono text-sm text-amber-900">
        {codes.map((c) => (
          <div key={c} className="bg-white border border-amber-200 rounded-lg px-3 py-2 text-center">{c}</div>
        ))}
      </div>
      <div className="flex gap-2 mt-4">
        <button
          onClick={copy}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-amber-200 hover:bg-amber-100 text-sm font-medium text-amber-900 transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? "Copied" : "Copy all"}
        </button>
        <button
          onClick={download}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-amber-200 hover:bg-amber-100 text-sm font-medium text-amber-900 transition-colors"
        >
          <Download className="w-3.5 h-3.5" /> Download .txt
        </button>
        {onDone && (
          <button
            onClick={onDone}
            className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium transition-colors"
          >
            I&apos;ve saved them
          </button>
        )}
      </div>
    </div>
  );
}

export default function AdminSecurityPage() {
  const [status, setStatus] = useState<Status | null>(null);
  const [loading, setLoading] = useState(true);

  // Enrollment state
  const [setupSecret, setSetupSecret] = useState<string | null>(null);
  const [setupQr, setSetupQr] = useState<string | null>(null);
  const [enrollCode, setEnrollCode] = useState("");
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [enrollError, setEnrollError] = useState<string | null>(null);
  const [newBackupCodes, setNewBackupCodes] = useState<string[] | null>(null);

  // Disable state
  const [disableCode, setDisableCode] = useState("");
  const [disableLoading, setDisableLoading] = useState(false);
  const [disableError, setDisableError] = useState<string | null>(null);

  // Regenerate state
  const [regenCode, setRegenCode] = useState("");
  const [regenLoading, setRegenLoading] = useState(false);
  const [regenError, setRegenError] = useState<string | null>(null);

  const loadStatus = async () => {
    try {
      const res = await fetch("/api/admin/2fa/status");
      if (res.ok) setStatus(await res.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const startSetup = async () => {
    setEnrollError(null);
    setEnrollLoading(true);
    try {
      const res = await fetch("/api/admin/2fa/setup", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setEnrollError(data.error || "Setup failed");
        return;
      }
      setSetupSecret(data.secret);
      setSetupQr(data.qrCodeDataUrl);
    } finally {
      setEnrollLoading(false);
    }
  };

  const confirmEnroll = async () => {
    if (!setupSecret) return;
    setEnrollError(null);
    setEnrollLoading(true);
    try {
      const res = await fetch("/api/admin/2fa/enable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret: setupSecret, code: enrollCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setEnrollError(data.error || "Failed to enable");
        return;
      }
      setNewBackupCodes(data.backupCodes);
      setSetupSecret(null);
      setSetupQr(null);
      setEnrollCode("");
      await loadStatus();
    } finally {
      setEnrollLoading(false);
    }
  };

  const disable = async () => {
    setDisableError(null);
    setDisableLoading(true);
    try {
      const res = await fetch("/api/admin/2fa/disable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: disableCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setDisableError(data.error || "Failed to disable");
        return;
      }
      setDisableCode("");
      await loadStatus();
    } finally {
      setDisableLoading(false);
    }
  };

  const regenerate = async () => {
    setRegenError(null);
    setRegenLoading(true);
    try {
      const res = await fetch("/api/admin/2fa/backup-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: regenCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setRegenError(data.error || "Failed to regenerate");
        return;
      }
      setNewBackupCodes(data.backupCodes);
      setRegenCode("");
      await loadStatus();
    } finally {
      setRegenLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-rose-600 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <ShieldCheck className="w-6 h-6 text-rose-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Security</h1>
          <p className="text-gray-400 mt-1">Two-factor authentication for your admin account.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 max-w-2xl">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${status?.enabled ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
            {status?.enabled ? <ShieldCheck className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
          </div>
          <div className="flex-1">
            <h2 className="text-base font-semibold text-gray-900">
              {status?.enabled ? "Two-factor authentication is enabled" : "Two-factor authentication is not enabled"}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {status?.enabled
                ? `Enabled ${status.enabledAt ? new Date(status.enabledAt).toLocaleDateString() : ""}. ${status.unusedBackupCodes} unused backup code${status.unusedBackupCodes === 1 ? "" : "s"} remaining.`
                : "Add a layer to your admin sign-in. You'll need an authenticator app like Google Authenticator, Authy, or 1Password."}
            </p>
          </div>
        </div>

        {/* ENABLE flow */}
        {!status?.enabled && !setupSecret && !newBackupCodes && (
          <button
            onClick={startSetup}
            disabled={enrollLoading}
            className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium transition-colors disabled:opacity-60"
          >
            {enrollLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            Enable two-factor authentication
          </button>
        )}

        {setupSecret && setupQr && (
          <div className="mt-6 border-t border-gray-100 pt-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">1 · Scan this QR</h3>
            <div className="flex items-start gap-4">
              <Image src={setupQr} alt="2FA QR code" width={220} height={220} unoptimized className="rounded-xl border border-gray-100" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500">Open your authenticator app and scan. If you can&apos;t scan, add this secret manually:</p>
                <code className="block mt-2 text-xs font-mono bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 break-all">{setupSecret}</code>
              </div>
            </div>

            <h3 className="text-sm font-semibold text-gray-900 mt-6 mb-3">2 · Enter the 6-digit code</h3>
            <input
              type="text"
              value={enrollCode}
              onChange={(e) => setEnrollCode(e.target.value)}
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="123456"
              className="w-full max-w-xs border border-gray-200 rounded-xl px-4 py-3 text-center text-lg font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            />

            {enrollError && (
              <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2 mt-3">{enrollError}</p>
            )}

            <div className="flex gap-2 mt-4">
              <button
                onClick={confirmEnroll}
                disabled={enrollLoading || !enrollCode.trim()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium transition-colors disabled:opacity-60"
              >
                {enrollLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                Enable 2FA
              </button>
              <button
                onClick={() => { setSetupSecret(null); setSetupQr(null); setEnrollCode(""); setEnrollError(null); }}
                className="px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-sm font-medium text-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {newBackupCodes && (
          <BackupCodesBlock codes={newBackupCodes} onDone={() => setNewBackupCodes(null)} />
        )}
      </div>

      {/* MANAGE flow — shown when already enabled */}
      {status?.enabled && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 max-w-4xl">
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-gray-500" /> Regenerate backup codes
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Invalidates your existing codes (used and unused) and issues 8 fresh ones. Needs your current 6-digit code.
            </p>
            <input
              type="text"
              value={regenCode}
              onChange={(e) => setRegenCode(e.target.value)}
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="6-digit code"
              className="mt-3 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            />
            {regenError && <p className="text-xs text-red-600 mt-2">{regenError}</p>}
            <button
              onClick={regenerate}
              disabled={regenLoading || !/^\d{6}$/.test(regenCode)}
              className="mt-3 inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-sm font-medium text-gray-700 disabled:opacity-60"
            >
              {regenLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Regenerate 8 new codes
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-red-100 p-6">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Ban className="w-4 h-4 text-red-500" /> Disable 2FA
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Removes the TOTP secret and deletes all backup codes. You&apos;ll sign in with just email + password afterwards.
            </p>
            <input
              type="text"
              value={disableCode}
              onChange={(e) => setDisableCode(e.target.value)}
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="6-digit code or backup code"
              className="mt-3 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            />
            {disableError && <p className="text-xs text-red-600 mt-2">{disableError}</p>}
            <button
              onClick={disable}
              disabled={disableLoading || !disableCode.trim()}
              className="mt-3 inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors disabled:opacity-60"
            >
              {disableLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Disable 2FA
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
