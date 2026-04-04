"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { DollarSign, Plus, Trash2, Lock } from "lucide-react";
import Link from "next/link";

type BudgetItem = { id: string; name: string; category: string; estimated: string; actual: string; isPaid: boolean };

const categories = ["Venue", "Catering", "Photography", "Decoration", "Attire", "Music", "Transport", "Cake", "Flowers", "Other"];

export default function BudgetPage() {
  const { data: session } = useSession();
  const plan = session?.user?.plan || "FREE";
  const hasAccess = plan === "STANDARD" || plan === "PREMIUM";

  const [items, setItems] = useState<BudgetItem[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", category: "Venue", estimated: "", actual: "" });

  if (!hasAccess) {
    return (
      <div className="text-center py-20">
        <Lock className="w-12 h-12 text-gray-200 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Standard Plan Required</h2>
        <p className="text-gray-400 mb-6">Budget management is available on Standard and Premium plans.</p>
        <Link href="/pricing" className="bg-rose-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-rose-700">Upgrade Now</Link>
      </div>
    );
  }

  const addItem = () => {
    if (!form.name || !form.estimated) return;
    setItems([...items, { id: Date.now().toString(), ...form, isPaid: false }]);
    setForm({ name: "", category: "Venue", estimated: "", actual: "" });
    setShowAdd(false);
  };

  const togglePaid = (id: string) => setItems(items.map(i => i.id === id ? { ...i, isPaid: !i.isPaid } : i));
  const deleteItem = (id: string) => setItems(items.filter(i => i.id !== id));

  const totalEstimated = items.reduce((s, i) => s + Number(i.estimated || 0), 0);
  const totalActual = items.reduce((s, i) => s + Number(i.actual || 0), 0);
  const totalPaid = items.filter(i => i.isPaid).reduce((s, i) => s + Number(i.actual || i.estimated || 0), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-2xl font-bold text-gray-900">Budget Management</h1><p className="text-gray-400 mt-1">Track your wedding expenses</p></div>
        <button onClick={() => setShowAdd(true)} className="bg-rose-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-rose-700 flex items-center gap-1"><Plus className="w-4 h-4" /> Add Item</button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-400">Estimated Total</p><p className="text-2xl font-bold text-gray-900">Rs. {totalEstimated.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-400">Actual Spent</p><p className="text-2xl font-bold text-amber-600">Rs. {totalActual.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-400">Paid</p><p className="text-2xl font-bold text-green-600">Rs. {totalPaid.toLocaleString()}</p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100"><DollarSign className="w-10 h-10 text-gray-200 mx-auto mb-3" /><p className="text-gray-400">No budget items yet</p></div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-gray-100">
              <th className="text-left text-xs font-medium text-gray-400 uppercase px-4 py-3">Item</th>
              <th className="text-left text-xs font-medium text-gray-400 uppercase px-4 py-3">Category</th>
              <th className="text-right text-xs font-medium text-gray-400 uppercase px-4 py-3">Estimated</th>
              <th className="text-right text-xs font-medium text-gray-400 uppercase px-4 py-3">Actual</th>
              <th className="text-center text-xs font-medium text-gray-400 uppercase px-4 py-3">Paid</th>
              <th className="w-10"></th>
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{item.category}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right">Rs. {Number(item.estimated).toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right">{item.actual ? `Rs. ${Number(item.actual).toLocaleString()}` : "—"}</td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => togglePaid(item.id)} className={`text-xs px-2 py-0.5 rounded-full ${item.isPaid ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"}`}>{item.isPaid ? "Paid ✓" : "Unpaid"}</button>
                  </td>
                  <td className="px-4 py-3"><button onClick={() => deleteItem(item.id)} className="text-gray-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="font-semibold text-gray-900 mb-4">Add Budget Item</h3>
            <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Item name" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm mb-3 focus:outline-none focus:border-rose-500" />
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm mb-3 focus:outline-none focus:border-rose-500">
              {categories.map(c => <option key={c}>{c}</option>)}
            </select>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <input type="number" value={form.estimated} onChange={e => setForm({ ...form, estimated: e.target.value })} placeholder="Estimated (Rs.)" className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-rose-500" />
              <input type="number" value={form.actual} onChange={e => setForm({ ...form, actual: e.target.value })} placeholder="Actual (Rs.)" className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-rose-500" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowAdd(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600">Cancel</button>
              <button onClick={addItem} className="flex-1 bg-rose-600 text-white py-2.5 rounded-xl text-sm font-medium">Add Item</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
