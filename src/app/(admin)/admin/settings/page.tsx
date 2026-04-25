"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Loader2, Settings as SettingsIcon, Save, RotateCcw, CheckCircle2, AlertTriangle, Info,
} from "lucide-react";
// Import the canonical group catalog so this page can't drift from settings.ts
// again. A new group in settings.ts now flows through automatically.
import {
  GROUP_LABELS,
  GROUP_ORDER,
  type SettingGroup,
  type SettingType as SettingTypeBase,
} from "@/lib/settings";

type SettingType = SettingTypeBase;

interface SettingDef {
  key: string;
  label: string;
  help?: string;
  type: SettingType;
  default: string;
  group: SettingGroup;
  maxLength?: number;
}

interface SettingValue {
  value: string;
  isDefault: boolean;
  updatedAt: string | null;
  updatedBy: string | null;
}

interface LoadResponse {
  defs: SettingDef[];
  values: Record<string, SettingValue>;
  env?: {
    stripeSecretConfigured: boolean;
    stripeWebhookConfigured: boolean;
    stripeMode: "test" | "live" | null;
  };
}

const GROUP_BLURB: Record<SettingGroup, string> = {
  branding: "Shown in site chrome and transactional emails.",
  regional: "Defaults for timezone, currency, and locale.",
  seo: "Fallback metadata for pages without their own.",
  legal: "Links surfaced in footer and signup.",
  features: "Live — toggling a flag takes effect within a few seconds. Flags labelled 'reserved' have no consumer yet.",
  email: "Envelope used for every transactional email. Leave blank to fall back to INVITATION.LK <noreply@invitation.lk>.",
};

