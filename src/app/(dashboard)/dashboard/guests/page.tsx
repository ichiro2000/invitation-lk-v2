"use client";

import { useState } from "react";
import { UserPlus, Plus, Loader2, Check } from "lucide-react";

export default function AddGuestsPage() {
  const [guests, setGuests] = useState([{ name: "", whatsapp: "", inviteType: "TO_YOU", headCount: "1" }]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const addRow = () => setGuests([...guests, { name: "", whatsapp: "", inviteType: "TO_YOU", headCount: "1" }]);
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
    setGuests([{ name: "", whatsapp: "", inviteType: "TO_YOU", headCount: "1" }]);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add Guests</h1>
          <p className="text-gray-400 mt-1">Add guests to your invitation list</p>
        </div>
        <button onClick={addRow} className="inline-flex items-center gap-2 border border-gray-200 text-gray-600 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50">
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
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3 w-8">#</th>
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3">Guest Name *</th>
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3">WhatsApp</th>
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3">Invite Type</th>
                <th className="text-center text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3">Head Count</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody>
              {guests.map((guest, i) => (
                <tr key={i} className="border-b border-gray-50">
                  <td className="px-4 py-2 text-sm text-gray-300">{i + 1}</td>
                  <td className="px-4 py-2">
                    <input type="text" value={guest.name} onChange={(e) => updateRow(i, "name", e.target.value)} placeholder="Full name" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-rose-500 bg-gray-50/50" />
                  </td>
                  <td className="px-4 py-2">
                    <input type="tel" value={guest.whatsapp} onChange={(e) => updateRow(i, "whatsapp", e.target.value)} placeholder="+94 77 XXX XXXX" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-rose-500 bg-gray-50/50" />
                  </td>
                  <td className="px-4 py-2">
                    <select value={guest.inviteType} onChange={(e) => updateRow(i, "inviteType", e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-rose-500 bg-gray-50/50">
                      <option value="TO_YOU">To You</option>
                      <option value="TO_YOU_BOTH">To You Both</option>
                      <option value="TO_YOUR_FAMILY">To Your Family</option>
                    </select>
                  </td>
                  <td className="px-4 py-2">
                    <input type="number" min="1" max="20" value={guest.headCount} onChange={(e) => updateRow(i, "headCount", e.target.value)} className="w-20 mx-auto px-3 py-2 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:border-rose-500 bg-gray-50/50" />
                  </td>
                  <td className="px-4 py-2">
                    {guests.length > 1 && (
                      <button onClick={() => removeRow(i)} className="text-gray-300 hover:text-red-500 text-sm">✕</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-gray-100 flex items-center justify-between">
          <button onClick={addRow} className="text-sm text-rose-600 hover:underline flex items-center gap-1">
            <Plus className="w-3 h-3" /> Add another guest
          </button>
          <button onClick={handleSave} disabled={saving || !guests.some(g => g.name.trim())} className="bg-rose-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-rose-700 disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-rose-600/20">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><UserPlus className="w-4 h-4" /> Save Guests</>}
          </button>
        </div>
      </div>
    </div>
  );
}
