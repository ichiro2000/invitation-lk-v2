"use client";

import { useState, useEffect, useMemo } from "react";
import { LayoutGrid, Plus, Loader2, Users, Search, Trash2, Pencil, Check, X, Armchair } from "lucide-react";

type Guest = { id: string; name: string; headCount: number; category: string | null; side: string | null };
type Table = { id: string; name: string; capacity: number; guestIds: string[] };

const STORAGE_KEY = "invitation.lk:table-arrangement";

const categoryColors: Record<string, string> = {
  FAMILY: "bg-violet-50 text-violet-600",
  FRIENDS: "bg-blue-50 text-blue-600",
  OFFICE: "bg-teal-50 text-teal-600",
  VIP: "bg-amber-50 text-amber-600",
  NEIGHBORS: "bg-green-50 text-green-600",
  OTHER: "bg-gray-50 text-gray-500",
};

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export default function TableArrangementPage() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTableId, setActiveTableId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editCapacity, setEditCapacity] = useState(10);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    fetch("/api/guests")
      .then((r) => r.json())
      .then((d) => setGuests(d.guests || []))
      .finally(() => setLoading(false));

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      // Hydrating from localStorage on mount — SSR cannot access it, so setState here is intentional.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setTables(JSON.parse(raw));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tables));
  }, [tables, hydrated]);

  const guestMap = useMemo(() => {
    const m = new Map<string, Guest>();
    guests.forEach((g) => m.set(g.id, g));
    return m;
  }, [guests]);

  const assignedIds = useMemo(() => {
    const s = new Set<string>();
    tables.forEach((t) => t.guestIds.forEach((id) => s.add(id)));
    return s;
  }, [tables]);

  const unassigned = useMemo(
    () =>
      guests.filter(
        (g) =>
          !assignedIds.has(g.id) &&
          (!search || g.name.toLowerCase().includes(search.toLowerCase())),
      ),
    [guests, assignedIds, search],
  );

  const totalGuests = guests.length;
  const totalSeated = assignedIds.size;
  const totalCapacity = tables.reduce((s, t) => s + t.capacity, 0);

  const addTable = () => {
    const t: Table = { id: uid(), name: `Table ${tables.length + 1}`, capacity: 10, guestIds: [] };
    setTables([...tables, t]);
    setActiveTableId(t.id);
  };

  const deleteTable = (id: string) => {
    if (!confirm("Delete this table? Guests will return to the unassigned list.")) return;
    setTables(tables.filter((t) => t.id !== id));
    if (activeTableId === id) setActiveTableId(null);
  };

  const startEdit = (t: Table) => {
    setEditingId(t.id);
    setEditName(t.name);
    setEditCapacity(t.capacity);
  };

  const saveEdit = () => {
    if (!editingId) return;
    setTables(
      tables.map((t) =>
        t.id === editingId
          ? { ...t, name: editName.trim() || t.name, capacity: Math.max(1, Math.min(50, editCapacity)) }
          : t,
      ),
    );
    setEditingId(null);
  };

  const assignGuest = (guestId: string) => {
    if (!activeTableId) {
      alert("Select a table first (click it to highlight).");
      return;
    }
    setTables(
      tables.map((t) =>
        t.id === activeTableId ? { ...t, guestIds: [...t.guestIds, guestId] } : t,
      ),
    );
  };

  const unassignGuest = (tableId: string, guestId: string) => {
    setTables(
      tables.map((t) =>
        t.id === tableId ? { ...t, guestIds: t.guestIds.filter((id) => id !== guestId) } : t,
      ),
    );
  };

  const tableSeated = (t: Table) =>
    t.guestIds.reduce((s, id) => s + (guestMap.get(id)?.headCount ?? 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-rose-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-gray-900">Table Arrangement</h1>
          <p className="text-gray-400 mt-1">
            {tables.length} tables &middot; {totalSeated}/{totalGuests} guests seated &middot; {totalCapacity} seats total
          </p>
        </div>
        <button
          onClick={addTable}
          className="inline-flex items-center justify-center gap-2 bg-rose-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-rose-700 transition-colors shadow-lg shadow-rose-600/20 whitespace-nowrap self-start sm:self-auto flex-shrink-0"
        >
          <Plus className="w-4 h-4" /> Add Table
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Unassigned guests */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm sticky top-6">
            <div className="p-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900 mb-3">
                Unassigned Guests <span className="text-gray-400 font-normal">({unassigned.length})</span>
              </h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search guests..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-100 bg-white"
                />
              </div>
            </div>

            <div className="p-2 max-h-[560px] overflow-y-auto">
              {unassigned.length === 0 ? (
                <div className="text-center py-10 px-4">
                  <Users className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                  <p className="text-xs text-gray-400">
                    {guests.length === 0
                      ? "No guests added yet"
                      : totalSeated === guests.length
                      ? "All guests are seated 🎉"
                      : "No matching guests"}
                  </p>
                </div>
              ) : (
                unassigned.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => assignGuest(g.id)}
                    disabled={!activeTableId}
                    className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-left hover:bg-rose-50 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors group"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">{g.name}</p>
                      <p className="text-xs text-gray-400">
                        {g.headCount} {g.headCount === 1 ? "seat" : "seats"}
                        {g.category && (
                          <span
                            className={`ml-2 px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
                              categoryColors[g.category] || "bg-gray-50 text-gray-500"
                            }`}
                          >
                            {g.category}
                          </span>
                        )}
                      </p>
                    </div>
                    <Plus className="w-4 h-4 text-gray-300 group-hover:text-rose-500 shrink-0" />
                  </button>
                ))
              )}
            </div>

            {!activeTableId && tables.length > 0 && (
              <div className="p-3 border-t border-gray-100 text-[11px] text-gray-400 text-center">
                Select a table to assign guests
              </div>
            )}
          </div>
        </div>

        {/* Tables */}
        <div className="lg:col-span-2">
          {tables.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
              <LayoutGrid className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 text-sm mb-4">No tables yet</p>
              <button
                onClick={addTable}
                className="inline-flex items-center gap-2 bg-rose-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-rose-700 transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Your First Table
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tables.map((t) => {
                const seated = tableSeated(t);
                const isActive = activeTableId === t.id;
                const isFull = seated >= t.capacity;
                const isEditing = editingId === t.id;

                return (
                  <div
                    key={t.id}
                    onClick={() => !isEditing && setActiveTableId(t.id)}
                    className={`bg-white rounded-2xl border-2 shadow-sm cursor-pointer transition-all ${
                      isActive ? "border-rose-400 ring-2 ring-rose-100" : "border-gray-100 hover:border-gray-200"
                    }`}
                  >
                    <div className="p-4 border-b border-gray-100 flex items-start justify-between gap-2">
                      {isEditing ? (
                        <div className="flex-1 space-y-2" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-rose-400"
                            placeholder="Table name"
                          />
                          <div className="flex items-center gap-2">
                            <label className="text-xs text-gray-500">Seats</label>
                            <input
                              type="number"
                              min={1}
                              max={50}
                              value={editCapacity}
                              onChange={(e) => setEditCapacity(parseInt(e.target.value) || 1)}
                              className="w-16 px-2 py-1 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-rose-400"
                            />
                            <button
                              onClick={saveEdit}
                              className="ml-auto p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="p-1.5 rounded-lg bg-gray-50 text-gray-500 hover:bg-gray-100 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                              <Armchair className="w-4 h-4 text-rose-500" />
                              {t.name}
                            </h3>
                            <p className={`text-xs mt-0.5 ${isFull ? "text-amber-600 font-medium" : "text-gray-400"}`}>
                              {seated}/{t.capacity} seats {isFull && "· Full"}
                            </p>
                          </div>
                          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => startEdit(t)}
                              className="p-1.5 rounded-lg text-gray-300 hover:text-gray-600 hover:bg-gray-50 transition-colors"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => deleteTable(t.id)}
                              className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="px-4 pt-3">
                      <SeatDots capacity={t.capacity} seated={seated} />
                    </div>

                    <div className="p-3 min-h-[80px]">
                      {t.guestIds.length === 0 ? (
                        <p className="text-xs text-gray-300 text-center py-4">
                          {isActive ? "Click a guest on the left to seat them here" : "No guests seated"}
                        </p>
                      ) : (
                        <div className="space-y-1">
                          {t.guestIds.map((gid) => {
                            const g = guestMap.get(gid);
                            if (!g) return null;
                            return (
                              <div
                                key={gid}
                                className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 group"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm text-gray-900 truncate">
                                    {g.name}
                                    <span className="text-gray-400 ml-1">×{g.headCount}</span>
                                  </p>
                                </div>
                                <button
                                  onClick={() => unassignGuest(t.id, gid)}
                                  className="p-1 rounded text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              <button
                onClick={addTable}
                className="rounded-2xl border-2 border-dashed border-gray-200 hover:border-rose-300 hover:bg-rose-50/40 transition-colors min-h-[180px] flex flex-col items-center justify-center text-gray-400 hover:text-rose-500"
              >
                <Plus className="w-6 h-6 mb-1" />
                <span className="text-sm font-medium">Add another table</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SeatDots({ capacity, seated }: { capacity: number; seated: number }) {
  const max = 14;
  const visible = Math.min(capacity, max);
  const overflow = capacity - visible;
  const dots = Array.from({ length: visible }, (_, i) => i);
  return (
    <div className="flex flex-wrap items-center gap-1">
      {dots.map((i) => {
        const filled = i < seated;
        return (
          <div
            key={i}
            className={`w-6 h-6 rounded-md text-[10px] font-semibold flex items-center justify-center ${
              filled
                ? "bg-rose-600 text-white"
                : "bg-rose-50 text-rose-300 border border-rose-100"
            }`}
            aria-label={filled ? "Seated" : "Empty seat"}
          >
            {i + 1}
          </div>
        );
      })}
      {overflow > 0 && (
        <span className="text-[10px] text-gray-400 ml-1">+{overflow}</span>
      )}
    </div>
  );
}
