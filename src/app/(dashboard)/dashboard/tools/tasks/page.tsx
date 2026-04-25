"use client";

import { useState, useEffect, useMemo } from "react";
import { CheckSquare, Plus, X, Search, Sparkles, Clock, AlertCircle } from "lucide-react";

type Status = "TODO" | "DONE";

type Task = {
  id: string;
  title: string;
  status: Status;
  category: string;
  assignedTo: string;
  dueDate: string;
};

const categories = ["Planning", "Venue", "Catering", "Vendors", "Invitations", "Attire", "Beauty", "Decor", "Photography", "Music", "Transport", "Other"];

const defaultTasks: Omit<Task, "id">[] = [
  { title: "Choose wedding date", category: "Planning", status: "DONE", assignedTo: "", dueDate: "" },
  { title: "Hire wedding planner", category: "Vendors", status: "DONE", assignedTo: "", dueDate: "" },
  { title: "Book venue deposit", category: "Venue", status: "DONE", assignedTo: "", dueDate: "" },
  { title: "Finalize venue contract", category: "Venue", status: "TODO", assignedTo: "A", dueDate: addDaysISO(1) },
  { title: "Send save-the-dates to guests", category: "Invitations", status: "TODO", assignedTo: "D", dueDate: addDaysISO(3) },
  { title: "Cake tasting", category: "Catering", status: "TODO", assignedTo: "A+D", dueDate: addDaysISO(6) },
  { title: "Confirm florist order & mood board", category: "Vendors", status: "TODO", assignedTo: "A", dueDate: addDaysISO(18) },
  { title: "Book makeup artist trial", category: "Beauty", status: "TODO", assignedTo: "A", dueDate: addDaysISO(22) },
  { title: "Order wedding favors", category: "Decor", status: "TODO", assignedTo: "D", dueDate: addDaysISO(28) },
  { title: "Review photographer contract", category: "Vendors", status: "DONE", assignedTo: "D", dueDate: "" },
  { title: "Send final seating chart to caterer", category: "Catering", status: "TODO", assignedTo: "A", dueDate: addDaysISO(60) },
  { title: "Pick up wedding bands", category: "Attire", status: "TODO", assignedTo: "D", dueDate: addDaysISO(75) },
  { title: "Rehearsal dinner reservation", category: "Venue", status: "TODO", assignedTo: "A+D", dueDate: addDaysISO(90) },
];

function addDaysISO(d: number): string {
  const t = new Date();
  t.setDate(t.getDate() + d);
  return t.toISOString().slice(0, 10);
}

function daysUntil(iso: string): number | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - today.getTime()) / 86400000);
}

function dateLabel(iso: string): string {
  const days = daysUntil(iso);
  if (days === null) return "";
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days <= 7) return `In ${days} days`;
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

const STORAGE_KEY = "invlk_tasks_v1";

