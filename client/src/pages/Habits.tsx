import { useEffect, useState } from "react";
import { Plus, Flame, Trophy, Pencil, Trash2 } from "lucide-react";
import { habitsApi } from "../api/endpoints";
import Modal from "../components/Modal";
import EmptyState from "../components/EmptyState";
import type { Habit } from "../types";

const ICONS = ["✨", "🌅", "🏃‍♀️", "📖", "💧", "🧘‍♀️", "🥗", "💪", "🎨", "🎵", "💻", "🛏️", "🌷", "☀️", "🌙"];
const COLORS = ["#fda4c0", "#fbcfe8", "#e9d5ff", "#bae6fd", "#fde68a", "#bbf7d0", "#fecdd3"];

export default function Habits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Habit | null>(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "General",
    dailyTarget: 1,
    unit: "time(s)",
    icon: "✨",
    color: COLORS[0],
  });

  async function load() {
    const res = await habitsApi.list();
    setHabits(res.data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setEditing(null);
    setForm({ name: "", description: "", category: "General", dailyTarget: 1, unit: "time(s)", icon: "✨", color: COLORS[0] });
    setModalOpen(true);
  }

  function openEdit(h: Habit) {
    setEditing(h);
    setForm({
      name: h.name,
      description: h.description || "",
      category: h.category,
      dailyTarget: h.dailyTarget,
      unit: h.unit,
      icon: h.icon,
      color: h.color,
    });
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editing) {
      await habitsApi.update(editing.id, form);
    } else {
      await habitsApi.create(form);
    }
    setModalOpen(false);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this habit? This will remove its full history.")) return;
    await habitsApi.delete(id);
    load();
  }

  async function handleToggle(id: string) {
    await habitsApi.toggle(id);
    load();
  }

  if (loading) return <div className="text-center py-20 text-4xl animate-float">🌸</div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-gray-400 text-sm">{habits.length} active habit{habits.length !== 1 ? "s" : ""}</p>
        <button onClick={openCreate} className="btn-primary flex items-center gap-1.5 text-sm">
          <Plus size={16} /> New Habit
        </button>
      </div>

      {habits.length === 0 ? (
        <EmptyState
          title="No habits yet"
          subtitle="Start small — even one habit a day builds a beautiful streak."
          action={
            <button onClick={openCreate} className="btn-primary text-sm">
              Create your first habit
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {habits.map((h) => (
            <div key={h.id} className="card card-hover animate-slide-up" style={{ borderColor: h.color + "55" }}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{h.icon}</span>
                  <div>
                    <p className="font-bold text-gray-700 dark:text-gray-100 text-sm">{h.name}</p>
                    <span className="badge" style={{ backgroundColor: h.color + "33", color: "#9e2154" }}>
                      {h.category}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(h)} className="btn-icon w-7 h-7">
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => handleDelete(h.id)} className="btn-icon w-7 h-7 text-rose-400">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {h.description && <p className="text-xs text-gray-400 mb-3">{h.description}</p>}

              <div className="flex items-center justify-between mb-3 text-xs">
                <span className="flex items-center gap-1 font-bold text-amber-500">
                  <Flame size={13} /> {h.currentStreak} day streak
                </span>
                <span className="flex items-center gap-1 font-bold text-lavender-500">
                  <Trophy size={13} /> Best: {h.longestStreak}
                </span>
              </div>

              <label className="flex items-center gap-2.5 cursor-pointer bg-blush-50/60 dark:bg-lavender-950/30 rounded-2xl p-2.5">
                <input
                  type="checkbox"
                  className="cute-checkbox"
                  checked={!!h.completedToday}
                  onChange={() => handleToggle(h.id)}
                />
                <span className={`text-sm font-medium ${h.completedToday ? "text-gray-400 line-through" : "text-gray-600 dark:text-gray-200"}`}>
                  {h.completedToday ? "Done for today!" : `Mark done (target: ${h.dailyTarget} ${h.unit})`}
                </span>
              </label>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Habit" : "New Habit"}>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="label-text">Name</label>
            <input
              required
              className="input-field"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Drink 3 liters water"
            />
          </div>
          <div>
            <label className="label-text">Description (optional)</label>
            <input
              className="input-field"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Why does this matter to you?"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-text">Category</label>
              <input
                className="input-field"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="Health, Study..."
              />
            </div>
            <div>
              <label className="label-text">Daily target</label>
              <input
                type="number"
                min={1}
                className="input-field"
                value={form.dailyTarget}
                onChange={(e) => setForm({ ...form, dailyTarget: parseInt(e.target.value) || 1 })}
              />
            </div>
          </div>
          <div>
            <label className="label-text">Unit</label>
            <input
              className="input-field"
              value={form.unit}
              onChange={(e) => setForm({ ...form, unit: e.target.value })}
              placeholder="time(s), liters, pages..."
            />
          </div>
          <div>
            <label className="label-text">Icon</label>
            <div className="flex flex-wrap gap-2">
              {ICONS.map((ic) => (
                <button
                  type="button"
                  key={ic}
                  onClick={() => setForm({ ...form, icon: ic })}
                  className={`w-9 h-9 flex items-center justify-center rounded-xl text-lg border-2 ${
                    form.icon === ic ? "border-blush-400 bg-blush-50" : "border-transparent bg-gray-50 dark:bg-lavender-900/30"
                  }`}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label-text">Color</label>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setForm({ ...form, color: c })}
                  className={`w-8 h-8 rounded-full border-2 ${form.color === c ? "border-gray-500" : "border-transparent"}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <button type="submit" className="btn-primary w-full mt-2">
            {editing ? "Save changes" : "Create habit"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
