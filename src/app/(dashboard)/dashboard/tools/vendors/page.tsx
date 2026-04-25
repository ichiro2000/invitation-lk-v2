"use client";

import { useState, useEffect } from "react";
import {
  Store, Plus, Trash2, Phone, Download, X,
  MapPin, Camera, Video, Music2, Cake, Car, Shirt, Palette,
  Flower2, UtensilsCrossed, Gift,
} from "lucide-react";

type Status = "Contacted" | "Quote" | "Booked";

type Vendor = {
  id: string;
  name: string;
  category: string;
  contactPerson: string;
  phone: string;
  email: string;
  cost: number;
  paidAmount: number;
  status: Status;
  notes: string;
};

const categories = ["Venue", "Catering", "Photography", "Videography", "Decoration", "Florist", "Music & DJ", "Cake", "Transport", "Makeup", "Attire", "Other"];

const categoryIcons: Record<string, typeof Store> = {
  Venue: MapPin,
  Catering: UtensilsCrossed,
  Photography: Camera,
  Videography: Video,
  Decoration: Gift,
  Florist: Flower2,
  "Music & DJ": Music2,
  Cake: Cake,
  Transport: Car,
  Makeup: Palette,
  Attire: Shirt,
  Other: Store,
};

const statusStyles: Record<Status, string> = {
  Contacted: "bg-gray-100 text-gray-600",
  Quote: "bg-amber-100 text-amber-700",
  Booked: "bg-emerald-100 text-emerald-700",
};

const STORAGE_KEY = "invlk_vendors_v1";

const emptyForm = {
  name: "",
  category: "Venue",
  contactPerson: "",
  phone: "",
  email: "",
  cost: "",
  paidAmount: "",
  status: "Contacted" as Status,
  notes: "",
};