const emptyForm = { title: "", category: "Planning", assignedTo: "", dueDate: "" };

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (Array.isArray(parsed)) setTasks(parsed);
      }
    } catch {
      // ignore corrupt storage
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks, loaded]);

  const openAdd = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (t: Task) => {
    setForm({ title: t.title, category: t.category, assignedTo: t.assignedTo, dueDate: t.dueDate });
    setEditingId(t.id);
    setShowForm(true);
  };

  const saveTask = () => {
    if (!form.title.trim()) return;
    const payload = {
      title: form.title.trim(),
      category: form.category,
      assignedTo: form.assignedTo.trim(),
      dueDate: form.dueDate,
    };
    if (editingId) {
      setTasks(tasks.map(t => t.id === editingId ? { ...t, ...payload } : t));
    } else {
      setTasks([...tasks, { id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, status: "TODO", ...payload }]);
    }
    setShowForm(false);
  };

  const toggleDone = (id: string) =>
    setTasks(tasks.map(t => t.id === id ? { ...t, status: t.status === "DONE" ? "TODO" : "DONE" } : t));
  const deleteTask = (id: string) => setTasks(tasks.filter(t => t.id !== id));
  const addDefaults = () => {
    const next = defaultTasks.map((d, i) => ({ id: `seed-${Date.now()}-${i}`, ...d }));
    setTasks([...tasks, ...next]);
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return tasks;
    return tasks.filter(t =>
      t.title.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q) ||
      t.assignedTo.toLowerCase().includes(q),
    );
  }, [tasks, search]);

  const total = tasks.length;
  const done = tasks.filter(t => t.status === "DONE").length;
  const remaining = total - done;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  const todoTasks = filtered.filter(t => t.status !== "DONE");
  const dueThisWeek = todoTasks.filter(t => {
    const d = daysUntil(t.dueDate);
    return d !== null && d >= 0 && d <= 7;
  });
  const urgentCount = todoTasks.filter(t => {
    const d = daysUntil(t.dueDate);
    return d !== null && d <= 1;
  }).length;
  const inProgressCategoryCount = new Set(todoTasks.map(t => t.category)).size;

  type Bucket = { key: string; label: string; tasks: Task[] };
  const buckets: Bucket[] = [];
  const thisWeek: Task[] = [];
  const next2to4: Task[] = [];
  const later: Task[] = [];
  todoTasks.forEach(t => {
    const d = daysUntil(t.dueDate);
    if (d !== null && d <= 7) thisWeek.push(t);
    else if (d !== null && d <= 30) next2to4.push(t);
    else later.push(t);
  });
  const sortByDate = (a: Task, b: Task) => {
    const da = daysUntil(a.dueDate);
    const db = daysUntil(b.dueDate);
    if (da === null && db === null) return 0;
    if (da === null) return 1;
    if (db === null) return -1;
    return da - db;
  };
  thisWeek.sort(sortByDate);
  next2to4.sort(sortByDate);
  later.sort(sortByDate);
  if (thisWeek.length) buckets.push({ key: "this-week", label: "This week", tasks: thisWeek });
  if (next2to4.length) buckets.push({ key: "in-2-4", label: "In 2-4 weeks", tasks: next2to4 });
  if (later.length) buckets.push({ key: "later", label: "Later", tasks: later });
  const completed = filtered.filter(t => t.status === "DONE");
  if (completed.length) buckets.push({ key: "completed", label: "Completed", tasks: completed });

  return (
    <div>
      {tasks.length > 0 && (
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search tasks..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-100"
            />
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Task Checklist</h1>
          <p className="text-gray-400 mt-1 text-sm">
            {total === 0 ? "Build your wedding to-do list." : `${done} of ${total} completed · ${remaining} remaining`}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {tasks.length === 0 && (
            <button onClick={addDefaults} className="border border-gray-200 text-gray-600 px-4 py-2 rounded-xl text-sm hover:bg-gray-50 flex items-center gap-1">
              <Sparkles className="w-4 h-4" /> Add defaults
            </button>
          )}
          <button onClick={openAdd} className="bg-rose-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-rose-700 flex items-center gap-1">
            <Plus className="w-4 h-4" /> Add task
          </button>
        </div>
      </div>

      {tasks.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-rose-50 rounded-2xl p-4 border border-rose-100">
            <p className="text-[11px] uppercase tracking-wider text-gray-500">Overall progress</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{pct}% <span className="text-xs font-normal text-gray-500">on track</span></p>
            <div className="mt-2 h-1.5 bg-white rounded-full overflow-hidden">
              <div className="h-full bg-rose-600 rounded-full" style={{ width: `${pct}%` }} />
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <p className="text-[11px] uppercase tracking-wider text-gray-400">Due this week</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{dueThisWeek.length}</p>
            <p className={`text-xs mt-1 ${urgentCount > 0 ? "text-rose-600" : "text-gray-400"}`}>
              {urgentCount > 0 ? `${urgentCount} urgent` : "On schedule"}
            </p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <p className="text-[11px] uppercase tracking-wider text-gray-400">In progress</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{remaining}</p>
            <p className="text-xs text-gray-400 mt-1">across {inProgressCategoryCount} {inProgressCategoryCount === 1 ? "category" : "categories"}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <p className="text-[11px] uppercase tracking-wider text-gray-400">Completed</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{done}</p>
            <p className="text-xs text-emerald-600 mt-1">{done === 0 ? "—" : done < 3 ? "Good start" : "Great work"}</p>
          </div>
        </div>
      )}

      {tasks.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <CheckSquare className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 mb-1 font-medium">No tasks yet</p>
          <p className="text-gray-400 text-sm mb-4">Build a starter checklist or add your own tasks.</p>
          <button onClick={addDefaults} className="bg-rose-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-rose-700 inline-flex items-center gap-1">
            <Sparkles className="w-4 h-4" /> Add defaults
          </button>
        </div>
      ) : buckets.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
          <p className="text-gray-400 text-sm">No tasks match &quot;{search}&quot;.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {buckets.map(bucket => (
            <div key={bucket.key}>
              <div className="text-[11px] uppercase tracking-wider text-gray-400 font-medium mb-2 px-1">
                {bucket.label} · {bucket.tasks.length}
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
                {bucket.tasks.map(task => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    onToggle={() => toggleDone(task.id)}
                    onEdit={() => openEdit(task)}
                    onDelete={() => deleteTask(task.id)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">{editingId ? "Edit task" : "Add task"}</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <input
              type="text"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder="Task title"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm mb-3 focus:outline-none focus:border-rose-500"
              autoFocus
            />
            <div className="grid grid-cols-2 gap-3 mb-3">
              <select
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
                className="px-3 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-rose-500"
              >
                {categories.map(c => <option key={c}>{c}</option>)}
              </select>
              <input
                type="text"
                value={form.assignedTo}
                onChange={e => setForm({ ...form, assignedTo: e.target.value })}
                placeholder="Assigned to (e.g. A, D, A+D)"
                maxLength={6}
                className="px-3 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-rose-500"
              />
            </div>
            <label className="text-xs text-gray-500 block mb-4">
              Due date
              <input
                type="date"
                value={form.dueDate}
                onChange={e => setForm({ ...form, dueDate: e.target.value })}
                className="mt-1 w-full px-3 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-rose-500"
              />
            </label>
            <div className="flex gap-3">
              <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={saveTask} className="flex-1 bg-rose-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-rose-700">
                {editingId ? "Save" : "Add task"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TaskRow({ task, onToggle, onEdit, onDelete }: { task: Task; onToggle: () => void; onEdit: () => void; onDelete: () => void }) {
  const days = daysUntil(task.dueDate);
  const overdue = task.status !== "DONE" && days !== null && days < 0;
  const tomorrow = task.status !== "DONE" && days !== null && days <= 1;
  const dateColor = overdue || tomorrow ? "text-rose-600" : "text-gray-400";

  return (
    <div className="flex items-center gap-3 p-4 group">
      <button
        onClick={onToggle}
        className={`w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
          task.status === "DONE"
            ? "bg-emerald-500 border-emerald-500 text-white"
            : "border-gray-300 hover:border-rose-400 bg-white"
        }`}
        aria-label={task.status === "DONE" ? "Mark incomplete" : "Mark complete"}
      >
        {task.status === "DONE" && (
          <svg viewBox="0 0 12 12" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M2 6.5L5 9.5L10 3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>
      <button onClick={onEdit} className="flex-1 text-left min-w-0">
        <p className={`font-medium truncate ${task.status === "DONE" ? "line-through text-gray-400" : "text-gray-900"}`}>
          {task.title}
        </p>
        <div className="flex items-center gap-2 flex-wrap mt-1">
          {task.category && (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{task.category}</span>
          )}
          {task.assignedTo && (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 font-medium">{task.assignedTo}</span>
          )}
          {task.dueDate && task.status !== "DONE" && (
            <span className={`text-[11px] flex items-center gap-1 ${dateColor}`}>
              {overdue ? <AlertCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
              {dateLabel(task.dueDate)}
            </span>
          )}
        </div>
      </button>
      <button
        onClick={onDelete}
        className="text-gray-300 hover:text-rose-600 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity flex-shrink-0"
        aria-label={`Delete ${task.title}`}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
