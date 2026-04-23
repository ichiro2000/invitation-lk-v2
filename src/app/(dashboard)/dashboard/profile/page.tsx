"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Loader2, User as UserIcon, Heart, Shield, Bell, Crown,
  Mail, Phone, Calendar, MapPin, LinkIcon, Copy, Check,
  Save, AlertTriangle, CheckCircle2, KeyRound, Eye, EyeOff,
  ArrowRight,
} from "lucide-react";

interface ProfileResponse {
  profile: {
    email: string;
    emailVerified: boolean;
    yourName: string;
    partnerName: string;
    phone: string | null;
    weddingDate: string; // YYYY-MM-DD or ""
    venue: string | null;
    plan: string;
    memberSince: string;
    notifyEmailUpdates: boolean;
    notifyRsvpAlerts: boolean;
    notifyMarketingEmails: boolean;
  };
  invitation: { slug: string; isPublished: boolean } | null;
  usage: { guestCount: number; pageViews: number };
  lastPayment: {
    plan: string;
    amount: string;
    currency: string;
    method: string;
    paidAt: string;
  } | null;
}

type NotifKey = "notifyEmailUpdates" | "notifyRsvpAlerts" | "notifyMarketingEmails";

const PLAN_BADGE: Record<string, string> = {
  FREE: "bg-gray-100 text-gray-600",
  BASIC: "bg-blue-100 text-blue-700",
  STANDARD: "bg-amber-100 text-amber-700",
  PREMIUM: "bg-rose-100 text-rose-700",
};

function formatDate(iso: string, opts: Intl.DateTimeFormatOptions = { year: "numeric", month: "short", day: "numeric" }): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, opts);
}

