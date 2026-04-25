"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Calendar, MapPin, Pencil, ExternalLink, Copy, Check, Palette, FileText, Loader2, Plus, Trash2, X, Globe, EyeOff, Lock } from "lucide-react";
import { normalizeSlug } from "@/lib/slug";

interface Invitation {
  id: string;
  slug: string;
  templateSlug: string;
  groomName: string;
  brideName: string;
  weddingDate: string;
  venue: string;
  venueAddress: string | null;
  isPublished: boolean;
  isPaid: boolean;
  updatedAt: string;
}

export default function MyInvitationsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const isFreePlan = (session?.user?.plan ?? "FREE") === "FREE";
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [editingSlugId, setEditingSlugId] = useState<string | null>(null);
  const [slugDraft, setSlugDraft] = useState("");
  const [slugError, setSlugError] = useState<string | null>(null);
  const [savingSlug, setSavingSlug] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/invitations");
      const data = await res.json();
      setInvitations(Array.isArray(data?.invitations) ? data.invitations : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const publicUrl = (slug: string) =>
    typeof window !== "undefined" ? `${window.location.origin}/i/${slug}` : `/i/${slug}`;

  const copyLink = async (id: string, slug: string) => {
    await navigator.clipboard.writeText(publicUrl(slug));
    setCopiedId(id);
    setTimeout(() => setCopiedId((c) => (c === id ? null : c)), 1800);
  };

  const startEditSlug = (invitation: Invitation) => {
    setEditingSlugId(invitation.id);
    setSlugDraft(invitation.slug);
    setSlugError(null);
  };

  const cancelEditSlug = () => {
    setEditingSlugId(null);
    setSlugDraft("");
    setSlugError(null);
  };

  const saveSlug = async (id: string) => {
    const slug = normalizeSlug(slugDraft);
    if (!slug) {
      setSlugError("Enter a custom link");
      return;
    }
    setSavingSlug(true);
    setSlugError(null);
    try {
      const res = await fetch(`/api/invitations/${id}/slug`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setSlugError(data.error || "Failed to update link");
        return;
      }
      setInvitations((prev) => prev.map((i) => (i.id === id ? { ...i, slug: data.slug } : i)));
      cancelEditSlug();
    } catch {
      setSlugError("Network error — please try again");
    } finally {
      setSavingSlug(false);
    }
  };

  const createNew = async () => {
    setCreating(true);
    try {
      const res = await fetch("/api/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (res.ok && data.invitation?.id) {
        router.push(`/dashboard/editor?id=${data.invitation.id}`);
        return;
      }
      alert(data.error || "Failed to create invitation");
    } catch {
      alert("Network error — please try again");
    } finally {
      setCreating(false);
    }
  };

  const togglePublish = async (id: string, next: boolean) => {
    setPublishingId(id);
    try {
      const res = await fetch(`/api/invitations/${id}/publish`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: next }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 403 && data?.upgrade) {
          if (confirm(`${data.error}\n\nGo to upgrade page now?`)) {
            router.push("/dashboard/checkout");
          }
          return;
        }
        alert(data.error || "Failed to update status");
        return;
      }
      setInvitations((prev) => prev.map((i) => (i.id === id ? { ...i, isPublished: next } : i)));
    } catch {
      alert("Network error — please try again");
    } finally {
      setPublishingId(null);
    }
  };

  const deleteOne = async (id: string, label: string) => {
    if (!confirm(`Delete the invitation for ${label}? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/invitations/${id}`, { method: "DELETE" });
      if (res.ok) {
        setInvitations((prev) => prev.filter((i) => i.id !== id));
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Failed to delete invitation");
      }
    } catch {
      alert("Network error — please try again");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Invitations</h1>
          <p className="text-gray-400 mt-1">All invitations you have created.</p>
        </div>
        <button
          type="button"
          onClick={createNew}
          disabled={creating}
          className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-60 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-xl text-sm font-medium shadow-lg shadow-rose-600/20 transition-colors"
        >
          {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Create New
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-rose-500" />
        </div>
      ) : invitations.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-1">No invitation yet</h2>
          <p className="text-sm text-gray-400 mb-6 max-w-sm mx-auto">
            You haven&apos;t created an invitation yet. Click &ldquo;Create New&rdquo; to start with a blank invitation.
          </p>
          <button
            type="button"
            onClick={createNew}
            disabled={creating}
            className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white px-5 py-2.5 rounded-xl text-sm font-medium shadow-lg shadow-rose-600/20 transition-colors"
          >
            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Create New
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {invitations.map((invitation) => (
            <div key={invitation.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 sm:p-8">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
                  <div>
                    <p className="text-[10px] tracking-wider uppercase text-gray-400 mb-1">Wedding of</p>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                      {invitation.groomName || "Groom"} <span className="text-rose-500">&amp;</span>{" "}
                      {invitation.brideName || "Bride"}
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    {invitation.isPublished ? (
                      <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-green-50 text-green-600">Published</span>
                    ) : (
                      <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-600">Draft</span>
                    )}
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-4 text-sm text-gray-600 mb-6">
                  <div className="flex items-start gap-2">
                    <Calendar className="w-4 h-4 mt-0.5 text-gray-300 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] tracking-wider uppercase text-gray-400 mb-0.5">Date</p>
                      <p>{invitation.weddingDate ? new Date(invitation.weddingDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "—"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 mt-0.5 text-gray-300 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] tracking-wider uppercase text-gray-400 mb-0.5">Venue</p>
                      <p className="truncate">{invitation.venue || "—"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Palette className="w-4 h-4 mt-0.5 text-gray-300 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] tracking-wider uppercase text-gray-400 mb-0.5">Template</p>
                      <p className="capitalize">{invitation.templateSlug.replace(/-/g, " ")}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl bg-rose-50/50 border border-rose-100 p-4 mb-5">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Your invitation link</p>
                    {editingSlugId !== invitation.id && (
                      <button
                        type="button"
                        onClick={() => startEditSlug(invitation)}
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-600 hover:text-rose-700"
                      >
                        <Pencil className="w-3 h-3" /> Customize
                      </button>
                    )}
                  </div>
                  {editingSlugId === invitation.id ? (
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 flex items-stretch rounded-lg border border-rose-200 bg-white overflow-hidden focus-within:ring-2 focus-within:ring-rose-500/20">
                          <span className="px-3 py-2 text-sm text-gray-400 bg-rose-50/60 border-r border-rose-100 select-none whitespace-nowrap">
                            {typeof window !== "undefined" ? `${window.location.host}/i/` : "invitation.lk/i/"}
                          </span>
                          <input
                            autoFocus
                            value={slugDraft}
                            onChange={(e) => { setSlugDraft(e.target.value); setSlugError(null); }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") saveSlug(invitation.id);
                              if (e.key === "Escape") cancelEditSlug();
                            }}
                            placeholder="dinithi-and-isuru"
                            disabled={savingSlug}
                            className="flex-1 px-3 py-2 text-sm text-gray-700 focus:outline-none disabled:opacity-60"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => saveSlug(invitation.id)}
                          disabled={savingSlug}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white text-sm font-medium transition-colors"
                        >
                          {savingSlug ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />} Save
                        </button>
                        <button
                          type="button"
                          onClick={cancelEditSlug}
                          disabled={savingSlug}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-500 text-sm font-medium transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {slugError ? (
                        <p className="mt-2 text-xs text-red-600">{slugError}</p>
                      ) : (
                        <p className="mt-2 text-xs text-gray-500">
                          Lowercase letters, numbers and hyphens. Preview:{" "}
                          <span className="font-medium text-gray-700">
                            /i/{normalizeSlug(slugDraft) || invitation.slug}
                          </span>
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <input
                        value={publicUrl(invitation.slug)}
                        readOnly
                        onFocus={(e) => e.currentTarget.select()}
                        className="flex-1 px-3 py-2 text-sm bg-white border border-rose-100 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                      />
                      <button
                        type="button"
                        onClick={() => copyLink(invitation.id, invitation.slug)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium transition-colors"
                      >
                        {copiedId === invitation.id ? <><Check className="w-3.5 h-3.5" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/dashboard/editor?id=${invitation.id}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </Link>
                  <a
                    href={`/i/${invitation.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 hover:border-rose-300 hover:bg-rose-50 text-gray-700 hover:text-rose-600 text-sm font-medium transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Open Invitation
                  </a>
                  {invitation.isPublished ? (
                    <button
                      type="button"
                      onClick={() => togglePublish(invitation.id, false)}
                      disabled={publishingId === invitation.id}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 hover:border-amber-300 hover:bg-amber-50 text-gray-700 hover:text-amber-700 disabled:opacity-50 text-sm font-medium transition-colors"
                    >
                      {publishingId === invitation.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <EyeOff className="w-3.5 h-3.5" />}
                      Unpublish
                    </button>
                  ) : isFreePlan ? (
                    <Link
                      href="/dashboard/checkout"
                      title="Upgrade to a paid plan to publish your invitation"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-rose-200 hover:border-rose-400 hover:bg-rose-50 text-rose-600 hover:text-rose-700 text-sm font-medium transition-colors"
                    >
                      <Lock className="w-3.5 h-3.5" /> Upgrade to Publish
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => togglePublish(invitation.id, true)}
                      disabled={publishingId === invitation.id}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white disabled:opacity-60 text-sm font-medium shadow-lg shadow-green-600/20 transition-colors"
                    >
                      {publishingId === invitation.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Globe className="w-3.5 h-3.5" />}
                      Publish
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => deleteOne(invitation.id, `${invitation.groomName} & ${invitation.brideName}`)}
                    disabled={deletingId === invitation.id}
                    className="ml-auto inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 hover:border-red-300 hover:bg-red-50 text-gray-400 hover:text-red-600 disabled:opacity-50 text-sm font-medium transition-colors"
                  >
                    {deletingId === invitation.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
