"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  Pencil, Heart, Calendar, Clock, MapPin, Plus, X, Save, Eye,
  ChevronDown, ChevronUp, Loader2, Smartphone, Monitor, Sparkles,
} from "lucide-react";
import type { InvitationEvent } from "@/types/invitation";

const templateOptions = [
  { slug: "royal-elegance", name: "Royal Elegance", color: "bg-[#5c2828]" },
  { slug: "modern-bloom", name: "Modern Bloom", color: "bg-pink-300" },
  { slug: "golden-lotus", name: "Golden Lotus", color: "bg-[#2a1515]" },
  { slug: "minimal-grace", name: "Minimal Grace", color: "bg-stone-200" },
  { slug: "tropical-paradise", name: "Tropical Paradise", color: "bg-teal-500" },
  { slug: "eternal-night", name: "Eternal Night", color: "bg-[#1a2744]" },
  { slug: "sinhala-mangalya", name: "Sinhala Mangalya", color: "bg-pink-400" },
  { slug: "vintage-botanical", name: "Vintage Botanical", color: "bg-green-600" },
  { slug: "rose-garden", name: "Rose Garden", color: "bg-rose-500" },
];

/* ── Collapsible Section ── */
function Section({ title, icon, defaultOpen = true, children }: {
  title: string; icon: React.ReactNode; defaultOpen?: boolean; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
      <button type="button" onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full px-5 py-3.5 hover:bg-gray-50/50 transition-colors">
        <span className="flex items-center gap-2.5 text-sm font-semibold text-gray-800">{icon}{title}</span>
        {open ? <ChevronUp className="w-4 h-4 text-gray-300" /> : <ChevronDown className="w-4 h-4 text-gray-300" />}
      </button>
      {open && <div className="px-5 pb-5 pt-1 space-y-4">{children}</div>}
    </div>
  );
}

/* ── Input helpers ── */
function FormInput({ label, value, onChange, placeholder, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <div>
      <label className="block text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-1.5">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-full bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 transition-all placeholder:text-gray-300" />
    </div>
  );
}

function FormTextarea({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-1.5">{label}</label>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={2}
        className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-2xl bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 transition-all resize-none placeholder:text-gray-300" />
    </div>
  );
}

