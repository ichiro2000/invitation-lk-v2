"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, MapPin, Pencil, ExternalLink, Copy, Check, Palette, FileText, Loader2 } from "lucide-react";

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
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/invitations");
        const data = await res.json();
        setInvitation(data?.invitation || null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const publicPath = invitation ? `/i/${invitation.slug}` : "";
  const publicUrl = typeof window !== "undefined" && invitation ? `${window.location.origin}${publicPath}` : "";

  const copyLink = async () => {
    if (!publicUrl) return;
    await navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  if (loading) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">My Invitations</h1>
          <p className="text-gray-400 mt-1">All invitations you have created.</p>
        </div>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-rose-500" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Invitations</h1>
        <p className="text-gray-400 mt-1">All invitations you have created.</p>
      </div>

      {!invitation ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-1">No invitation yet</h2>
          <p className="text-sm text-gray-400 mb-6 max-w-sm mx-auto">
            You haven&apos;t created an invitation yet. Start from the editor to pick a template and fill in your details.
          </p>
          <Link
            href="/dashboard/editor"
            className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium shadow-lg shadow-rose-600/20 transition-colors"
          >
            <Pencil className="w-4 h-4" /> Create Invitation
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
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
                {!invitation.isPaid && (
                  <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-500">Unpaid</span>
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
              <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1.5">Your invitation link</p>
              <div className="flex items-center gap-2">
                <input
                  value={publicUrl}
                  readOnly
                  onFocus={(e) => e.currentTarget.select()}
                  className="flex-1 px-3 py-2 text-sm bg-white border border-rose-100 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                />
                <button
                  type="button"
                  onClick={copyLink}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium transition-colors"
                >
                  {copied ? <><Check className="w-3.5 h-3.5" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href="/dashboard/editor"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" /> Edit
              </Link>
              <a
                href={publicPath}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 hover:border-rose-300 hover:bg-rose-50 text-gray-700 hover:text-rose-600 text-sm font-medium transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Open Invitation
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
