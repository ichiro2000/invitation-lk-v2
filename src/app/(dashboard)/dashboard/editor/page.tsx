"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import {
  Heart, Calendar, Clock, Plus, X, Save, Eye, Pencil, Smartphone,
  ChevronDown, ChevronUp, Loader2, Sparkles, Palette, LayoutList, Type,
} from "lucide-react";
import type { InvitationEvent } from "@/types/invitation";
import type { TemplateConfig, ThemeConfig, SectionConfig, ContentOverrides } from "@/types/template-config";
import { DEFAULT_SECTIONS, SECTION_LABELS, FONT_OPTIONS } from "@/types/template-config";
import { TEMPLATE_REGISTRY, getDefaultConfig, getDefaultTheme } from "@/lib/template-registry";
import { deepMerge } from "@/lib/deep-merge";

/* ------------------------------------------------------------------ */
/*  Reusable sub-components                                           */
/* ------------------------------------------------------------------ */

function Section({ id, title, icon, activeSection, setActiveSection, children }: {
  id: string; title: string; icon: React.ReactNode; activeSection: string | null; setActiveSection: (id: string | null) => void; children: React.ReactNode;
}) {
  const isOpen = activeSection === id;
  return (
    <div className="rounded-2xl border border-gray-100 overflow-hidden">
      <button type="button" onClick={() => setActiveSection(isOpen ? null : id)}
        className="flex items-center justify-between w-full px-5 py-3.5 hover:bg-gray-50/50 transition-colors">
        <span className="flex items-center gap-2.5 text-sm font-semibold text-gray-800">{icon}{title}</span>
        <ChevronDown className={`w-4 h-4 text-gray-300 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {isOpen && <div className="px-5 pb-5 pt-1 space-y-4 border-t border-gray-50">{children}</div>}
    </div>
  );
}

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

/* ------------------------------------------------------------------ */
/*  Editor Page                                                       */
/* ------------------------------------------------------------------ */

export default function EditorPage() {
  const { data: session } = useSession();

  /* ---- Core invitation fields ---- */
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

  /* ---- Config state (NEW) ---- */
  const [themeOverrides, setThemeOverrides] = useState<Partial<ThemeConfig>>({});
  const [sectionConfigs, setSectionConfigs] = useState<SectionConfig[]>([...DEFAULT_SECTIONS]);
  const [contentOverrides, setContentOverrides] = useState<ContentOverrides>({});

  /* ---- UI state ---- */
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [existingId, setExistingId] = useState<string | null>(null);
  const [invitationSlug, setInvitationSlug] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [mobileTab, setMobileTab] = useState<"editor" | "preview">("editor");
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  /* ---- Derived config values ---- */
  const defaultConfig = getDefaultConfig(templateSlug);
  const effectiveTheme: ThemeConfig = { ...getDefaultTheme(templateSlug), ...themeOverrides };

  const userConfig: TemplateConfig = {
    theme: Object.keys(themeOverrides).length > 0 ? themeOverrides : undefined,
    sections: sectionConfigs,
    content: Object.keys(contentOverrides).length > 0 ? contentOverrides : undefined,
  };
  const mergedConfig = deepMerge(defaultConfig, userConfig as Record<string, unknown>) as TemplateConfig;

  /* ---- Load existing invitation ---- */
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/invitations");
        const json = await res.json();
        if (json.invitation) {
          const inv = json.invitation;
          setExistingId(inv.id);
          setInvitationSlug(inv.slug || null);
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
          /* Load config */
          if (inv.config) {
            const c = inv.config as TemplateConfig;
            if (c.theme) setThemeOverrides(c.theme);
            if (c.sections) setSectionConfigs(c.sections);
            if (c.content) setContentOverrides(c.content);
          }
        }
      } catch { /* no existing invitation */ }
      finally { setLoading(false); }
    }
    load();
  }, []);

  /* ---- PostMessage preview updates ---- */
  const sendPreviewUpdate = useCallback(() => {
    const previewData = {
      groomName: groomName || "Groom",
      brideName: brideName || "Bride",
      weddingDate: weddingDate || new Date().toISOString().split("T")[0],
      weddingTime: weddingTime
        ? new Date(`2000-01-01T${weddingTime}`).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
        : "4:00 PM",
      venue: venue || "Wedding Venue",
      venueAddress: venueAddress || "",
      events: events.length ? events : [{ title: "Ceremony", time: "4:00 PM" }],
    };

    iframeRef.current?.contentWindow?.postMessage({
      type: "preview-update",
      templateSlug,
      data: previewData,
      config: userConfig,
    }, window.location.origin);
  }, [templateSlug, groomName, brideName, weddingDate, weddingTime, venue, venueAddress, events, themeOverrides, sectionConfigs, contentOverrides]); // eslint-disable-line react-hooks/exhaustive-deps

  /* Send on every state change */
  useEffect(() => {
    sendPreviewUpdate();
  }, [sendPreviewUpdate]);

  /* Listen for iframe ready */
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === "preview-ready") sendPreviewUpdate();
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [sendPreviewUpdate]);

  /* ---- Template change resets config ---- */
  const handleTemplateChange = (slug: string) => {
    setTemplateSlug(slug);
    setThemeOverrides({});
    setSectionConfigs([...DEFAULT_SECTIONS]);
    setContentOverrides({});
    setDropdownOpen(false);
  };

  /* ---- Save ---- */
  const handleSave = useCallback(async () => {
    setSaving(true); setSaveMessage("");
    try {
      /* Build config payload */
      const config: TemplateConfig = {};
      if (Object.keys(themeOverrides).length > 0) config.theme = themeOverrides;
      if (sectionConfigs.some((s, i) => s.visible !== DEFAULT_SECTIONS[i]?.visible || s.order !== DEFAULT_SECTIONS[i]?.order)) {
        config.sections = sectionConfigs;
      }
      if (Object.keys(contentOverrides).length > 0) config.content = contentOverrides;

      const payload = {
        groomName,
        brideName,
        weddingDate: weddingDate ? new Date(weddingDate).toISOString() : undefined,
        venue,
        venueAddress,
        templateSlug,
        events,
        config: Object.keys(config).length > 0 ? config : null,
      };
      const method = existingId ? "PATCH" : "POST";
      const res = await fetch("/api/invitations", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const json = await res.json();
      if (res.ok) {
        if (json.invitation?.id) { setExistingId(json.invitation.id); setInvitationSlug(json.invitation.slug); }
        setSaveMessage("success");
      } else {
        setSaveMessage(json.error || "Failed to save");
      }
    } catch { setSaveMessage("Network error"); }
    finally { setSaving(false); setTimeout(() => setSaveMessage(""), 3000); }
  }, [groomName, brideName, weddingDate, venue, venueAddress, templateSlug, events, existingId, themeOverrides, sectionConfigs, contentOverrides]);

  /* ---- Section reorder helpers ---- */
  const toggleSection = (id: string) => {
    setSectionConfigs(prev => prev.map(s => s.id === id ? { ...s, visible: !s.visible } : s));
  };

  const moveSectionUp = (id: string) => {
    setSectionConfigs(prev => {
      const sorted = [...prev].sort((a, b) => a.order - b.order);
      const idx = sorted.findIndex(s => s.id === id);
      if (idx <= 0) return prev;
      const newOrder = sorted[idx - 1].order;
      sorted[idx - 1].order = sorted[idx].order;
      sorted[idx].order = newOrder;
      return [...sorted];
    });
  };

  const moveSectionDown = (id: string) => {
    setSectionConfigs(prev => {
      const sorted = [...prev].sort((a, b) => a.order - b.order);
      const idx = sorted.findIndex(s => s.id === id);
      if (idx < 0 || idx >= sorted.length - 1) return prev;
      const newOrder = sorted[idx + 1].order;
      sorted[idx + 1].order = sorted[idx].order;
      sorted[idx].order = newOrder;
      return [...sorted];
    });
  };

  /* ---- Event helpers ---- */
  const updateEvent = (i: number, field: keyof InvitationEvent, value: string) => {
    setEvents((prev) => prev.map((ev, idx) => (idx === i ? { ...ev, [field]: value } : ev)));
  };

  /* ---- Loading state ---- */
  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="w-6 h-6 animate-spin text-rose-500" />
    </div>
  );

  const selectedTemplate = TEMPLATE_REGISTRY.find((t) => t.slug === templateSlug);

  return (
    <div className="-m-6 lg:-m-8 h-[calc(100vh-0px)] flex flex-col">
      {/* Mobile Tabs */}
      <div className="lg:hidden flex border-b border-gray-100 bg-white">
        <button onClick={() => setMobileTab("editor")}
          className={`flex-1 py-2.5 text-xs font-semibold text-center flex items-center justify-center gap-1.5 ${mobileTab === "editor" ? "text-rose-600 border-b-2 border-rose-600" : "text-gray-400"}`}>
          <Pencil className="w-3.5 h-3.5" /> Editor
        </button>
        <button onClick={() => setMobileTab("preview")}
          className={`flex-1 py-2.5 text-xs font-semibold text-center flex items-center justify-center gap-1.5 ${mobileTab === "preview" ? "text-rose-600 border-b-2 border-rose-600" : "text-gray-400"}`}>
          <Smartphone className="w-3.5 h-3.5" /> Preview
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* ── Editor Panel ── */}
        <div className={`w-full lg:w-1/2 xl:w-[45%] lg:block bg-gray-50 border-r border-gray-100 flex-shrink-0 overflow-y-auto ${mobileTab === "editor" ? "block" : "hidden"}`}>
          <div className="p-5 lg:p-6 max-w-xl mx-auto">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 lg:p-6 space-y-4">

            {/* Template Selector */}
            <div className="relative">
              <label className="block text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-1.5">Template</label>
              <button type="button" onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm border border-gray-200 rounded-full bg-white hover:border-gray-300 transition-colors">
                <div className={`w-5 h-5 rounded-md ${selectedTemplate?.colorSwatch || "bg-gray-300"}`} />
                <span className="flex-1 text-left font-medium text-gray-800">{selectedTemplate?.name || "Select"}</span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
              </button>
              {dropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                  <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
                    {TEMPLATE_REGISTRY.map((t) => (
                      <button key={t.slug} type="button"
                        onClick={() => handleTemplateChange(t.slug)}
                        className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-sm hover:bg-rose-50 transition-colors ${templateSlug === t.slug ? "bg-rose-50 text-rose-700 font-medium" : "text-gray-700"}`}>
                        <div className={`w-4 h-4 rounded ${t.colorSwatch}`} />
                        {t.name}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* 1. Couple Details */}
            <Section id="couple" title="Couple Details" icon={<Heart className="w-4 h-4 text-rose-500" />} activeSection={activeSection} setActiveSection={setActiveSection}>
              <FormInput label="Groom Name" value={groomName} onChange={setGroomName} placeholder="Enter groom's name" />
              <FormInput label="Bride Name" value={brideName} onChange={setBrideName} placeholder="Enter bride's name" />
            </Section>

            {/* 2. Wedding Details */}
            <Section id="wedding" title="Wedding Details" icon={<Calendar className="w-4 h-4 text-rose-500" />} activeSection={activeSection} setActiveSection={setActiveSection}>
              <div className="grid grid-cols-2 gap-3">
                <FormInput label="Date" value={weddingDate} onChange={setWeddingDate} type="date" />
                <FormInput label="Time" value={weddingTime} onChange={setWeddingTime} type="time" />
              </div>
              <FormInput label="Venue" value={venue} onChange={setVenue} placeholder="e.g. Cinnamon Grand, Colombo" />
              <FormTextarea label="Address" value={venueAddress} onChange={setVenueAddress} placeholder="Full venue address" />
            </Section>

            {/* 3. Events */}
            <Section id="events" title="Events" icon={<Clock className="w-4 h-4 text-rose-500" />} activeSection={activeSection} setActiveSection={setActiveSection}>
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

            {/* 4. Style & Colors (NEW) */}
            <Section id="style" title="Style & Colors" icon={<Palette className="w-4 h-4 text-rose-500" />} activeSection={activeSection} setActiveSection={setActiveSection}>
              <div className="space-y-4">
                {[
                  { key: "primaryColor", label: "Primary Color" },
                  { key: "secondaryColor", label: "Secondary Color" },
                  { key: "backgroundColor", label: "Background" },
                  { key: "textColor", label: "Text Color" },
                  { key: "accentColor", label: "Accent Color" },
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center justify-between">
                    <label className="text-xs text-gray-500">{label}</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={(themeOverrides as Record<string, string>)[key] || effectiveTheme[key as keyof ThemeConfig] as string}
                        onChange={(e) => setThemeOverrides(prev => ({ ...prev, [key]: e.target.value }))}
                        className="w-8 h-8 rounded-full border border-gray-200 cursor-pointer"
                      />
                      {(themeOverrides as Record<string, string>)[key] && (
                        <button
                          onClick={() => setThemeOverrides(prev => {
                            const n = { ...prev };
                            delete (n as Record<string, unknown>)[key];
                            return n;
                          })}
                          className="text-[10px] text-gray-400 hover:text-rose-500"
                        >
                          Reset
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                <div>
                  <label className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-1.5 block">Font Family</label>
                  <select
                    value={themeOverrides.fontFamily || effectiveTheme.fontFamily}
                    onChange={(e) => setThemeOverrides(prev => ({ ...prev, fontFamily: e.target.value as ThemeConfig["fontFamily"] }))}
                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-full bg-gray-50/50"
                  >
                    {FONT_OPTIONS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                  </select>
                </div>
              </div>
            </Section>

            {/* 5. Sections (NEW) */}
            <Section id="sections" title="Sections" icon={<LayoutList className="w-4 h-4 text-rose-500" />} activeSection={activeSection} setActiveSection={setActiveSection}>
              <div className="space-y-2">
                {[...sectionConfigs].sort((a, b) => a.order - b.order).map((sec, idx) => (
                  <div key={sec.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col gap-0.5">
                        <button disabled={idx === 0} onClick={() => moveSectionUp(sec.id)}
                          className="p-0.5 text-gray-300 hover:text-gray-600 disabled:opacity-30">
                          <ChevronUp className="w-3 h-3" />
                        </button>
                        <button disabled={idx === sectionConfigs.length - 1} onClick={() => moveSectionDown(sec.id)}
                          className="p-0.5 text-gray-300 hover:text-gray-600 disabled:opacity-30">
                          <ChevronDown className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="text-sm text-gray-700">{SECTION_LABELS[sec.id]}</span>
                    </div>
                    <button onClick={() => toggleSection(sec.id)}
                      className={`w-10 h-5 rounded-full transition-colors ${sec.visible ? "bg-rose-500" : "bg-gray-200"}`}>
                      <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${sec.visible ? "translate-x-5" : "translate-x-0.5"}`} />
                    </button>
                  </div>
                ))}
              </div>
            </Section>

            {/* 6. Content (NEW) */}
            <Section id="content" title="Content" icon={<Type className="w-4 h-4 text-rose-500" />} activeSection={activeSection} setActiveSection={setActiveSection}>
              <FormInput
                label="Hero Subtitle"
                value={contentOverrides.hero?.subtitle || ""}
                onChange={(v) => setContentOverrides(p => ({ ...p, hero: { ...p.hero, subtitle: v } }))}
                placeholder={defaultConfig.content?.hero?.subtitle || "Together with their families"}
              />
              <FormTextarea
                label="Hero Message"
                value={contentOverrides.hero?.message || ""}
                onChange={(v) => setContentOverrides(p => ({ ...p, hero: { ...p.hero, message: v } }))}
                placeholder={defaultConfig.content?.hero?.message || "Request the honour of your presence"}
              />
              <FormInput
                label="Story Section Title"
                value={contentOverrides.story?.title || ""}
                onChange={(v) => setContentOverrides(p => ({ ...p, story: { ...p.story, title: v } }))}
                placeholder={defaultConfig.content?.story?.title || "Our Love Story"}
              />
              <FormInput
                label="RSVP Title"
                value={contentOverrides.rsvp?.title || ""}
                onChange={(v) => setContentOverrides(p => ({ ...p, rsvp: { ...p.rsvp, title: v } }))}
                placeholder={defaultConfig.content?.rsvp?.title || "Will You Join Us?"}
              />
              <FormInput
                label="RSVP Deadline"
                value={contentOverrides.rsvp?.deadline || ""}
                onChange={(v) => setContentOverrides(p => ({ ...p, rsvp: { ...p.rsvp, deadline: v } }))}
                placeholder="Kindly respond by..."
              />
            </Section>

            {/* Your Invitation Link */}
            {invitationSlug && (
              <div className="rounded-2xl border border-rose-100 bg-rose-50/50 p-4">
                <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-2">Your Invitation Link</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 truncate">
                    invitation.lk/i/{invitationSlug}
                  </div>
                  <button
                    type="button"
                    onClick={() => { navigator.clipboard.writeText(`https://invitation.lk/i/${invitationSlug}`); setSaveMessage("copied"); setTimeout(() => setSaveMessage(""), 2000); }}
                    className="px-3 py-2 bg-rose-600 text-white text-xs font-semibold rounded-full hover:bg-rose-700 transition-colors shrink-0">
                    Copy
                  </button>
                </div>
                {saveMessage === "copied" && (
                  <p className="text-[11px] text-rose-600 mt-1.5 font-medium">Link copied!</p>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-2 pb-4">
              <button onClick={handleSave} disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-rose-600 text-white text-sm font-semibold rounded-full hover:bg-rose-700 disabled:opacity-50 transition-colors shadow-lg shadow-rose-600/20">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Draft
              </button>
              <a href={invitationSlug ? `/i/${invitationSlug}` : `/samples/${templateSlug}`} target="_blank" rel="noopener noreferrer"
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
        </div>

        {/* ── Live Preview Panel ── */}
        <div className={`w-full lg:w-1/2 xl:w-[55%] lg:flex overflow-hidden bg-gray-50 items-center justify-center ${mobileTab === "preview" ? "flex" : "hidden"}`}>
          {/* Phone mockup */}
          <div className="relative flex-shrink-0" style={{ width: 320, height: 660 }}>
            {/* Bezel */}
            <div className="absolute inset-0 bg-gray-900 rounded-[3rem] shadow-2xl shadow-black/25" />
            {/* Side buttons */}
            <div className="absolute -right-[2px] top-28 w-[3px] h-8 bg-gray-700 rounded-r-sm" />
            <div className="absolute -left-[2px] top-24 w-[3px] h-6 bg-gray-700 rounded-l-sm" />
            <div className="absolute -left-[2px] top-36 w-[3px] h-10 bg-gray-700 rounded-l-sm" />
            <div className="absolute -left-[2px] top-48 w-[3px] h-10 bg-gray-700 rounded-l-sm" />
            {/* Screen — iframe with PostMessage-driven preview */}
            <div className="absolute inset-[4px] rounded-[2.6rem] overflow-hidden bg-white">
              {/* Dynamic Island */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[80px] h-[20px] bg-black rounded-full z-20" />
              <iframe
                ref={iframeRef}
                src="/i/preview"
                className="w-full h-full border-0"
                title="Invitation Preview"
              />
            </div>
            {/* Home indicator */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-24 h-[4px] bg-white/70 rounded-full z-20" />
          </div>
          {/* Save hint */}
          {!invitationSlug && (
            <p className="absolute bottom-4 text-xs text-gray-400">Save your draft to see your invitation preview</p>
          )}
        </div>
      </div>
    </div>
  );
}
