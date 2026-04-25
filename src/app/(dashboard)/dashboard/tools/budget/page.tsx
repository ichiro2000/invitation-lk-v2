"use client";

import { useState, useEffect } from "react";
import {
  DollarSign, Plus, Trash2, Download, Calendar, AlertCircle, Edit3, X, Sparkles,
  MapPin, UtensilsCrossed, Camera, Video, Flower2, Music2, Cake as CakeIcon, Car,
  Palette, Shirt, Mail, Plane, Gift, Tag,
} from "lucide-react";

type Status = "PENDING" | "PARTIAL" | "PAID";

type BudgetItem = {
  id: string;
  name: string;
  category: string;
  vendor: string;
  estimated: number;
  actual: number;
  deposit: number;
  dueDate: string;
  notes: string;
  status: Status;
};

const categories: { name: string; pct: number }[] = [
  { name: "Venue", pct: 25 },
  { name: "Catering", pct: 25 },
  { name: "Photography", pct: 10 },
  { name: "Videography", pct: 5 },
  { name: "Decoration", pct: 8 },
  { name: "Attire", pct: 6 },
  { name: "Music", pct: 4 },
  { name: "Cake", pct: 2 },
  { name: "Flowers", pct: 3 },
  { name: "Transport", pct: 2 },
  { name: "Makeup", pct: 2 },
  { name: "Invitations", pct: 2 },
  { name: "Honeymoon", pct: 5 },
  { name: "Rings & Gifts", pct: 1 },
  { name: "Other", pct: 0 },
];

const starterItems: Omit<BudgetItem, "id">[] = [
  { name: "Venue booking", category: "Venue", vendor: "", estimated: 500000, actual: 0, deposit: 0, dueDate: "", notes: "", status: "PENDING" },
  { name: "Catering", category: "Catering", vendor: "", estimated: 400000, actual: 0, deposit: 0, dueDate: "", notes: "", status: "PENDING" },
  { name: "Photographer", category: "Photography", vendor: "", estimated: 150000, actual: 0, deposit: 0, dueDate: "", notes: "", status: "PENDING" },
  { name: "Videographer", category: "Videography", vendor: "", estimated: 100000, actual: 0, deposit: 0, dueDate: "", notes: "", status: "PENDING" },
  { name: "Pre-shoot", category: "Photography", vendor: "", estimated: 50000, actual: 0, deposit: 0, dueDate: "", notes: "", status: "PENDING" },
  { name: "Decoration & flowers", category: "Decoration", vendor: "", estimated: 150000, actual: 0, deposit: 0, dueDate: "", notes: "", status: "PENDING" },
  { name: "Wedding cake", category: "Cake", vendor: "", estimated: 40000, actual: 0, deposit: 0, dueDate: "", notes: "", status: "PENDING" },
  { name: "Bride's outfit", category: "Attire", vendor: "", estimated: 120000, actual: 0, deposit: 0, dueDate: "", notes: "", status: "PENDING" },
  { name: "Groom's outfit", category: "Attire", vendor: "", estimated: 60000, actual: 0, deposit: 0, dueDate: "", notes: "", status: "PENDING" },
  { name: "Makeup & hair", category: "Makeup", vendor: "", estimated: 40000, actual: 0, deposit: 0, dueDate: "", notes: "", status: "PENDING" },
  { name: "DJ / music", category: "Music", vendor: "", estimated: 60000, actual: 0, deposit: 0, dueDate: "", notes: "", status: "PENDING" },
  { name: "Transport (bride + family)", category: "Transport", vendor: "", estimated: 40000, actual: 0, deposit: 0, dueDate: "", notes: "", status: "PENDING" },
  { name: "Invitation cards", category: "Invitations", vendor: "", estimated: 25000, actual: 0, deposit: 0, dueDate: "", notes: "", status: "PENDING" },
  { name: "Wedding rings", category: "Rings & Gifts", vendor: "", estimated: 200000, actual: 0, deposit: 0, dueDate: "", notes: "", status: "PENDING" },
  { name: "Honeymoon", category: "Honeymoon", vendor: "", estimated: 300000, actual: 0, deposit: 0, dueDate: "", notes: "", status: "PENDING" },
];

