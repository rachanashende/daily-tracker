import { useEffect, useState } from "react";
import { Plus, Trash2, Pencil, Calendar } from "lucide-react";
import { tasksApi } from "../api/endpoints";
import Modal from "../components/Modal";
import EmptyState from "../components/EmptyState";
import { priorityColor, statusColor, formatShortDate } from "../utils/format";
import type { Task, Priority, TaskStatus } from "../types";

const STATUSES: TaskStatus[] = ["Pending", "InProgress", "Completed"];
const PRIORITIES: Priority[] = ["Low", "Medium", "High"];

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [filter, setFilter] = useState<TaskStatus | "All">("All");

  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "Medium" as Priority,
    dueDate: "",
    status: "Pending" as TaskStatus,
  });

  async function load() {
    const res = await tasksApi.list();
    setTasks(res.data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setEditing(null);
    setForm({ title: "", description: "", priority: "Medium", dueDate: "", status: "Pending" });
    setModalOpen(true);
  }

  function openEdit(t: Task) {
    setEditing(t);
    setForm({
      title: t.title,
      description: t.description || "",
      priority: t.priority,
      dueDate: t.dueDate || "",
      status: t.status,
    });
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editing) {
      await tasksApi.update(editing.id, form);
    } else {
      await tasksApi.create(form);
    }
    setModalOpen(false);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this task?")) return;
    await tasksApi.delete(id);
    load();
  }

  async function handleToggleComplete(id: string) {
    await tasksApi.toggleComplete(id);
    load();
  }

  if (loading) return <div className="text-center py-20 text-4xl animate-float">✅</div>;

  const filtered = filter === "All" ? tasks : tasks.filter((t) => t.status === filter);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2 overflow-x-auto">
          {(["All", ...STATUSES] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3.5 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                filter === f
                  ? "bg-gradient-to-r from-blush-400 to-lavender-400 text-white shadow-soft"
                  : "bg-white dark:bg-lavender-900/30 text-gray-500 dark:text-gray-300"
              }`}
            >
              {f === "InProgress" ? "In Progress" : f}
            </button>
          ))}
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-1.5 text-sm shrink-0">
          <Plus size={16} /> New Task
        </button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          emoji="✅"
          title="No tasks here"
          subtitle="Add a task to start checking things off your list."
          action={
            <button onClick={openCreate} className="btn-primary text-sm">
              Add a task
            </button>
          }
        />
      ) : (
        <div className="space-y-2.5">
          {filtered.map((t) => (
            <div key={t.id} className="card card-hover flex items-start gap-3 animate-slide-up">
              <input
                type="checkbox"
                className="cute-checkbox mt-0.5"
                checked={t.status === "Completed"}
                onChange={() => handleToggleComplete(t.id)}
              />
              <div className="flex-1 min-w-0">
                <p className={`font-semibold text-sm ${t.status === "Completed" ? "text-gray-400 line-through" : "text-gray-700 dark:text-gray-100"}`}>
                  {t.title}
                </p>
                {t.description && <p className="text-xs text-gray-400 mt-0.5">{t.description}</p>}
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className={`badge ${priorityColor(t.priority)}`}>{t.priority}</span>
                  <span className={`badge ${statusColor(t.status)}`}>{t.status === "InProgress" ? "In Progress" : t.status}</span>
                  {t.dueDate && (
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Calendar size={12} /> {formatShortDate(t.dueDate)}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => openEdit(t)} className="btn-icon w-7 h-7">
                  <Pencil size={13} />
                </button>
                <button onClick={() => handleDelete(t.id)} className="btn-icon w-7 h-7 text-rose-400">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Task" : "New Task"}>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="label-text">Title</label>
            <input
              required
              className="input-field"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Finish ARM assignment"
            />
          </div>
          <div>
            <label className="label-text">Description (optional)</label>
            <textarea
              className="input-field"
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-text">Priority</label>
              <select
                className="input-field"
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value as Priority })}
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-text">Status</label>
              <select
                className="input-field"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as TaskStatus })}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s === "InProgress" ? "In Progress" : s}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="label-text">Due date (optional)</label>
            <input
              type="date"
              className="input-field"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            />
          </div>
          <button type="submit" className="btn-primary w-full mt-2">
            {editing ? "Save changes" : "Create task"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