export default function EditorPage() {
  const { data: session } = useSession();
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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [existingId, setExistingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [mobileTab, setMobileTab] = useState<"editor" | "preview">("editor");

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
          if (inv.weddingDate) setWeddingDate(new Date(inv.weddingDate).toISOString().split("T")[0]);
          setVenue(inv.venue || "");
          setVenueAddress(inv.venueAddress || "");
          if (inv.events?.length) {
            setEvents(inv.events.map((e: InvitationEvent) => ({
              title: e.title, time: e.time, venue: e.venue || "",
            })));
          }
        }
      } catch { /* no existing invitation */ }
      finally { setLoading(false); }
    }
    load();
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true); setSaveMessage("");
    try {
      const payload = { groomName, brideName, weddingDate: weddingDate ? new Date(weddingDate).toISOString() : undefined, venue, venueAddress, templateSlug, events };
      const method = existingId ? "PATCH" : "POST";
      const res = await fetch("/api/invitations", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const json = await res.json();
      if (res.ok) { if (json.invitation?.id) setExistingId(json.invitation.id); setSaveMessage("success"); }
      else setSaveMessage(json.error || "Failed to save");
    } catch { setSaveMessage("Network error"); }
    finally { setSaving(false); setTimeout(() => setSaveMessage(""), 3000); }
  }, [groomName, brideName, weddingDate, venue, venueAddress, templateSlug, events, existingId]);

  const updateEvent = (i: number, field: keyof InvitationEvent, value: string) => {
    setEvents((prev) => prev.map((ev, idx) => (idx === i ? { ...ev, [field]: value } : ev)));
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="w-6 h-6 animate-spin text-rose-500" />
    </div>
  );

  const selectedTemplate = templateOptions.find((t) => t.slug === templateSlug);

  return (
    <div className="-m-6 lg:-m-8 h-[calc(100vh-0px)] flex flex-col">
      {/* ── Mobile Tabs ── */}
      <div className="lg:hidden flex border-b border-gray-100 bg-white">
        <button onClick={() => setMobileTab("editor")}
          className={`flex-1 py-2.5 text-xs font-semibold text-center transition-colors flex items-center justify-center gap-1.5 ${mobileTab === "editor" ? "text-rose-600 border-b-2 border-rose-600" : "text-gray-400"}`}>
          <Pencil className="w-3.5 h-3.5" /> Editor
        </button>
        <button onClick={() => setMobileTab("preview")}
          className={`flex-1 py-2.5 text-xs font-semibold text-center transition-colors flex items-center justify-center gap-1.5 ${mobileTab === "preview" ? "text-rose-600 border-b-2 border-rose-600" : "text-gray-400"}`}>
          <Smartphone className="w-3.5 h-3.5" /> Preview
        </button>
      </div>

      {/* ── Split Layout ── */}
      <div className="flex-1 flex overflow-hidden">
        {/* ── Editor Panel ── */}
        <div className={`w-full lg:w-[420px] xl:w-[460px] lg:block bg-gray-50/50 border-r border-gray-100 flex-shrink-0 overflow-y-auto ${mobileTab === "editor" ? "block" : "hidden"}`}>
          <div className="p-4 lg:p-5 space-y-4">

            {/* Template Selector */}
            <div className="relative">
              <label className="block text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-1.5">Template</label>
              <button type="button" onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm border border-gray-200 rounded-full bg-white hover:border-gray-300 transition-colors">
                <div className={`w-5 h-5 rounded-md ${selectedTemplate?.color || "bg-gray-300"}`} />
                <span className="flex-1 text-left font-medium text-gray-800">{selectedTemplate?.name || "Select"}</span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
              </button>
              {dropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                  <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
                    {templateOptions.map((t) => (
                      <button key={t.slug} type="button"
                        onClick={() => { setTemplateSlug(t.slug); setDropdownOpen(false); }}
                        className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-sm hover:bg-rose-50 transition-colors ${templateSlug === t.slug ? "bg-rose-50 text-rose-700 font-medium" : "text-gray-700"}`}>
                        <div className={`w-4 h-4 rounded ${t.color}`} />
                        {t.name}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Couple */}
            <Section title="Couple Details" icon={<Heart className="w-4 h-4 text-rose-500" />}>
              <FormInput label="Groom Name" value={groomName} onChange={setGroomName} placeholder="Enter groom's name" />
              <FormInput label="Bride Name" value={brideName} onChange={setBrideName} placeholder="Enter bride's name" />
            </Section>

            {/* Wedding */}
            <Section title="Wedding Details" icon={<Calendar className="w-4 h-4 text-rose-500" />}>
              <div className="grid grid-cols-2 gap-3">
                <FormInput label="Date" value={weddingDate} onChange={setWeddingDate} type="date" />
                <FormInput label="Time" value={weddingTime} onChange={setWeddingTime} type="time" />
              </div>
              <FormInput label="Venue" value={venue} onChange={setVenue} placeholder="e.g. Cinnamon Grand, Colombo" />
              <FormTextarea label="Address" value={venueAddress} onChange={setVenueAddress} placeholder="Full venue address" />
            </Section>

            {/* Events */}
            <Section title="Events" icon={<Clock className="w-4 h-4 text-rose-500" />}>
              <div className="space-y-3">
                {events.map((ev, i) => (
                  <div key={i} className="relative rounded-xl border border-gray-100 bg-gray-50/80 p-3.5 space-y-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Event {i + 1}</span>
                      {events.length > 1 && (
                        <button type="button" onClick={() => setEvents(p => p.filter((_, idx) => idx !== i))}
                          className="p-1 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors">
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <FormInput label="Title" value={ev.title} onChange={(v) => updateEvent(i, "title", v)} placeholder="Ceremony" />
                      <FormInput label="Time" value={ev.time} onChange={(v) => updateEvent(i, "time", v)} placeholder="4:00 PM" />
                    </div>
                    <FormInput label="Venue" value={ev.venue || ""} onChange={(v) => updateEvent(i, "venue", v)} placeholder="Event venue" />
                  </div>
                ))}
              </div>
              <button type="button" onClick={() => setEvents(p => [...p, { title: "", time: "", venue: "" }])}
                className="flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 font-semibold mt-2 py-1">
                <Plus className="w-3.5 h-3.5" /> Add Event
              </button>
            </Section>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2 pb-4">
              <button onClick={handleSave} disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-rose-600 text-white text-sm font-semibold rounded-full hover:bg-rose-700 disabled:opacity-50 transition-colors shadow-lg shadow-rose-600/20">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Draft
              </button>
              <a href={`/samples/${templateSlug}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 text-gray-700 text-sm font-semibold rounded-full hover:bg-gray-50 transition-colors">
                <Eye className="w-4 h-4" /> Preview
              </a>
            </div>
            {saveMessage === "success" && (
              <p className="text-xs text-center text-green-600 font-medium flex items-center justify-center gap-1 -mt-2 pb-2">
                <Sparkles className="w-3 h-3" /> Saved successfully!
              </p>
            )}
          </div>
        </div>

        {/* ── Preview Panel ── */}
        <div className={`w-full lg:flex-1 lg:block overflow-hidden ${mobileTab === "preview" ? "block" : "hidden"}`}>
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 p-4 lg:p-8">
            {/* Phone Frame */}
            <div className="relative flex-shrink-0" style={{ width: 300, height: 620 }}>
              {/* Phone body */}
              <div className="absolute inset-0 bg-gray-900 rounded-[2.5rem] shadow-2xl shadow-gray-900/30" />
              {/* Screen area */}
              <div className="absolute inset-[5px] bg-white rounded-[2.2rem] overflow-hidden">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 bg-gray-900 rounded-b-xl z-10" />
                {/* Home indicator */}
                <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-20 h-1 bg-gray-300 rounded-full z-10" />
                {/* iframe */}
                <iframe
                  key={templateSlug}
                  src={`/samples/${templateSlug}`}
                  className="w-full h-full border-0"
                  title="Template Preview"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