const fmt = (n: number) => `Rs. ${Math.round(n).toLocaleString()}`;

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (Array.isArray(parsed)) setVendors(parsed);
      }
    } catch {
      // ignore corrupt storage
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(vendors));
  }, [vendors, loaded]);

  const openAdd = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (v: Vendor) => {
    setForm({
      name: v.name,
      category: v.category,
      contactPerson: v.contactPerson,
      phone: v.phone,
      email: v.email,
      cost: v.cost ? String(v.cost) : "",
      paidAmount: v.paidAmount ? String(v.paidAmount) : "",
      status: v.status,
      notes: v.notes,
    });
    setEditingId(v.id);
    setShowForm(true);
  };

  const saveVendor = () => {
    if (!form.name.trim()) return;
    const cost = Number(form.cost) || 0;
    const paidAmount = Math.min(Number(form.paidAmount) || 0, cost || Number(form.paidAmount) || 0);
    const payload: Omit<Vendor, "id"> = {
      name: form.name.trim(),
      category: form.category,
      contactPerson: form.contactPerson.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      cost,
      paidAmount,
      status: form.status,
      notes: form.notes.trim(),
    };
    if (editingId) {
      setVendors(vendors.map(v => v.id === editingId ? { ...payload, id: editingId } : v));
    } else {
      setVendors([...vendors, { ...payload, id: Date.now().toString() }]);
    }
    setShowForm(false);
  };

  const deleteVendor = (id: string) => setVendors(vendors.filter(v => v.id !== id));

  const totalCost = vendors.reduce((s, v) => s + v.cost, 0);
  const totalPaid = vendors.reduce((s, v) => s + v.paidAmount, 0);
  const stillOwing = Math.max(totalCost - totalPaid, 0);
  const bookedCount = vendors.filter(v => v.status === "Booked").length;

  const exportCsv = () => {
    const rows = [
      ["Name", "Category", "Contact", "Phone", "Email", "Status", "Cost", "Paid", "Owing", "Notes"],
      ...vendors.map(v => [
        v.name, v.category, v.contactPerson, v.phone, v.email, v.status,
        String(v.cost), String(v.paidAmount), String(Math.max(v.cost - v.paidAmount, 0)),
        v.notes.replace(/\n/g, " "),
      ]),
    ];
    const csv = rows.map(r => r.map(c => `"${(c ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "vendors.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vendor List</h1>
          <p className="text-sm text-gray-500 mt-1">
            {vendors.length} {vendors.length === 1 ? "vendor" : "vendors"}
            {bookedCount > 0 && <> · {bookedCount} booked</>}
            {totalCost > 0 && <> · {fmt(totalCost)} total · {fmt(totalPaid)} paid</>}
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          {vendors.length > 0 && (
            <button onClick={exportCsv} className="bg-white border border-gray-200 text-gray-700 px-3 sm:px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 flex items-center gap-1.5">
              <Download className="w-4 h-4" /> <span className="hidden sm:inline">Export</span>
            </button>
          )}
          <button onClick={openAdd} className="bg-rose-600 text-white px-3 sm:px-4 py-2 rounded-xl text-sm font-medium hover:bg-rose-700 flex items-center gap-1.5">
            <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Add vendor</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <p className="text-xs uppercase tracking-wider text-gray-400">Total cost</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{fmt(totalCost)}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <p className="text-xs uppercase tracking-wider text-gray-400">Paid</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{fmt(totalPaid)}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <p className="text-xs uppercase tracking-wider text-gray-400">Still owing</p>
          <p className="text-2xl font-bold text-rose-700 mt-1">{fmt(stillOwing)}</p>
        </div>
      </div>

      {vendors.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <Store className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400">No vendors added yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vendors.map((v) => {
            const Icon = categoryIcons[v.category] ?? Store;
            const pct = v.cost > 0 ? Math.min(100, Math.round((v.paidAmount / v.cost) * 100)) : 0;
            return (
              <div key={v.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm group">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 shrink-0 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
                    <Icon className="w-5 h-5" />
                  </div>
                  <button onClick={() => openEdit(v)} className="flex-1 text-left min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="font-semibold text-gray-900 truncate">{v.name}</p>
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${statusStyles[v.status]}`}>{v.status}</span>
                    </div>
                    <p className="text-sm text-gray-500 truncate">
                      {v.category}{v.contactPerson && <> · {v.contactPerson}</>}
                    </p>
                    {v.phone && (
                      <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                        <Phone className="w-3 h-3" />{v.phone}
                      </p>
                    )}
                  </button>
                  <button
                    onClick={() => deleteVendor(v.id)}
                    className="text-gray-300 hover:text-rose-600 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                    aria-label={`Delete ${v.name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {v.cost > 0 && (
                  <div className="mt-4">
                    <div className="flex items-baseline justify-between text-xs mb-1.5">
                      <span className="text-gray-500">{fmt(v.paidAmount)} paid of {fmt(v.cost)}</span>
                      <span className="font-semibold text-rose-700">{pct}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-rose-600 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">{editingId ? "Edit vendor" : "Add vendor"}</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Vendor name" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm mb-3 focus:outline-none focus:border-rose-500" />
            <div className="grid grid-cols-2 gap-3 mb-3">
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="px-3 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-rose-500">
                {categories.map(c => <option key={c}>{c}</option>)}
              </select>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as Status })} className="px-3 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-rose-500">
                <option value="Contacted">Contacted</option>
                <option value="Quote">Quote</option>
                <option value="Booked">Booked</option>
              </select>
            </div>
            <input type="text" value={form.contactPerson} onChange={e => setForm({ ...form, contactPerson: e.target.value })} placeholder="Contact person" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm mb-3 focus:outline-none focus:border-rose-500" />
            <div className="grid grid-cols-2 gap-3 mb-3">
              <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="Phone" className="px-3 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-rose-500" />
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Email" className="px-3 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-rose-500" />
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <input type="number" inputMode="numeric" value={form.cost} onChange={e => setForm({ ...form, cost: e.target.value })} placeholder="Total cost (Rs.)" className="px-3 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-rose-500" />
              <input type="number" inputMode="numeric" value={form.paidAmount} onChange={e => setForm({ ...form, paidAmount: e.target.value })} placeholder="Paid (Rs.)" className="px-3 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-rose-500" />
            </div>
            <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Notes" rows={2} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm mb-4 focus:outline-none focus:border-rose-500 resize-none" />
            <div className="flex gap-3">
              <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={saveVendor} className="flex-1 bg-rose-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-rose-700">{editingId ? "Save" : "Add vendor"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