function formatRelative(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  const diffMs = Date.now() - d.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return d.toLocaleDateString();
}

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [defs, setDefs] = useState<SettingDef[]>([]);
  const [values, setValues] = useState<Record<string, SettingValue>>({});
  const [env, setEnv] = useState<LoadResponse["env"] | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [topError, setTopError] = useState<string | null>(null);
  const [saveNote, setSaveNote] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setTopError(null);
    try {
      const res = await fetch("/api/admin/settings");
      if (!res.ok) {
        setTopError("Failed to load settings");
        return;
      }
      const data: LoadResponse = await res.json();
      setDefs(data.defs);
      setValues(data.values);
      setEnv(data.env ?? null);
      const initial: Record<string, string> = {};
      for (const def of data.defs) {
        initial[def.key] = data.values[def.key]?.value ?? def.default;
      }
      setForm(initial);
      setFieldErrors({});
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const dirty = useMemo(() => {
    const out: string[] = [];
    for (const def of defs) {
      const current = values[def.key]?.value ?? def.default;
      if ((form[def.key] ?? "") !== current) out.push(def.key);
    }
    return out;
  }, [defs, values, form]);

  const save = async () => {
    if (dirty.length === 0) return;
    setSaving(true);
    setTopError(null);
    setSaveNote(null);
    setFieldErrors({});
    try {
      const updates: Record<string, string> = {};
      for (const key of dirty) updates[key] = form[key] ?? "";

      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.errors && typeof data.errors === "object") {
          setFieldErrors(data.errors);
        }
        setTopError(data.error || "Failed to save");
        return;
      }

      const count = Array.isArray(data.updated) ? data.updated.length : 0;
      setSaveNote(
        count === 0
          ? "No changes to save."
          : `Saved ${count} setting${count === 1 ? "" : "s"}.`
      );
      await load();
    } catch {
      setTopError("Network error — please try again");
    } finally {
      setSaving(false);
    }
  };

  const resetOne = (key: string) => {
    const def = defs.find((d) => d.key === key);
    if (!def) return;
    setForm((f) => ({ ...f, [key]: def.default }));
    setFieldErrors((e) => {
      const { [key]: _removed, ...rest } = e;
      return rest;
    });
  };

  const revert = () => {
    const reset: Record<string, string> = {};
    for (const def of defs) {
      reset[def.key] = values[def.key]?.value ?? def.default;
    }
    setForm(reset);
    setFieldErrors({});
    setTopError(null);
    setSaveNote(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-rose-600 animate-spin" />
      </div>
    );
  }

  // Bucket defs by group. Using a Map with lazy init so an unknown group
  // coming from the server never crashes the page — it just gets hidden
  // (GROUP_ORDER controls what renders).
  const byGroup = new Map<SettingGroup, SettingDef[]>();
  for (const def of defs) {
    const list = byGroup.get(def.group) ?? [];
    list.push(def);
    byGroup.set(def.group, list);
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <SettingsIcon className="w-6 h-6 text-rose-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-400 mt-1">Global platform configuration.</p>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-start gap-3 max-w-4xl">
        <Info className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-900">
          <strong>Changes take effect within seconds.</strong> Feature flags gate live signup and checkout paths; email envelope edits apply to the next send. Flags labelled <em>reserved</em> in Feature flags have no consumer yet. Every save is written to the audit log.
        </p>
      </div>

      {topError && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 flex items-start gap-3 max-w-4xl">
          <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{topError}</p>
        </div>
      )}

      {saveNote && !topError && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-6 flex items-start gap-3 max-w-4xl">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-emerald-800">{saveNote}</p>
        </div>
      )}

      <div className="space-y-6 max-w-4xl">
        {GROUP_ORDER.map((group) => (
          <section key={group} className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-base font-semibold text-gray-900">{GROUP_LABELS[group]}</h2>
            <p className="text-xs text-gray-500 mt-1 mb-5">{GROUP_BLURB[group]}</p>
            <div className="space-y-5">
              {(byGroup.get(group) ?? []).map((def) => {
                const meta = values[def.key];
                const err = fieldErrors[def.key];
                const cur = form[def.key] ?? "";
                const isDirty = dirty.includes(def.key);
                return (
                  <div key={def.key} className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-3 md:gap-5">
                    <div className="min-w-0">
                      <label htmlFor={`s-${def.key}`} className="block text-sm font-medium text-gray-900">
                        {def.label}
                      </label>
                      <p className="text-[11px] text-gray-400 font-mono mt-0.5 truncate" title={def.key}>{def.key}</p>
                      {def.key === "feature_stripe" && env && (
                        <EnvBadge
                          configured={env.stripeSecretConfigured && env.stripeWebhookConfigured}
                          missing={
                            [
                              !env.stripeSecretConfigured && "STRIPE_SECRET_KEY",
                              !env.stripeWebhookConfigured && "STRIPE_WEBHOOK_SECRET",
                            ].filter(Boolean).join(" & ")
                          }
                          mode={env.stripeMode}
                        />
                      )}
                      {meta && !meta.isDefault && meta.updatedAt && (
                        <p className="text-[11px] text-gray-500 mt-1">
                          Saved {formatRelative(meta.updatedAt)}
                        </p>
                      )}
                      {meta?.isDefault && (
                        <p className="text-[11px] text-gray-400 mt-1">Using default</p>
                      )}
                    </div>
                    <div className="min-w-0">
                      {def.type === "bool" ? (
                        <div className="flex items-center gap-3">
                          <button
                            id={`s-${def.key}`}
                            type="button"
                            role="switch"
                            aria-checked={cur === "true"}
                            aria-label={def.label}
                            onClick={() => setForm((f) => ({ ...f, [def.key]: cur === "true" ? "false" : "true" }))}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              cur === "true" ? "bg-rose-600" : "bg-gray-200"
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                cur === "true" ? "translate-x-6" : "translate-x-1"
                              }`}
                            />
                          </button>
                          <span className="text-sm text-gray-700">
                            {cur === "true" ? "Enabled" : "Disabled"}
                          </span>
                          {isDirty && (
                            <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5 font-medium">unsaved</span>
                          )}
                        </div>
                      ) : def.type === "longtext" ? (
                        <textarea
                          id={`s-${def.key}`}
                          rows={3}
                          value={cur}
                          maxLength={def.maxLength}
                          onChange={(e) => setForm((f) => ({ ...f, [def.key]: e.target.value }))}
                          className={`w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 ${
                            err ? "border-red-300" : "border-gray-200"
                          }`}
                        />
                      ) : (
                        <input
                          id={`s-${def.key}`}
                          type={def.type === "email" ? "email" : def.type === "tel" ? "tel" : def.type === "url" ? "url" : "text"}
                          value={cur}
                          maxLength={def.maxLength}
                          placeholder={def.default || undefined}
                          onChange={(e) => setForm((f) => ({ ...f, [def.key]: e.target.value }))}
                          className={`w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 ${
                            err ? "border-red-300" : "border-gray-200"
                          }`}
                        />
                      )}

                      <div className="flex items-center justify-between gap-3 mt-1.5">
                        <div className="min-w-0 flex-1">
                          {def.help && !err && (
                            <p className="text-xs text-gray-500 truncate">{def.help}</p>
                          )}
                          {err && (
                            <p className="text-xs text-red-600">{err}</p>
                          )}
                        </div>
                        {def.type !== "bool" && isDirty && (
                          <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5 font-medium flex-shrink-0">unsaved</span>
                        )}
                        {cur !== def.default && (
                          <button
                            type="button"
                            onClick={() => resetOne(def.key)}
                            className="text-[11px] text-gray-400 hover:text-rose-600 transition-colors flex-shrink-0"
                          >
                            Reset to default
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <div className="sticky bottom-4 mt-6 max-w-4xl">
        <div className="bg-white/95 backdrop-blur border border-gray-200 rounded-2xl p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 shadow-sm">
          <p className="text-sm text-gray-600 min-w-0 flex-1 sm:flex-none">
            {dirty.length === 0
              ? "No changes."
              : `${dirty.length} unsaved change${dirty.length === 1 ? "" : "s"}.`}
          </p>
          <div className="flex gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={revert}
              disabled={dirty.length === 0 || saving}
              className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-sm font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
            >
              <RotateCcw className="w-4 h-4" /> Revert
            </button>
            <button
              type="button"
              onClick={save}
              disabled={dirty.length === 0 || saving}
              className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span className="hidden sm:inline">Save changes</span>
              <span className="sm:hidden">Save</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function EnvBadge({
  configured,
  missing,
  mode,
}: {
  configured: boolean;
  missing: string;
  mode: "test" | "live" | null;
}) {
  if (configured) {
    return (
      <div className="mt-1.5 flex flex-col gap-1">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-700 w-fit">
          ✓ Env configured
        </span>
        {mode && (
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold w-fit ${mode === "live" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"}`}>
            {mode === "live" ? "LIVE mode" : "TEST mode"}
          </span>
        )}
      </div>
    );
  }
  return (
    <div className="mt-1.5">
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-100 text-red-700 w-fit">
        ✗ Missing: {missing}
      </span>
    </div>
  );
}
