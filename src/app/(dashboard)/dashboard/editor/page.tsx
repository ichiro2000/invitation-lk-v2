"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import {
  Heart, Calendar, Clock, Plus, X, Save, Eye, Pencil, Smartphone,
  ChevronDown, Loader2, Sparkles, Palette, Type,
  MapPin, ImagePlus, Trash2,
} from "lucide-react";
import type { InvitationEvent } from "@/types/invitation";
import type { TemplateConfig, ThemeConfig, SectionConfig, ContentOverrides } from "@/types/template-config";
import { DEFAULT_SECTIONS, SECTION_LABELS, FONT_OPTIONS } from "@/types/template-config";
import { TEMPLATE_REGISTRY, getDefaultConfig, getDefaultTheme } from "@/lib/template-registry";
import { deepMerge } from "@/lib/deep-merge";

/* ------------------------------------------------------------------ */
/*  Reusable sub-components                                           */
/* ------------------------------------------------------------------ */

function Section({ id, title, icon, activeSection, setActiveSection, children, draggable: isDraggable, onDragStart, onDragOver, onDragLeave, onDrop, onDragEnd, isDragging, isDragOver, visible, onToggleVisible }: {
  id: string; title: string; icon: React.ReactNode; activeSection: string | null; setActiveSection: (id: string | null) => void; children: React.ReactNode;
  draggable?: boolean; onDragStart?: () => void; onDragOver?: (e: React.DragEvent) => void; onDragLeave?: () => void; onDrop?: () => void; onDragEnd?: () => void;
  isDragging?: boolean; isDragOver?: boolean; visible?: boolean; onToggleVisible?: () => void;
}) {
  const isOpen = activeSection === id;
  return (
    <div
      draggable={isDraggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className={`rounded-2xl border overflow-hidden transition-all ${
        isDragging ? "opacity-40 scale-[0.98] border-gray-200" : ""
      } ${isDragOver ? "border-2 border-dashed border-rose-300 bg-rose-50/30" : "border-gray-100"
      } ${visible === false ? "opacity-50" : ""}`}
    >
      <div className="flex items-center gap-0">
        {/* Drag handle */}
        {isDraggable && (
          <div className="pl-3 pr-1 py-3.5 cursor-grab active:cursor-grabbing flex flex-col gap-[2px] text-gray-300 select-none">
            <div className="flex gap-[2px]"><div className="w-1 h-1 rounded-full bg-current" /><div className="w-1 h-1 rounded-full bg-current" /></div>
            <div className="flex gap-[2px]"><div className="w-1 h-1 rounded-full bg-current" /><div className="w-1 h-1 rounded-full bg-current" /></div>
            <div className="flex gap-[2px]"><div className="w-1 h-1 rounded-full bg-current" /><div className="w-1 h-1 rounded-full bg-current" /></div>
          </div>
        )}
        {/* Section header button */}
        <button type="button" onClick={() => setActiveSection(isOpen ? null : id)}
          className={`flex-1 flex items-center justify-between ${isDraggable ? "pl-1 pr-3" : "px-5"} py-3.5 hover:bg-gray-50/50 transition-colors`}>
          <span className="flex items-center gap-2.5 text-sm font-semibold text-gray-800">{icon}{title}</span>
          <ChevronDown className={`w-4 h-4 text-gray-300 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>
        {/* Visibility toggle */}
        {onToggleVisible && (
          <button onClick={(e) => { e.stopPropagation(); onToggleVisible(); }}
            className={`mr-3 w-9 h-[18px] rounded-full transition-colors flex-shrink-0 ${visible !== false ? "bg-rose-500" : "bg-gray-200"}`}>
            <div className={`w-3.5 h-3.5 bg-white rounded-full shadow-sm transform transition-transform ${visible !== false ? "translate-x-[18px]" : "translate-x-0.5"}`} />
          </button>
        )}
      </div>
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
          if (inv.weddingDate) {
            const d = new Date(inv.weddingDate);
            setWeddingDate(d.toISOString().split("T")[0]);
            const h = d.getUTCHours().toString().padStart(2, "0");
            const m = d.getUTCMinutes().toString().padStart(2, "0");
            if (h !== "00" || m !== "00") setWeddingTime(`${h}:${m}`);
          }
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
        weddingDate: weddingDate ? new Date(`${weddingDate}T${weddingTime || "16:00"}:00`).toISOString() : undefined,
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

  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const handleDragStart = (id: string) => { setDragId(id); };
  const handleDragOver = (e: React.DragEvent, id: string) => { e.preventDefault(); setDragOverId(id); };
  const handleDragLeave = () => { setDragOverId(null); };
  const handleDrop = (targetId: string) => {
    if (!dragId || dragId === targetId) { setDragId(null); setDragOverId(null); return; }
    setSectionConfigs(prev => {
      const sorted = [...prev].sort((a, b) => a.order - b.order);
      const fromIdx = sorted.findIndex(s => s.id === dragId);
      const toIdx = sorted.findIndex(s => s.id === targetId);
      if (fromIdx < 0 || toIdx < 0) return prev;
      const [moved] = sorted.splice(fromIdx, 1);
      sorted.splice(toIdx, 0, moved);
      return sorted.map((s, i) => ({ ...s, order: i }));
    });
    setDragId(null);
    setDragOverId(null);
  };
  const handleDragEnd = () => { setDragId(null); setDragOverId(null); };

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

            {/* ═══ SECTION-BASED EDITING (draggable + toggleable) ═══ */}
            <p className="text-[10px] text-gray-400 text-center -mb-2">Drag sections to reorder. Toggle to show/hide.</p>

            {[...sectionConfigs].sort((a, b) => a.order - b.order).map((sec) => {
              const secVis = sec.visible;
              const dProps = {
                draggable: true as const,
                onDragStart: () => handleDragStart(sec.id),
                onDragOver: (e: React.DragEvent) => handleDragOver(e, sec.id),
                onDragLeave: handleDragLeave,
                onDrop: () => handleDrop(sec.id),
                onDragEnd: handleDragEnd,
                isDragging: dragId === sec.id,
                isDragOver: dragOverId === sec.id && dragId !== sec.id,
                visible: secVis,
                onToggleVisible: () => toggleSection(sec.id),
              };

              switch (sec.id) {
                case "hero": return (
                  <Section key="hero" id="hero" title="Hero / Couple Intro" icon={<Heart className="w-4 h-4 text-rose-500" />} activeSection={activeSection} setActiveSection={setActiveSection} {...dProps}>
                    <FormInput label="Groom Name" value={groomName} onChange={setGroomName} placeholder="Enter groom's name" />
                    <FormInput label="Bride Name" value={brideName} onChange={setBrideName} placeholder="Enter bride's name" />
                    <FormInput label="Subtitle" value={contentOverrides.hero?.subtitle || ""} onChange={(v) => setContentOverrides(p => ({ ...p, hero: { ...p.hero, subtitle: v } }))} placeholder={defaultConfig.content?.hero?.subtitle || "Together with their families"} />
                    <FormTextarea label="Message" value={contentOverrides.hero?.message || ""} onChange={(v) => setContentOverrides(p => ({ ...p, hero: { ...p.hero, message: v } }))} placeholder={defaultConfig.content?.hero?.message || "Request the honour..."} />
                    <div className="grid grid-cols-2 gap-3">
                      <FormInput label="Wedding Date" value={weddingDate} onChange={setWeddingDate} type="date" />
                      <FormInput label="Wedding Time" value={weddingTime} onChange={setWeddingTime} type="time" />
                    </div>
                  </Section>
                );
                case "countdown": return (
                  <Section key="countdown" id="countdown" title="Countdown Timer" icon={<Clock className="w-4 h-4 text-rose-500" />} activeSection={activeSection} setActiveSection={setActiveSection} {...dProps}>
                    <p className="text-xs text-gray-500">Countdown automatically uses the wedding date above.</p>
                  </Section>
                );
                case "story": return (
                  <Section key="story" id="story" title="Love Story" icon={<Heart className="w-4 h-4 text-rose-500" />} activeSection={activeSection} setActiveSection={setActiveSection} {...dProps}>
                    <FormInput label="Section Title" value={contentOverrides.story?.title || ""} onChange={(v) => setContentOverrides(p => ({ ...p, story: { ...p.story, title: v } }))} placeholder={defaultConfig.content?.story?.title || "Our Love Story"} />
                    <div className="space-y-3 mt-2">
                      {(contentOverrides.story?.items || []).map((item, i) => (
                        <div key={i} className="relative rounded-xl border border-gray-100 bg-gray-50/80 p-3 space-y-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Story {i + 1}</span>
                            <button type="button" onClick={() => { const items = [...(contentOverrides.story?.items || [])]; items.splice(i, 1); setContentOverrides(p => ({ ...p, story: { ...p.story, items } })); }} className="p-1 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors"><X className="w-3 h-3" /></button>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <FormInput label="Year" value={item.year} onChange={(v) => { const items = [...(contentOverrides.story?.items || [])]; items[i] = { ...items[i], year: v }; setContentOverrides(p => ({ ...p, story: { ...p.story, items } })); }} placeholder="2020" />
                            <div className="col-span-2"><FormInput label="Title" value={item.title} onChange={(v) => { const items = [...(contentOverrides.story?.items || [])]; items[i] = { ...items[i], title: v }; setContentOverrides(p => ({ ...p, story: { ...p.story, items } })); }} placeholder="First Meeting" /></div>
                          </div>
                          <FormTextarea label="Description" value={item.description} onChange={(v) => { const items = [...(contentOverrides.story?.items || [])]; items[i] = { ...items[i], description: v }; setContentOverrides(p => ({ ...p, story: { ...p.story, items } })); }} placeholder="Tell your story..." />
                        </div>
                      ))}
                    </div>
                    <button type="button" onClick={() => { const items = [...(contentOverrides.story?.items || [])]; items.push({ year: "", title: "", description: "" }); setContentOverrides(p => ({ ...p, story: { ...p.story, items } })); }} className="flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 font-semibold mt-2 py-1"><Plus className="w-3.5 h-3.5" /> Add Story Item</button>
                  </Section>
                );
                case "events": return (
                  <Section key="events" id="events" title="Wedding Events" icon={<Clock className="w-4 h-4 text-rose-500" />} activeSection={activeSection} setActiveSection={setActiveSection} {...dProps}>
                    <div className="space-y-3">
                      {events.map((ev, i) => (
                        <div key={i} className="relative rounded-xl border border-gray-100 bg-gray-50/80 p-3.5 space-y-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Event {i + 1}</span>
                            {events.length > 1 && (<button type="button" onClick={() => setEvents(p => p.filter((_, idx) => idx !== i))} className="p-1 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors"><X className="w-3 h-3" /></button>)}
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <FormInput label="Title" value={ev.title} onChange={(v) => updateEvent(i, "title", v)} placeholder="Ceremony" />
                            <FormInput label="Time" value={ev.time} onChange={(v) => updateEvent(i, "time", v)} placeholder="4:00 PM" />
                          </div>
                          <FormInput label="Venue" value={ev.venue || ""} onChange={(v) => updateEvent(i, "venue", v)} placeholder="Event venue" />
                          <FormTextarea label="Description" value={ev.description || ""} onChange={(v) => updateEvent(i, "description", v)} placeholder="Brief description" />
                        </div>
                      ))}
                    </div>
                    <button type="button" onClick={() => setEvents(p => [...p, { title: "", time: "", venue: "" }])} className="flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 font-semibold mt-2 py-1"><Plus className="w-3.5 h-3.5" /> Add Event</button>
                  </Section>
                );
                case "gallery": return (
                  <Section key="gallery" id="gallery" title="Photo Gallery" icon={<ImagePlus className="w-4 h-4 text-rose-500" />} activeSection={activeSection} setActiveSection={setActiveSection} {...dProps}>
                    <p className="text-[10px] text-gray-400 mb-3">Upload up to 3 photos (JPEG/PNG, max 2MB each)</p>
                    <div className="grid grid-cols-3 gap-2">
                      {(contentOverrides.gallery?.images || []).map((img, i) => (
                        <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 group">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={img} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover" />
                          <button type="button" onClick={() => { const images = [...(contentOverrides.gallery?.images || [])]; images.splice(i, 1); setContentOverrides(p => ({ ...p, gallery: { ...p.gallery, images } })); }} className="absolute top-1 right-1 p-1 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-3 h-3" /></button>
                        </div>
                      ))}
                      {(contentOverrides.gallery?.images || []).length < 3 && (
                        <label className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-rose-300 hover:bg-rose-50/50 transition-colors">
                          <ImagePlus className="w-5 h-5 text-gray-300 mb-1" /><span className="text-[9px] text-gray-400">Add</span>
                          <input type="file" accept="image/jpeg,image/png" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (!file) return; if (file.size > 2 * 1024 * 1024) { alert("Max 2MB"); return; } const reader = new FileReader(); reader.onload = () => { const b = reader.result as string; if (!b.startsWith("data:image/")) return; setContentOverrides(p => ({ ...p, gallery: { ...p.gallery, images: [...(p.gallery?.images || []), b] } })); }; reader.readAsDataURL(file); e.target.value = ""; }} />
                        </label>
                      )}
                    </div>
                  </Section>
                );
                case "venue": return (
                  <Section key="venue" id="venue" title="Venue & Map" icon={<MapPin className="w-4 h-4 text-rose-500" />} activeSection={activeSection} setActiveSection={setActiveSection} {...dProps}>
                    <FormInput label="Venue Name" value={venue} onChange={setVenue} placeholder="e.g. Cinnamon Grand, Colombo" />
                    <FormTextarea label="Address" value={venueAddress} onChange={setVenueAddress} placeholder="Full venue address" />
                    <FormInput label="Google Maps Link" value={contentOverrides.venue?.mapUrl || ""} onChange={(v) => setContentOverrides(p => ({ ...p, venue: { ...p.venue, mapUrl: v } }))} placeholder="Paste share link for directions button" />
                    {(contentOverrides.venue?.mapUrl || venue || venueAddress) && (
                      <div className="rounded-xl overflow-hidden border border-gray-200 mt-1">
                        <iframe src={`https://maps.google.com/maps?q=${encodeURIComponent(contentOverrides.venue?.mapUrl && contentOverrides.venue.mapUrl.includes("google") ? contentOverrides.venue.mapUrl : [venue, venueAddress].filter(Boolean).join(", "))}&output=embed`} className="w-full h-36 border-0" loading="lazy" title="Map" />
                      </div>
                    )}
                  </Section>
                );
                case "rsvp": return (
                  <Section key="rsvp" id="rsvp" title="RSVP" icon={<Type className="w-4 h-4 text-rose-500" />} activeSection={activeSection} setActiveSection={setActiveSection} {...dProps}>
                    <FormInput label="Title" value={contentOverrides.rsvp?.title || ""} onChange={(v) => setContentOverrides(p => ({ ...p, rsvp: { ...p.rsvp, title: v } }))} placeholder={defaultConfig.content?.rsvp?.title || "Will You Join Us?"} />
                    <FormInput label="Deadline" value={contentOverrides.rsvp?.deadline || ""} onChange={(v) => setContentOverrides(p => ({ ...p, rsvp: { ...p.rsvp, deadline: v } }))} placeholder="Kindly respond by..." />
                  </Section>
                );
                case "footer": return (
                  <Section key="footer" id="footer-edit" title="Footer" icon={<Type className="w-4 h-4 text-rose-500" />} activeSection={activeSection} setActiveSection={setActiveSection} {...dProps}>
                    <FormInput label="Custom Message" value={contentOverrides.footer?.message || ""} onChange={(v) => setContentOverrides(p => ({ ...p, footer: { ...p.footer, message: v } }))} placeholder="Custom footer message (optional)" />
                  </Section>
                );
                default: return null;
              }
            })}

            {/* ═══ GLOBAL SETTINGS (not draggable) ═══ */}

            <Section id="style" title="Style & Colors" icon={<Palette className="w-4 h-4 text-rose-500" />} activeSection={activeSection} setActiveSection={setActiveSection}>
              <div className="space-y-4">
                {[{ key: "primaryColor", label: "Primary" }, { key: "secondaryColor", label: "Secondary" }, { key: "backgroundColor", label: "Background" }, { key: "textColor", label: "Text" }, { key: "accentColor", label: "Accent" }].map(({ key, label }) => (
                  <div key={key} className="flex items-center justify-between">
                    <label className="text-xs text-gray-500">{label}</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={(themeOverrides as Record<string, string>)[key] || effectiveTheme[key as keyof ThemeConfig] as string} onChange={(e) => setThemeOverrides(prev => ({ ...prev, [key]: e.target.value }))} className="w-8 h-8 rounded-full border border-gray-200 cursor-pointer" />
                      {(themeOverrides as Record<string, string>)[key] && (<button onClick={() => setThemeOverrides(prev => { const n = { ...prev }; delete (n as Record<string, unknown>)[key]; return n; })} className="text-[10px] text-gray-400 hover:text-rose-500">Reset</button>)}
                    </div>
                  </div>
                ))}
                <div>
                  <label className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-1.5 block">Font</label>
                  <select value={themeOverrides.fontFamily || effectiveTheme.fontFamily} onChange={(e) => setThemeOverrides(prev => ({ ...prev, fontFamily: e.target.value as ThemeConfig["fontFamily"] }))} className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-full bg-gray-50/50">
                    {FONT_OPTIONS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                  </select>
                </div>
              </div>
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
