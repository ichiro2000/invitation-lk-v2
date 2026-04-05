"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  Pencil,
  Heart,
  Calendar,
  Clock,
  MapPin,
  Plus,
  X,
  Save,
  Eye,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";
import type { InvitationEvent } from "@/types/invitation";

/* ── Template registry ── */
const templateOptions = [
  { slug: "royal-elegance", name: "Royal Elegance" },
  { slug: "golden-lotus", name: "Golden Lotus" },
  { slug: "eternal-night", name: "Eternal Night" },
  { slug: "modern-bloom", name: "Modern Bloom" },
  { slug: "vintage-botanical", name: "Vintage Botanical" },
  { slug: "minimal-grace", name: "Minimal Grace" },
  { slug: "tropical-paradise", name: "Tropical Paradise" },
  { slug: "sinhala-mangalya", name: "Sinhala Mangalya" },
  { slug: "rose-garden", name: "Rose Garden" },
] as const;

/* ── Collapsible Section ── */
function Section({
  title,
  icon,
  defaultOpen = true,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          {icon}
          {title}
        </span>
        {open ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>
      {open && <div className="p-4 space-y-3">{children}</div>}
    </div>
  );
}

/* ── Input helpers ── */
function FormInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-400 transition-colors"
      />
    </div>
  );
}

function FormTextarea({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={2}
        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-400 transition-colors resize-none"
      />
    </div>
  );
}

