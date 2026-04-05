"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { UserPlus, Plus, Minus, Loader2, Check, ChevronDown } from "lucide-react";

const emptyGuest = { name: "", whatsapp: "", inviteType: "TO_YOU", headCount: "1", category: "FRIENDS", side: "BOTH" };

const inviteOptions = [
  { value: "TO_YOU", label: "To You" },
  { value: "TO_YOU_BOTH", label: "To You Both" },
  { value: "TO_YOUR_FAMILY", label: "To Your Family" },
];

const categoryOptions = [
  { value: "FAMILY", label: "Family" },
  { value: "FRIENDS", label: "Friends" },
  { value: "OFFICE", label: "Office" },
  { value: "VIP", label: "VIP" },
  { value: "NEIGHBORS", label: "Neighbors" },
  { value: "OTHER", label: "Other" },
];

const sideOptions = [
  { value: "BRIDE", label: "Bride Side" },
  { value: "GROOM", label: "Groom Side" },
  { value: "BOTH", label: "Both" },
];

/* ── Stepper: number | − | + ── */
function Stepper({ value, onChange, min = 1, max = 20 }: { value: number; onChange: (v: number) => void; min?: number; max?: number }) {
  return (
    <div className="inline-flex items-center border border-gray-200 rounded-full overflow-hidden bg-white">
      <span className="w-10 text-center text-sm font-semibold text-gray-900 tabular-nums py-1.5">{value}</span>
      <div className="flex border-l border-gray-200">
        <button
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:text-gray-200 transition-colors border-r border-gray-200"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:text-gray-200 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

/* ── Custom Dropdown (portaled) ── */
function CustomSelect({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const selected = options.find(o => o.value === value);

  useEffect(() => {
    if (open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 4, left: rect.left, width: Math.max(rect.width, 140) });
    }
  }, [open]);

  return (
    <div>
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-2 pl-3 pr-2 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 font-medium hover:border-gray-300 transition-colors focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-100"
      >
        <span className="truncate">{selected?.label}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-gray-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && typeof document !== "undefined" && createPortal(
        <>
          <div className="fixed inset-0 z-[9998]" onClick={() => setOpen(false)} />
          <div
            className="fixed z-[9999] bg-white border border-gray-200 rounded-xl shadow-xl py-1"
            style={{ top: pos.top, left: pos.left, width: pos.width }}
          >
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                  opt.value === value
                    ? "text-rose-600 bg-rose-50 font-medium"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </>,
        document.body
      )}
    </div>
  );
}

export default function AddGuestsPage() {
  const [guests, setGuests] = useState([{ ...emptyGuest }]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const addRow = () => setGuests([...guests, { ...emptyGuest }]);
  const removeRow = (i: number) => setGuests(guests.filter((_, idx) => idx !== i));
  const updateRow = (i: number, field: string, value: string) => {
    const updated = [...guests];
    updated[i] = { ...updated[i], [field]: value };
    setGuests(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    const validGuests = guests.filter(g => g.name.trim());
    for (const guest of validGuests) {
      await fetch("/api/guests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(guest),
      });
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    setGuests([{ ...emptyGuest }]);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add Guests</h1>
          <p className="text-gray-400 mt-1">Add guests to your invitation list</p>
        </div>
        <button onClick={addRow} className="inline-flex items-center gap-2 border border-gray-200 text-gray-600 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
          <Plus className="w-4 h-4" /> Add Row
        </button>
      </div>

      {saved && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center gap-2">
          <Check className="w-5 h-5 text-green-600" />
          <p className="text-sm text-green-700 font-medium">Guests saved successfully!</p>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left text-[11px] font-medium text-gray-400 uppercase tracking-wider px-3 py-3 w-8">#</th>
                <th className="text-left text-[11px] font-medium text-gray-400 uppercase tracking-wider px-3 py-3">Guest Name *</th>
                <th className="text-left text-[11px] font-medium text-gray-400 uppercase tracking-wider px-3 py-3 w-[130px]">WhatsApp</th>
                <th className="text-left text-[11px] font-medium text-gray-400 uppercase tracking-wider px-3 py-3">Invite Type</th>
                <th className="text-center text-[11px] font-medium text-gray-400 uppercase tracking-wider px-3 py-3">Head Count</th>
                <th className="text-left text-[11px] font-medium text-gray-400 uppercase tracking-wider px-3 py-3">Category</th>
                <th className="text-left text-[11px] font-medium text-gray-400 uppercase tracking-wider px-3 py-3">Side</th>
                <th className="w-8"></th>
              </tr>
            </thead>
            <tbody>
              {guests.map((guest, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/30 transition-colors">
                  <td className="px-3 py-3 text-sm text-gray-300 font-medium">{i + 1}</td>
                  <td className="px-3 py-3">
                    <input
                      type="text"
                      value={guest.name}
                      onChange={(e) => updateRow(i, "name", e.target.value)}
                      placeholder="Full name"
                      className="w-full px-3 py-2 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-100 bg-white placeholder:text-gray-300 transition-colors"
                    />
                  </td>
                  <td className="px-3 py-3">
                    <input
                      type="tel"
                      value={guest.whatsapp}
                      onChange={(e) => updateRow(i, "whatsapp", e.target.value)}
                      placeholder="+94 77 XXX"
                      className="w-full px-3 py-2 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-100 bg-white placeholder:text-gray-300 transition-colors"
                    />
                  </td>
                  <td className="px-3 py-3">
                    <CustomSelect
                      value={guest.inviteType}
                      onChange={(v) => updateRow(i, "inviteType", v)}
                      options={inviteOptions}
                    />
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex justify-center">
                      <Stepper
                        value={parseInt(guest.headCount) || 1}
                        onChange={(v) => updateRow(i, "headCount", String(v))}
                      />
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <CustomSelect
                      value={guest.category}
                      onChange={(v) => updateRow(i, "category", v)}
                      options={categoryOptions}
                    />
                  </td>
                  <td className="px-3 py-3">
                    <CustomSelect
                      value={guest.side}
                      onChange={(v) => updateRow(i, "side", v)}
                      options={sideOptions}
                    />
                  </td>
                  <td className="px-3 py-3">
                    {guests.length > 1 && (
                      <button onClick={() => removeRow(i)} className="w-6 h-6 flex items-center justify-center rounded-full text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors text-xs">✕</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-gray-100 flex items-center justify-between">
          <button onClick={addRow} className="text-sm text-rose-600 hover:text-rose-700 flex items-center gap-1 font-medium transition-colors">
            <Plus className="w-3.5 h-3.5" /> Add another guest
          </button>
          <button onClick={handleSave} disabled={saving || !guests.some(g => g.name.trim())} className="bg-rose-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-rose-700 disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-rose-600/20 transition-colors">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><UserPlus className="w-4 h-4" /> Save Guests</>}
          </button>
        </div>
      </div>
    </div>
  );
}