const STORAGE_KEY = "invlk_budget_v1";

function fmt(n: number) {
  return `Rs. ${Math.round(n).toLocaleString()}`;
}

function daysUntil(iso: string): number | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - today.getTime()) / 86400000);
}

const emptyForm = {
  name: "",
  category: "Venue",
  vendor: "",
  estimated: "",
  actual: "",
  deposit: "",
  dueDate: "",
  notes: "",
  status: "PENDING" as Status,
};

const statusColors: Record<Status, string> = {
  PENDING: "bg-gray-100 text-gray-500",
  PARTIAL: "bg-amber-100 text-amber-700",
  PAID: "bg-green-100 text-green-700",
};
const statusLabel: Record<Status, string> = { PENDING: "Pending", PARTIAL: "Partial", PAID: "Paid" };

const categoryIcons: Record<string, typeof DollarSign> = {
  Venue: MapPin,
  Catering: UtensilsCrossed,
  Photography: Camera,
  Videography: Video,
  Decoration: Sparkles,
  Attire: Shirt,
  Music: Music2,
  Cake: CakeIcon,
  Flowers: Flower2,
  Transport: Car,
  Makeup: Palette,
  Invitations: Mail,
  Honeymoon: Plane,
  "Rings & Gifts": Gift,
  Other: Tag,
};

