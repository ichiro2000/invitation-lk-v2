"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Store, Plus, Trash2, Edit3, X, Phone, Mail, Lock } from "lucide-react";
import Link from "next/link";

type Vendor = { id: string; name: string; category: string; phone: string; email: string; cost: string; isPaid: boolean; notes: string };

const categories = ["Photographer", "Videographer", "Decorator", "Catering", "Florist", "DJ/Music", "Cake", "Transport", "Venue", "Makeup", "Attire", "Other"];

export default function VendorsPage() {
  const { data: session } = useSession();
  const plan = session?.user?.plan || "FREE";
  const hasAccess = plan === "STANDARD" || plan === "PREMIUM";

  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", category: "Photographer", phone: "", email: "", cost: "", notes: "" });

  if (!hasAccess) {
    return (
      <div className="text-center py-20">
        <Lock className="w-12 h-12 text-gray-200 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Standard Plan Required</h2>
        <p className="text-gray-400 mb-6">Vendor list is available on Standard and Premium plans.</p>
        <Link href="/pricing" className="bg-rose-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-rose-700">Upgrade Now</Link>
      </div>
    );
  }

  const addVendor = () => {
    if (!form.name) return;
    setVendors([...vendors, { id: Date.now().toString(), ...form, isPaid: false }]);
    setForm({ name: "", category: "Photographer", phone: "", email: "", cost: "", notes: "" });
    setShowAdd(false);
  };

  const togglePaid = (id: string) => setVendors(vendors.map(v => v.id === id ? { ...v, isPaid: !v.isPaid } : v));
  const deleteVendor = (id: string) => setVendors(vendors.filter(v => v.id !== id));

  const totalCost = vendors.reduce((s, v) => s + Number(v.cost || 0), 0);
  const totalPaid = vendors.filter(v => v.isPaid).reduce((s, v) => s + Number(v.cost || 0), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-2xl font-bold text-gray-900">Vendor List</h1><p className="text-gray-400 mt-1">Manage your wedding vendors</p></div>
        <button onClick={() => setShowAdd(true)} className="bg-rose-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-rose-700 flex items-center gap-1"><Plus className="w-4 h-4" /> Add Vendor</button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm"><p className="text-sm text-gray-400">Total Cost</p><p className="text-2xl font-bold">Rs. {totalCost.toLocaleString()}</p></div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm"><p className="text-sm text-gray-400">Paid</p><p className="text-2xl font-bold text-green-600">Rs. {totalPaid.toLocaleString()}</p></div>
      </div>

      {vendors.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100"><Store className="w-10 h-10 text-gray-200 mx-auto mb-3" /><p className="text-gray-400">No vendors added yet</p></div>
      ) : (
        <div className="space-y-3">
          {vendors.map((v) => (
            <div key={v.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1"><p className="font-semibold text-gray-900">{v.name}</p><span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{v.category}</span></div>
                <div className="flex gap-4 text-xs text-gray-400">
                  {v.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{v.phone}</span>}
                  {v.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{v.email}</span>}
                </div>
              </div>
              <div className="text-right">
                {v.cost && <p className="font-bold text-gray-900">Rs. {Number(v.cost).toLocaleString()}</p>}
                <button onClick={() => togglePaid(v.id)} className={`text-xs px-2 py-0.5 rounded-full mt-1 ${v.isPaid ? "bg-green-100 text-green-600" : "bg-amber-100 text-amber-600"}`}>{v.isPaid ? "Paid ✓" : "Unpaid"}</button>
              </div>
              <button onClick={() => deleteVendor(v.id)} className="text-gray-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="font-semibold text-gray-900 mb-4">Add Vendor</h3>
            <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Vendor name" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm mb-3 focus:outline-none focus:border-rose-500" />
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm mb-3 focus:outline-none focus:border-rose-500">
              {categories.map(c => <option key={c}>{c}</option>)}
            </select>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="Phone" className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-rose-500" />
              <input type="number" value={form.cost} onChange={e => setForm({ ...form, cost: e.target.value })} placeholder="Cost (Rs.)" className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-rose-500" />
            </div>
            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Email" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm mb-3 focus:outline-none focus:border-rose-500" />
            <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Notes" rows={2} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm mb-4 focus:outline-none focus:border-rose-500 resize-none" />
            <div className="flex gap-3">
              <button onClick={() => setShowAdd(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600">Cancel</button>
              <button onClick={addVendor} className="flex-1 bg-rose-600 text-white py-2.5 rounded-xl text-sm font-medium">Add Vendor</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
