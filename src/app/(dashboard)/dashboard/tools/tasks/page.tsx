"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { CheckSquare, Plus, X, Circle, CheckCircle2, Clock, Lock } from "lucide-react";
import Link from "next/link";

const defaultTasks = [
  { title: "Book venue", category: "Venue", priority: "HIGH" },
  { title: "Hire photographer", category: "Photography", priority: "HIGH" },
  { title: "Order wedding cake", category: "Catering", priority: "MEDIUM" },
  { title: "Choose decorations", category: "Decoration", priority: "MEDIUM" },
  { title: "Finalize guest list", category: "Planning", priority: "HIGH" },
  { title: "Send invitations", category: "Planning", priority: "URGENT" },
  { title: "Buy wedding attire", category: "Attire", priority: "HIGH" },
  { title: "Arrange transport", category: "Transport", priority: "LOW" },
];

type Task = { id: string; title: string; status: string; priority: string; category: string | null };

const statusIcons: Record<string, React.ReactNode> = {
  TODO: <Circle className="w-5 h-5 text-gray-300" />,
  IN_PROGRESS: <Clock className="w-5 h-5 text-blue-500" />,
  DONE: <CheckCircle2 className="w-5 h-5 text-green-500" />,
};
const priorityColors: Record<string, string> = { LOW: "text-gray-400", MEDIUM: "text-blue-500", HIGH: "text-amber-500", URGENT: "text-red-500" };

export default function TasksPage() {
  const { data: session } = useSession();
  const plan = session?.user?.plan || "FREE";
  const hasAccess = plan === "STANDARD" || plan === "PREMIUM";

  const [tasks, setTasks] = useState<Task[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: "", priority: "MEDIUM", category: "" });

  if (!hasAccess) {
    return (
      <div className="text-center py-20">
        <Lock className="w-12 h-12 text-gray-200 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Standard Plan Required</h2>
        <p className="text-gray-400 mb-6">Task checklist is available on Standard and Premium plans.</p>
        <Link href="/pricing" className="bg-rose-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-rose-700">Upgrade Now</Link>
      </div>
    );
  }

  const addTask = () => {
    if (!form.title) return;
    setTasks([...tasks, { id: Date.now().toString(), title: form.title, status: "TODO", priority: form.priority, category: form.category || null }]);
    setForm({ title: "", priority: "MEDIUM", category: "" });
    setShowAdd(false);
  };

  const cycleStatus = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, status: t.status === "TODO" ? "IN_PROGRESS" : t.status === "IN_PROGRESS" ? "DONE" : "TODO" } : t));
  };

  const deleteTask = (id: string) => setTasks(tasks.filter(t => t.id !== id));

  const addDefaults = () => {
    const newTasks = defaultTasks.map((t, i) => ({ id: `default-${i}`, ...t, status: "TODO", category: t.category }));
    setTasks([...tasks, ...newTasks]);
  };

  const done = tasks.filter(t => t.status === "DONE").length;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Task Checklist</h1>
          <p className="text-gray-400 mt-1">{done}/{tasks.length} completed</p>
        </div>
        <div className="flex gap-2">
          {tasks.length === 0 && <button onClick={addDefaults} className="border border-gray-200 text-gray-600 px-4 py-2 rounded-xl text-sm hover:bg-gray-50">Add Defaults</button>}
          <button onClick={() => setShowAdd(true)} className="bg-rose-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-rose-700 flex items-center gap-1"><Plus className="w-4 h-4" /> Add Task</button>
        </div>
      </div>

      {tasks.length > 0 && (
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Progress</span>
            <span className="text-sm font-bold">{tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5">
            <div className="bg-rose-500 h-2.5 rounded-full transition-all" style={{ width: `${tasks.length > 0 ? (done / tasks.length) * 100 : 0}%` }} />
          </div>
        </div>
      )}

      {tasks.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <CheckSquare className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400">No tasks yet. Click &quot;Add Defaults&quot; for a starter checklist.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <div key={task.id} className={`bg-white rounded-xl p-4 border border-gray-100 flex items-center gap-3 ${task.status === "DONE" ? "opacity-60" : ""}`}>
              <button onClick={() => cycleStatus(task.id)}>{statusIcons[task.status]}</button>
              <div className="flex-1">
                <p className={`font-medium ${task.status === "DONE" ? "line-through text-gray-400" : "text-gray-900"}`}>{task.title}</p>
                <div className="flex gap-3 mt-0.5">
                  {task.category && <span className="text-xs text-gray-400">{task.category}</span>}
                  <span className={`text-xs font-medium ${priorityColors[task.priority]}`}>{task.priority}</span>
                </div>
              </div>
              <button onClick={() => deleteTask(task.id)} className="text-gray-300 hover:text-red-500"><X className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="font-semibold text-gray-900 mb-4">Add Task</h3>
            <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Task title" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm mb-3 focus:outline-none focus:border-rose-500" />
            <div className="grid grid-cols-2 gap-3 mb-4">
              <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-rose-500">
                <option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option><option value="URGENT">Urgent</option>
              </select>
              <input type="text" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="Category" className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-rose-500" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowAdd(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600">Cancel</button>
              <button onClick={addTask} className="flex-1 bg-rose-600 text-white py-2.5 rounded-xl text-sm font-medium">Add</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