export default function BudgetPage() {
  const [totalBudget, setTotalBudget] = useState(0);
  const [items, setItems] = useState<BudgetItem[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [loaded, setLoaded] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("All");

  useEffect(() => {
    let nextBudget = 0;
    let nextItems: BudgetItem[] = [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (typeof parsed.totalBudget === "number") nextBudget = parsed.totalBudget;
        if (Array.isArray(parsed.items)) nextItems = parsed.items;
      }
    } catch {
      // ignore corrupt storage
    }
    // Hydrating from localStorage on mount — SSR cannot access it, so setState here is intentional.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTotalBudget(nextBudget);
    setItems(nextItems);
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ totalBudget, items }));
  }, [totalBudget, items, loaded]);

  const openAdd = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowAdd(true);
  };

  const openEdit = (item: BudgetItem) => {
    setForm({
      name: item.name,
      category: item.category,
      vendor: item.vendor,
      estimated: item.estimated ? String(item.estimated) : "",
      actual: item.actual ? String(item.actual) : "",
      deposit: item.deposit ? String(item.deposit) : "",
      dueDate: item.dueDate,
      notes: item.notes,
      status: item.status,
    });
    setEditingId(item.id);
    setShowAdd(true);
  };

  const saveItem = () => {
    if (!form.name.trim() || !form.estimated) return;
    const estimated = Number(form.estimated) || 0;
    const actual = Number(form.actual) || 0;
    const deposit = Number(form.deposit) || 0;
    const spent = actual || estimated;
    let status: Status = form.status;
    if (spent > 0 && deposit >= spent) status = "PAID";
    else if (deposit > 0) status = "PARTIAL";
    else if (form.status !== "PAID") status = "PENDING";

    const payload = {
      name: form.name.trim(),
      category: form.category,
      vendor: form.vendor.trim(),
      estimated,
      actual,
      deposit,
      dueDate: form.dueDate,
      notes: form.notes.trim(),
      status,
    };

    if (editingId) {
      setItems(items.map(i => i.id === editingId ? { ...i, ...payload } : i));
    } else {
      setItems([...items, { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, ...payload }]);
    }
    setShowAdd(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const deleteItem = (id: string) => {
    if (!confirm("Remove this budget item?")) return;
    setItems(items.filter(i => i.id !== id));
  };

  const togglePaid = (id: string) => {
    setItems(items.map(i => {
      if (i.id !== id) return i;
      if (i.status === "PAID") return { ...i, status: (i.deposit > 0 ? "PARTIAL" : "PENDING") as Status };
      const spent = i.actual || i.estimated;
      return { ...i, status: "PAID" as Status, deposit: spent };
    }));
  };

  const addStarter = () => {
    const newOnes: BudgetItem[] = starterItems.map((si, idx) => ({
      ...si,
      id: `${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 5)}`,
    }));
    setItems([...items, ...newOnes]);
  };

  const exportCSV = () => {
    const rows = [
      ["Item", "Category", "Vendor", "Estimated (Rs.)", "Actual (Rs.)", "Deposit (Rs.)", "Due Date", "Status", "Notes"],
      ...items.map(i => [i.name, i.category, i.vendor, i.estimated, i.actual, i.deposit, i.dueDate, statusLabel[i.status], i.notes]),
    ];
    const csv = rows.map(r => r.map(f => `"${String(f ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `wedding-budget-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const totalEstimated = items.reduce((s, i) => s + i.estimated, 0);
  const totalActual = items.reduce((s, i) => s + (i.actual || 0), 0);
  const totalDeposit = items.reduce((s, i) => s + (i.deposit || 0), 0);
  const totalCommitted = items.reduce((s, i) => s + (i.actual || i.estimated), 0);
  const remainingBudget = totalBudget - totalCommitted;
  const owed = Math.max(0, totalCommitted - totalDeposit);
  const overBudget = totalBudget > 0 && remainingBudget < 0;
  const visibleItems = filterCategory === "All" ? items : items.filter(i => i.category === filterCategory);

  const byCategory = categories
    .map(cat => {
      const catItems = items.filter(i => i.category === cat.name);
      const est = catItems.reduce((s, i) => s + i.estimated, 0);
      const act = catItems.reduce((s, i) => s + (i.actual || 0), 0);
      const dep = catItems.reduce((s, i) => s + (i.deposit || 0), 0);
      const suggested = totalBudget * (cat.pct / 100);
      return { ...cat, estimated: est, actual: act, deposit: dep, suggested, count: catItems.length };
    })
    .filter(c => c.count > 0 || (totalBudget > 0 && c.pct > 0));

  const jumpToCategory = (name: string) => {
    setFilterCategory(name);
    if (typeof document !== "undefined") {
      document.getElementById("budget-items")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const upcoming = items
    .filter(i => i.status !== "PAID" && i.dueDate)
    .map(i => ({ item: i, days: daysUntil(i.dueDate) }))
    .filter((u): u is { item: BudgetItem; days: number } => u.days !== null && u.days >= 0 && u.days <= 60)
    .sort((a, b) => a.days - b.days)
    .slice(0, 5);

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Budget Management</h1>
          <p className="text-gray-400 mt-1 text-sm">Plan, track, and stay on top of every rupee.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {items.length === 0 && (
            <button onClick={addStarter} className="border border-gray-200 text-gray-600 px-4 py-2 rounded-xl text-sm hover:bg-gray-50 flex items-center gap-1">
              <Sparkles className="w-4 h-4" /> Add essentials
            </button>
          )}
          {items.length > 0 && (
            <button onClick={exportCSV} className="border border-gray-200 text-gray-600 px-4 py-2 rounded-xl text-sm hover:bg-gray-50 flex items-center gap-1">
              <Download className="w-4 h-4" /> Export CSV
            </button>
          )}
          <button onClick={openAdd} className="bg-rose-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-rose-700 flex items-center gap-1">
            <Plus className="w-4 h-4" /> Add Item
          </button>
        </div>
      </div>

      {/* Total budget header */}
      <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-2xl p-5 border border-rose-100 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center flex-shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 mb-1">Total wedding budget</p>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-semibold text-gray-700">Rs.</span>
              <input
                type="number"
                min="0"
                value={totalBudget || ""}
                onChange={e => setTotalBudget(Math.max(0, Number(e.target.value) || 0))}
                placeholder="Set your budget"
                className="text-2xl font-bold text-gray-900 bg-transparent focus:outline-none w-full placeholder:text-gray-300 placeholder:text-base placeholder:font-normal"
              />
            </div>
          </div>
          {totalBudget > 0 && (
            <div className="text-right">
              <p className="text-xs text-gray-500">Remaining</p>
              <p className={`text-xl font-bold ${overBudget ? "text-red-600" : "text-green-600"}`}>{fmt(remainingBudget)}</p>
            </div>
          )}
        </div>
        {totalBudget > 0 && (() => {
          const denom = overBudget ? totalCommitted : totalBudget;
          const paidPct = denom > 0 ? (totalDeposit / denom) * 100 : 0;
          const committedUnpaidPct = denom > 0 ? (Math.max(0, totalCommitted - totalDeposit) / denom) * 100 : 0;
          const unallocatedPct = Math.max(0, 100 - paidPct - committedUnpaidPct);
          return (
            <div className="mt-4">
              <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-600 mb-2">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Paid <span className="text-gray-400">{fmt(totalDeposit)}</span></span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500" /> Committed <span className="text-gray-400">{fmt(Math.max(0, totalCommitted - totalDeposit))}</span></span>
                <span className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${overBudget ? "bg-red-300" : "bg-gray-300"}`} />
                  {overBudget ? "Over budget" : "Unallocated"}
                  <span className="text-gray-400">{fmt(overBudget ? totalCommitted - totalBudget : Math.max(0, totalBudget - totalCommitted))}</span>
                </span>
              </div>
              <div className="w-full bg-white/60 rounded-full h-2 overflow-hidden flex">
                <div className="h-full bg-emerald-500 transition-all" style={{ width: `${paidPct}%` }} />
                <div className="h-full bg-rose-500 transition-all" style={{ width: `${committedUnpaidPct}%` }} />
                <div className={`h-full transition-all ${overBudget ? "bg-red-300" : "bg-gray-200"}`} style={{ width: `${unallocatedPct}%` }} />
              </div>
            </div>
          );
        })()}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <SummaryCard label="Estimated" value={totalEstimated} tone="text-gray-900" />
        <SummaryCard label="Actual spent" value={totalActual} tone="text-amber-600" />
        <SummaryCard label="Deposits paid" value={totalDeposit} tone="text-blue-600" />
        <SummaryCard label="Still to pay" value={owed} tone="text-rose-600" />
      </div>

      {overBudget && (
        <div className="bg-red-50 border border-red-100 text-red-700 rounded-xl px-4 py-3 mb-6 flex items-center gap-2 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          You&apos;re {fmt(Math.abs(remainingBudget))} over your total budget.
        </div>
      )}

      {/* By category — richer rollup with click-to-filter */}
      {byCategory.length > 0 && (
        <div className="mb-6">
          <div className="flex items-baseline justify-between mb-3 px-1">
            <h2 className="text-sm font-semibold text-gray-900">By category</h2>
            <p className="text-[11px] text-gray-400">Tap a row to view its items</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50 overflow-hidden">
            {byCategory.map(cat => {
              const spent = cat.actual || cat.estimated;
              const cap = Math.max(cat.suggested, spent, 1);
              const overCat = cat.suggested > 0 && spent > cat.suggested;
              const paidPct = spent > 0 ? Math.min(100, Math.round((cat.deposit / spent) * 100)) : 0;
              const Icon = categoryIcons[cat.name] ?? Tag;
              const isUnpaid = cat.count > 0 && cat.deposit === 0;
              const isFullyPaid = cat.count > 0 && spent > 0 && cat.deposit >= spent;
              const badgeClass = isFullyPaid
                ? "bg-emerald-100 text-emerald-700"
                : isUnpaid
                ? "bg-gray-100 text-gray-500"
                : "bg-amber-100 text-amber-700";
              const badgeLabel = isFullyPaid ? "Paid" : isUnpaid ? "Unpaid" : `${paidPct}% paid`;
              return (
                <button
                  key={cat.name}
                  onClick={() => cat.count > 0 && jumpToCategory(cat.name)}
                  disabled={cat.count === 0}
                  className="w-full flex items-center gap-4 p-4 text-left hover:bg-gray-50 disabled:hover:bg-transparent disabled:cursor-default transition-colors"
                >
                  <div className="w-10 h-10 shrink-0 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2 mb-1">
                      <p className="font-medium text-gray-900 truncate">
                        {cat.name}
                        <span className="text-gray-400 font-normal ml-1.5 text-xs">
                          {cat.count > 0 ? `${cat.count} ${cat.count === 1 ? "item" : "items"}` : "—"}
                        </span>
                      </p>
                      <p className="text-sm text-gray-900 font-medium whitespace-nowrap">
                        {fmt(spent)}
                        {totalBudget > 0 && cat.suggested > 0 && (
                          <span className="text-gray-400 font-normal ml-1 text-xs">/ {fmt(cat.suggested)}</span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${overCat ? "bg-red-400" : "bg-rose-500"}`}
                          style={{ width: `${Math.min(100, (spent / cap) * 100)}%` }}
                        />
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap ${badgeClass}`}>{badgeLabel}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {upcoming.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-rose-500" /> Upcoming payments
          </h3>
          <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2">
            {upcoming.map(({ item, days }) => {
              const owedNow = Math.max(0, (item.actual || item.estimated) - item.deposit);
              const urgency = days <= 7 ? "bg-red-100 text-red-700" : days <= 30 ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-500";
              return (
                <div key={item.id} className="flex items-center justify-between gap-3 text-sm py-1">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900 truncate">{item.name}</p>
                    <p className="text-xs text-gray-400">{item.category}{item.vendor ? ` · ${item.vendor}` : ""}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${urgency}`}>
                      {days === 0 ? "Today" : days === 1 ? "Tomorrow" : `in ${days}d`}
                    </span>
                    <span className="text-gray-900 font-medium text-xs">{fmt(owedNow)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filter */}
      {items.length > 0 && (
        <div id="budget-items" className="flex items-center gap-2 mb-3 overflow-x-auto pb-1 scroll-mt-6">
          <button
            onClick={() => setFilterCategory("All")}
            className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap ${filterCategory === "All" ? "bg-rose-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
          >
            All ({items.length})
          </button>
          {categories.filter(c => items.some(i => i.category === c.name)).map(c => {
            const count = items.filter(i => i.category === c.name).length;
            return (
              <button
                key={c.name}
                onClick={() => setFilterCategory(c.name)}
                className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap ${filterCategory === c.name ? "bg-rose-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
              >
                {c.name} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Items */}
      {items.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <DollarSign className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 mb-1 font-medium">No budget items yet</p>
          <p className="text-gray-400 text-sm mb-4">Set a total budget above and start adding expenses.</p>
          <button onClick={addStarter} className="bg-rose-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-rose-700 inline-flex items-center gap-1">
            <Sparkles className="w-4 h-4" /> Add wedding essentials
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                <th className="text-left text-xs font-medium text-gray-400 uppercase px-4 py-3">Item</th>
                <th className="text-left text-xs font-medium text-gray-400 uppercase px-4 py-3">Category</th>
                <th className="text-right text-xs font-medium text-gray-400 uppercase px-4 py-3">Estimated</th>
                <th className="text-right text-xs font-medium text-gray-400 uppercase px-4 py-3">Actual</th>
                <th className="text-right text-xs font-medium text-gray-400 uppercase px-4 py-3">Paid</th>
                <th className="text-left text-xs font-medium text-gray-400 uppercase px-4 py-3">Due</th>
                <th className="text-center text-xs font-medium text-gray-400 uppercase px-4 py-3">Status</th>
                <th className="w-20"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {visibleItems.map(item => {
                const overItem = item.actual > 0 && item.actual > item.estimated;
                return (
                  <tr key={item.id} className="hover:bg-gray-50/40">
                    <td className="px-4 py-3 text-sm">
                      <div className="font-medium text-gray-900">{item.name}</div>
                      {item.vendor && <div className="text-xs text-gray-400">{item.vendor}</div>}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{item.category}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">{fmt(item.estimated)}</td>
                    <td className="px-4 py-3 text-sm text-right">
                      {item.actual ? <span className={overItem ? "text-red-600" : "text-gray-900"}>{fmt(item.actual)}</span> : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-600">
                      {item.deposit ? fmt(item.deposit) : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                      {item.dueDate ? new Date(item.dueDate).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => togglePaid(item.id)} className={`text-xs px-2 py-0.5 rounded-full ${statusColors[item.status]} hover:opacity-80 transition-opacity`}>
                        {statusLabel[item.status]}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button onClick={() => openEdit(item)} className="text-gray-300 hover:text-rose-500 mr-2" aria-label="Edit"><Edit3 className="w-4 h-4 inline" /></button>
                      <button onClick={() => deleteItem(item.id)} className="text-gray-300 hover:text-red-500" aria-label="Delete"><Trash2 className="w-4 h-4 inline" /></button>
                    </td>
                  </tr>
                );
              })}
              {visibleItems.length === 0 && (
                <tr><td colSpan={8} className="text-center text-gray-400 py-8 text-sm">No items in this category.</td></tr>
              )}
            </tbody>
            {filterCategory === "All" && visibleItems.length > 0 && (
              <tfoot className="bg-gray-50/60 border-t border-gray-100">
                <tr>
                  <td colSpan={2} className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Totals</td>
                  <td className="px-4 py-3 text-sm font-semibold text-right text-gray-900">{fmt(totalEstimated)}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-right text-gray-900">{fmt(totalActual)}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-right text-gray-900">{fmt(totalDeposit)}</td>
                  <td colSpan={3}></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      )}

      {/* Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => { setShowAdd(false); setEditingId(null); }}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">{editingId ? "Edit budget item" : "Add budget item"}</h3>
              <button onClick={() => { setShowAdd(false); setEditingId(null); }} className="text-gray-300 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <input
                type="text"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Item name *"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-rose-500"
                autoFocus
              />
              <div className="grid grid-cols-2 gap-3">
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-rose-500">
                  {categories.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                </select>
                <input
                  type="text"
                  value={form.vendor}
                  onChange={e => setForm({ ...form, vendor: e.target.value })}
                  placeholder="Vendor (optional)"
                  className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-rose-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="text-xs text-gray-500 block">
                  Estimated (Rs.) *
                  <input
                    type="number"
                    min="0"
                    value={form.estimated}
                    onChange={e => setForm({ ...form, estimated: e.target.value })}
                    placeholder="0"
                    className="mt-1 w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-rose-500"
                  />
                </label>
                <label className="text-xs text-gray-500 block">
                  Actual (Rs.)
                  <input
                    type="number"
                    min="0"
                    value={form.actual}
                    onChange={e => setForm({ ...form, actual: e.target.value })}
                    placeholder="0"
                    className="mt-1 w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-rose-500"
                  />
                </label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="text-xs text-gray-500 block">
                  Paid so far (Rs.)
                  <input
                    type="number"
                    min="0"
                    value={form.deposit}
                    onChange={e => setForm({ ...form, deposit: e.target.value })}
                    placeholder="0"
                    className="mt-1 w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-rose-500"
                  />
                </label>
                <label className="text-xs text-gray-500 block">
                  Due date
                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={e => setForm({ ...form, dueDate: e.target.value })}
                    className="mt-1 w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-rose-500"
                  />
                </label>
              </div>
              <textarea
                value={form.notes}
                onChange={e => setForm({ ...form, notes: e.target.value })}
                placeholder="Notes"
                rows={2}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-rose-500 resize-none"
              />
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => { setShowAdd(false); setEditingId(null); }} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={saveItem} className="flex-1 bg-rose-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-rose-700">
                {editingId ? "Save changes" : "Add item"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className={`text-xl font-bold ${tone}`}>Rs. {Math.round(value).toLocaleString()}</p>
    </div>
  );
}