export default function ProfilePage() {
  const [data, setData] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    yourName: "",
    partnerName: "",
    phone: "",
    weddingDate: "",
    venue: "",
  });
  const [notif, setNotif] = useState({
    notifyEmailUpdates: true,
    notifyRsvpAlerts: true,
    notifyMarketingEmails: false,
  });

  const [saving, setSaving] = useState(false);
  const [topError, setTopError] = useState<string | null>(null);
  const [topNote, setTopNote] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/user/profile");
      if (res.ok) {
        const j: ProfileResponse = await res.json();
        setData(j);
        setForm({
          yourName: j.profile.yourName ?? "",
          partnerName: j.profile.partnerName ?? "",
          phone: j.profile.phone ?? "",
          weddingDate: j.profile.weddingDate ?? "",
          venue: j.profile.venue ?? "",
        });
        setNotif({
          notifyEmailUpdates: j.profile.notifyEmailUpdates,
          notifyRsvpAlerts: j.profile.notifyRsvpAlerts,
          notifyMarketingEmails: j.profile.notifyMarketingEmails,
        });
      } else {
        setTopError("Failed to load profile");
      }
    } catch {
      setTopError("Network error — please try again");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const savePersonalAndWedding = async () => {
    setSaving(true);
    setTopError(null);
    setTopNote(null);
    setFieldErrors({});
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const j = await res.json();
      if (!res.ok) {
        if (j.errors) setFieldErrors(j.errors);
        setTopError(j.error || "Failed to save");
        return;
      }
      setTopNote("Changes saved.");
      await load();
    } finally {
      setSaving(false);
    }
  };

  const toggleNotif = async (key: NotifKey) => {
    const next = { ...notif, [key]: !notif[key] };
    setNotif(next);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: next[key] }),
      });
      if (!res.ok) {
        // roll back
        setNotif(notif);
        setTopError("Failed to update notification preferences");
      }
    } catch {
      setNotif(notif);
      setTopError("Failed to update notification preferences");
    }
  };

  const copyInvitationUrl = async () => {
    if (!data?.invitation) return;
    const url = `${window.location.origin}/w/${data.invitation.slug}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  };

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-rose-600 animate-spin" />
      </div>
    );
  }

  const fullName = [data.profile.yourName, data.profile.partnerName].filter(Boolean).join(" & ") || "Your profile";
  const isPaid = data.profile.plan !== "FREE";
  const invitationUrl = data.invitation
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/w/${data.invitation.slug}`
    : "";

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-400 mt-1">Manage your personal information and account settings.</p>
      </div>

      {topError && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-800">{topError}</p>
        </div>
      )}
      {topNote && !topError && (
        <div className="mb-4 bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-emerald-800">{topNote}</p>
        </div>
      )}

      {/* Profile header banner */}
      <div className="rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-500 p-6 mb-6 text-white flex flex-wrap items-center gap-5">
        <div className="w-20 h-20 rounded-full bg-white/25 border-2 border-white/40 flex items-center justify-center text-3xl font-bold flex-shrink-0">
          {fullName.trim().charAt(0).toUpperCase() || "?"}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xl font-bold truncate">{fullName}</p>
          <p className="text-rose-50 text-sm truncate">{data.profile.email}</p>
          <span className={`inline-flex items-center gap-1.5 mt-2 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-white`}>
            <Crown className="w-3 h-3" /> {data.profile.plan} Plan
          </span>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <section className="bg-white rounded-2xl border border-gray-100 p-6">
          <header className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <UserIcon className="w-4 h-4" />
            </div>
            <h2 className="text-base font-semibold text-gray-900">Personal Information</h2>
          </header>
          <div className="space-y-4">
            <Field
              label="Full Name"
              icon={UserIcon}
              value={form.yourName}
              onChange={(v) => setForm((f) => ({ ...f, yourName: v }))}
              error={fieldErrors.yourName}
              placeholder="Your name"
            />
            <Field
              label="Partner Name"
              icon={Heart}
              value={form.partnerName}
              onChange={(v) => setForm((f) => ({ ...f, partnerName: v }))}
              error={fieldErrors.partnerName}
              placeholder="Partner's name"
            />
            <Field
              label="Email Address"
              icon={Mail}
              value={data.profile.email}
              readOnly
              hint={data.profile.emailVerified ? "Verified" : "Not verified"}
            />
            <Field
              label="Phone Number"
              icon={Phone}
              type="tel"
              value={form.phone}
              onChange={(v) => setForm((f) => ({ ...f, phone: v }))}
              error={fieldErrors.phone}
              placeholder="+94 77 123 4567"
            />
          </div>
        </section>

        {/* Wedding Information */}
        <section className="bg-white rounded-2xl border border-gray-100 p-6">
          <header className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Heart className="w-4 h-4" />
            </div>
            <h2 className="text-base font-semibold text-gray-900">Wedding Information</h2>
          </header>
          <div className="space-y-4">
            <Field
              label="Wedding Date"
              icon={Calendar}
              type="date"
              value={form.weddingDate}
              onChange={(v) => setForm((f) => ({ ...f, weddingDate: v }))}
              error={fieldErrors.weddingDate}
            />
            <Field
              label="Wedding Location"
              icon={MapPin}
              value={form.venue}
              onChange={(v) => setForm((f) => ({ ...f, venue: v }))}
              error={fieldErrors.venue}
              placeholder="Venue name"
            />
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">
                Invitation URL
              </label>
              {data.invitation ? (
                <div className="flex items-center gap-2">
                  <div className="flex-1 min-w-0 flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 bg-gray-50">
                    <LinkIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-sm text-gray-700 truncate font-mono">{invitationUrl}</span>
                  </div>
                  <button
                    type="button"
                    onClick={copyInvitationUrl}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors flex-shrink-0"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? "Copied" : "Copy Link"}
                  </button>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No invitation yet.</p>
              )}
              {data.invitation && !data.invitation.isPublished && (
                <p className="text-xs text-gray-400 mt-1.5">
                  Not published yet — only you and admins can view this link.
                </p>
              )}
            </div>
            <p className="text-xs text-gray-400">
              Editing date or venue here only updates your profile. To change what guests see,
              use the <Link href="/dashboard/editor" className="text-rose-600 hover:underline">invitation editor</Link>.
            </p>
          </div>
        </section>
      </div>

      {/* Save personal + wedding */}
      <div className="flex justify-end mt-4 mb-6">
        <button
          type="button"
          onClick={savePersonalAndWedding}
          disabled={saving}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium disabled:opacity-60 transition-colors"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Account Security */}
        <section className="bg-white rounded-2xl border border-gray-100 p-6">
          <header className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <h2 className="text-base font-semibold text-gray-900">Account Security</h2>
          </header>
          <p className="text-xs text-gray-500 mb-4">Keep your account safe and secure.</p>
          <ChangePasswordBlock />
        </section>

        {/* Notification Settings */}
        <section className="bg-white rounded-2xl border border-gray-100 p-6">
          <header className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <h2 className="text-base font-semibold text-gray-900">Notification Settings</h2>
          </header>
          <p className="text-xs text-gray-500 mb-4">
            Controls optional emails. Transactional emails (password reset, receipts, support
            replies) always send.
          </p>
          <div className="space-y-3">
            <Toggle
              label="Email Updates"
              desc="Occasional product updates and tips"
              checked={notif.notifyEmailUpdates}
              onChange={() => toggleNotif("notifyEmailUpdates")}
            />
            <Toggle
              label="RSVP Alerts"
              desc="Get pinged when a guest responds"
              checked={notif.notifyRsvpAlerts}
              onChange={() => toggleNotif("notifyRsvpAlerts")}
              badge="Coming soon"
            />
            <Toggle
              label="Marketing Emails"
              desc="Promotions, partner offers"
              checked={notif.notifyMarketingEmails}
              onChange={() => toggleNotif("notifyMarketingEmails")}
              badge="Coming soon"
            />
          </div>
        </section>

        {/* Plan */}
        <section className="bg-white rounded-2xl border border-gray-100 p-6">
          <header className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Crown className="w-4 h-4" />
              </div>
              <h2 className="text-base font-semibold text-gray-900">Your Plan</h2>
            </div>
            {isPaid && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-semibold">
                Active
              </span>
            )}
          </header>
          <p className="text-xs text-gray-500 mb-4">
            You are on {isPaid ? `the ${data.profile.plan} plan` : "the Free plan"}.
          </p>

          <div className={`rounded-xl p-4 border ${isPaid ? "border-rose-100 bg-rose-50/40" : "border-gray-100 bg-gray-50/50"}`}>
            <div className="flex items-center justify-between mb-3">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${PLAN_BADGE[data.profile.plan] ?? "bg-gray-100 text-gray-600"}`}>
                {data.profile.plan} Plan
              </span>
            </div>
            <dl className="space-y-2 text-xs">
              {data.lastPayment ? (
                <Row label="Last payment" value={`${data.lastPayment.currency} ${data.lastPayment.amount} · ${formatDate(data.lastPayment.paidAt)}`} />
              ) : (
                <Row label="Member since" value={formatDate(data.profile.memberSince)} />
              )}
              <Row label="Guests" value={String(data.usage.guestCount)} />
              <Row label="Page views" value={String(data.usage.pageViews)} />
            </dl>
          </div>

          <div className="flex gap-2 mt-4">
            {isPaid ? (
              <Link
                href="/dashboard/checkout"
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors"
              >
                Manage Plan
              </Link>
            ) : (
              <Link
                href="/dashboard/checkout"
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium transition-colors"
              >
                Upgrade Plan <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function Field({
  label,
  icon: Icon,
  value,
  onChange,
  error,
  hint,
  type = "text",
  placeholder,
  readOnly,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  value: string | null | undefined;
  onChange?: (v: string) => void;
  error?: string;
  hint?: string;
  type?: string;
  placeholder?: string;
  readOnly?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">{label}</label>
      <div className={`relative flex items-center border rounded-xl transition-colors ${error ? "border-red-300" : "border-gray-200 focus-within:border-rose-500 focus-within:ring-2 focus-within:ring-rose-500/20"} ${readOnly ? "bg-gray-50" : "bg-white"}`}>
        <Icon className="w-4 h-4 text-gray-400 absolute left-3" />
        <input
          type={type}
          value={value ?? ""}
          onChange={(e) => onChange?.(e.target.value)}
          readOnly={readOnly}
          placeholder={placeholder}
          className={`w-full pl-9 pr-3 py-2 text-sm focus:outline-none bg-transparent ${readOnly ? "text-gray-500 cursor-not-allowed" : "text-gray-900"}`}
        />
      </div>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
      {hint && !error && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

function Toggle({
  label,
  desc,
  checked,
  onChange,
  badge,
}: {
  label: string;
  desc: string;
  checked: boolean;
  onChange: () => void;
  badge?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-gray-900">{label}</p>
          {badge && (
            <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-1.5 py-0.5">
              {badge}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${checked ? "bg-rose-600" : "bg-gray-200"}`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? "translate-x-6" : "translate-x-1"}`}
        />
      </button>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-gray-500">{label}</dt>
      <dd className="text-gray-900 font-medium truncate text-right">{value}</dd>
    </div>
  );
}

function ChangePasswordBlock() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    setNote(null);
    if (!current || !next) {
      setError("Both fields are required");
      return;
    }
    if (next.length < 8) {
      setError("New password must be at least 8 characters");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/user/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      });
      const j = await res.json();
      if (!res.ok) {
        setError(j.error || "Failed to change password");
        return;
      }
      setNote("Password changed.");
      setCurrent("");
      setNext("");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      <PasswordInput
        label="Current password"
        value={current}
        onChange={setCurrent}
        show={showCurrent}
        toggleShow={() => setShowCurrent((s) => !s)}
        autoComplete="current-password"
      />
      <PasswordInput
        label="New password"
        value={next}
        onChange={setNext}
        show={showNext}
        toggleShow={() => setShowNext((s) => !s)}
        autoComplete="new-password"
        hint="At least 8 characters"
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      {note && <p className="text-xs text-emerald-700">{note}</p>}
      <button
        type="button"
        onClick={submit}
        disabled={saving || !current || next.length < 8}
        className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
        Change Password
      </button>
    </div>
  );
}

function PasswordInput({
  label,
  value,
  onChange,
  show,
  toggleShow,
  autoComplete,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  toggleShow: () => void;
  autoComplete?: string;
  hint?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">{label}</label>
      <div className="relative flex items-center border border-gray-200 rounded-xl focus-within:border-rose-500 focus-within:ring-2 focus-within:ring-rose-500/20">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          className="w-full px-3 py-2 text-sm focus:outline-none bg-transparent"
        />
        <button
          type="button"
          onClick={toggleShow}
          aria-label={show ? "Hide password" : "Show password"}
          className="text-gray-400 hover:text-gray-600 p-2 flex-shrink-0"
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}