/* ── Main Editor Page ── */
export default function EditorPage() {
  const { data: session } = useSession();

  // Form state
  const [templateSlug, setTemplateSlug] = useState("royal-elegance");
  const [groomName, setGroomName] = useState("");
  const [brideName, setBrideName] = useState("");
  const [weddingDate, setWeddingDate] = useState("");
  const [weddingTime, setWeddingTime] = useState("16:00");
  const [venue, setVenue] = useState("");
  const [venueAddress, setVenueAddress] = useState("");
  const [events, setEvents] = useState<InvitationEvent[]>([
    { title: "Wedding Ceremony", time: "4:00 PM", venue: "" },
    { title: "Reception", time: "7:00 PM", venue: "" },
  ]);

  // UI state
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [existingId, setExistingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [mobileTab, setMobileTab] = useState<"editor" | "preview">("editor");

  // Collapsible sections
  const [coupleOpen, setCoupleOpen] = useState(true);
  const [detailsOpen, setDetailsOpen] = useState(true);
  const [eventsOpen, setEventsOpen] = useState(true);

  /* ── Load existing invitation ── */
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/invitations");
        const json = await res.json();
        if (json.invitation) {
          const inv = json.invitation;
          setExistingId(inv.id);
          setTemplateSlug(inv.templateSlug || "royal-elegance");
          setGroomName(inv.groomName || "");
          setBrideName(inv.brideName || "");
          if (inv.weddingDate) {
            const d = new Date(inv.weddingDate);
            setWeddingDate(d.toISOString().split("T")[0]);
          }
          setVenue(inv.venue || "");
          setVenueAddress(inv.venueAddress || "");
          if (inv.events?.length) {
            setEvents(
              inv.events.map((e: InvitationEvent & { description?: string }) => ({
                title: e.title,
                time: e.time,
                venue: e.venue || "",
                description: e.description || "",
              }))
            );
          }
        }
      } catch {
        // No existing invitation — that's fine
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  /* ── Save handler ── */
  const handleSave = useCallback(async () => {
    setSaving(true);
    setSaveMessage("");
    try {
      const payload = {
        groomName,
        brideName,
        weddingDate: weddingDate ? new Date(weddingDate).toISOString() : undefined,
        venue,
        venueAddress,
        templateSlug,
        events,
      };

      const method = existingId ? "PATCH" : "POST";
      const res = await fetch("/api/invitations", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (res.ok) {
        if (json.invitation?.id) setExistingId(json.invitation.id);
        setSaveMessage("Saved successfully!");
      } else {
        setSaveMessage(json.error || "Failed to save");
      }
    } catch {
      setSaveMessage("Network error. Please try again.");
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMessage(""), 3000);
    }
  }, [groomName, brideName, weddingDate, venue, venueAddress, templateSlug, events, existingId]);

  /* ── Event helpers ── */
  const updateEvent = (index: number, field: keyof InvitationEvent, value: string) => {
    setEvents((prev) =>
      prev.map((ev, i) => (i === index ? { ...ev, [field]: value } : ev))
    );
  };

  const addEvent = () => {
    setEvents((prev) => [...prev, { title: "", time: "", venue: "" }]);
  };

  const removeEvent = (index: number) => {
    setEvents((prev) => prev.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-rose-500" />
      </div>
    );
  }

  /* ── Editor Panel ── */
  const editorPanel = (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          <Pencil className="w-5 h-5 text-rose-600" />
          <h1 className="text-lg font-bold text-gray-900">Edit Invitation</h1>
        </div>

        {/* Template Switcher */}
        <div className="relative">
          <label className="block text-xs font-medium text-gray-500 mb-1">Template</label>
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-full flex items-center justify-between px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white hover:bg-gray-50 transition-colors"
          >
            <span>{templateOptions.find((t) => t.slug === templateSlug)?.name || "Select"}</span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>
          {dropdownOpen && (
            <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
              {templateOptions.map((t) => (
                <button
                  key={t.slug}
                  type="button"
                  onClick={() => {
                    setTemplateSlug(t.slug);
                    setDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-rose-50 transition-colors ${
                    templateSlug === t.slug
                      ? "bg-rose-50 text-rose-700 font-medium"
                      : "text-gray-700"
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Couple Details */}
        <Section
          title="Couple Details"
          icon={<Heart className="w-4 h-4 text-rose-500" />}
          defaultOpen={coupleOpen}
        >
          <FormInput
            label="Groom Name"
            value={groomName}
            onChange={setGroomName}
            placeholder={session?.user?.name || "Groom's name"}
          />
          <FormInput
            label="Bride Name"
            value={brideName}
            onChange={setBrideName}
            placeholder="Bride's name"
          />
        </Section>

        {/* Wedding Details */}
        <Section
          title="Wedding Details"
          icon={<Calendar className="w-4 h-4 text-rose-500" />}
          defaultOpen={detailsOpen}
        >
          <FormInput
            label="Date"
            value={weddingDate}
            onChange={setWeddingDate}
            type="date"
          />
          <FormInput
            label="Time"
            value={weddingTime}
            onChange={setWeddingTime}
            type="time"
          />
          <FormInput
            label="Venue"
            value={venue}
            onChange={setVenue}
            placeholder="e.g. Grand Ballroom"
          />
          <FormTextarea
            label="Venue Address"
            value={venueAddress}
            onChange={setVenueAddress}
            placeholder="Full address of the venue"
          />
        </Section>

        {/* Events */}
        <Section
          title="Events"
          icon={<Clock className="w-4 h-4 text-rose-500" />}
          defaultOpen={eventsOpen}
        >
          <div className="space-y-3">
            {events.map((ev, i) => (
              <div
                key={i}
                className="relative border border-gray-100 rounded-2xl p-3 bg-gray-50 space-y-2"
              >
                <button
                  type="button"
                  onClick={() => removeEvent(i)}
                  className="absolute top-2 right-2 p-1 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                <FormInput
                  label="Title"
                  value={ev.title}
                  onChange={(v) => updateEvent(i, "title", v)}
                  placeholder="e.g. Ceremony"
                />
                <FormInput
                  label="Time"
                  value={ev.time}
                  onChange={(v) => updateEvent(i, "time", v)}
                  placeholder="e.g. 4:00 PM"
                />
                <FormInput
                  label="Venue"
                  value={ev.venue || ""}
                  onChange={(v) => updateEvent(i, "venue", v)}
                  placeholder="Event venue"
                />
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addEvent}
            className="flex items-center gap-1.5 text-sm text-rose-600 hover:text-rose-700 font-medium mt-1"
          >
            <Plus className="w-4 h-4" />
            Add Event
          </button>
        </Section>
      </div>

      {/* Sticky action buttons */}
      <div className="sticky bottom-0 border-t border-gray-200 bg-white p-4 space-y-2">
        {saveMessage && (
          <p
            className={`text-xs text-center font-medium ${
              saveMessage.includes("success") ? "text-green-600" : "text-red-500"
            }`}
          >
            {saveMessage}
          </p>
        )}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-600 text-white text-sm font-semibold rounded-xl hover:bg-rose-700 disabled:opacity-50 transition-colors"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Draft
          </button>
          <a
            href={`/samples/${templateSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors"
          >
            <Eye className="w-4 h-4" />
            Preview Full Page
          </a>
        </div>
      </div>
    </div>
  );

  /* ── Preview Panel ── */
  const previewPanel = (
    <div className="flex items-start justify-center h-full overflow-auto bg-gray-100 p-6">
      {/* Phone frame */}
      <div
        className="relative bg-gray-900 rounded-[2.5rem] shadow-2xl flex-shrink-0"
        style={{ width: 320, height: 640, padding: 8 }}
      >
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-gray-900 rounded-b-2xl z-10" />
        {/* Home indicator */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-24 h-1 bg-gray-600 rounded-full z-10" />
        {/* Template via iframe — gets its own viewport */}
        <iframe
          key={templateSlug}
          src={`/samples/${templateSlug}`}
          className="w-full h-full rounded-[1.8rem] bg-white border-0"
          title="Template Preview"
        />
      </div>
    </div>
  );

  return (
    <div className="h-[calc(100vh-64px)] bg-gray-50 flex flex-col">
      {/* Mobile tabs */}
      <div className="md:hidden flex border-b border-gray-200 bg-white">
        <button
          type="button"
          onClick={() => setMobileTab("editor")}
          className={`flex-1 py-3 text-sm font-semibold text-center transition-colors ${
            mobileTab === "editor"
              ? "text-rose-600 border-b-2 border-rose-600"
              : "text-gray-500"
          }`}
        >
          Editor
        </button>
        <button
          type="button"
          onClick={() => setMobileTab("preview")}
          className={`flex-1 py-3 text-sm font-semibold text-center transition-colors ${
            mobileTab === "preview"
              ? "text-rose-600 border-b-2 border-rose-600"
              : "text-gray-500"
          }`}
        >
          Preview
        </button>
      </div>

      {/* Desktop split layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor — left panel (desktop), full-width (mobile when selected) */}
        <div
          className={`w-full md:w-[40%] md:block bg-white border-r border-gray-200 flex-shrink-0 overflow-hidden ${
            mobileTab === "editor" ? "block" : "hidden"
          }`}
        >
          {editorPanel}
        </div>

        {/* Preview — right panel (desktop), full-width (mobile when selected) */}
        <div
          className={`w-full md:w-[60%] md:block flex-1 overflow-hidden ${
            mobileTab === "preview" ? "block" : "hidden"
          }`}
        >
          {previewPanel}
        </div>
      </div>
    </div>
  );
}
