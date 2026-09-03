import { useEffect, useState } from "react";
import { Plus, Trash2, Pencil, Target, Calendar } from "lucide-react";
import { goalsApi } from "../api/endpoints";
import Modal from "../components/Modal";
import EmptyState from "../components/EmptyState";
import ProgressBar from "../components/ProgressBar";
import { formatShortDate, daysUntil } from "../utils/format";
import type { Goal, GoalType } from "../types";

export default function Goals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Goal | null>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "short" as GoalType,
    deadline: "",
    progress: 0,
  });

  async function load() {
    const res = await goalsApi.list();
    setGoals(res.data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate(type: GoalType) {
    setEditing(null);
    setForm({ title: "", description: "", type, deadline: "", progress: 0 });
    setModalOpen(true);
  }

  function openEdit(g: Goal) {
    setEditing(g);
    setForm({ title: g.title, description: g.description || "", type: g.type, deadline: g.deadline || "", progress: g.progress });
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editing) {
      await goalsApi.update(editing.id, form);
    } else {
      await goalsApi.create(form);
    }
    setModalOpen(false);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this goal?")) return;
    await goalsApi.delete(id);
    load();
  }

  async function quickUpdateProgress(g: Goal, progress: number) {
    await goalsApi.update(g.id, { progress });
    load();
  }

  if (loading) return <div className="text-center py-20 text-4xl animate-float">🎯</div>;

  const shortGoals = goals.filter((g) => g.type === "short");
  const longGoals = goals.filter((g) => g.type === "long");

  function renderGoalCard(g: Goal) {
    const days = daysUntil(g.deadline);
    return (
      <div key={g.id} className="card card-hover animate-slide-up">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-blush-200 to-lavender-200 flex items-center justify-center shrink-0">
              <Target size={16} className="text-blush-600" />
            </span>
            <div className="min-w-0">
              <p className="font-bold text-gray-700 dark:text-gray-100 text-sm truncate">{g.title}</p>
              {g.deadline && (
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <Calendar size={11} /> {formatShortDate(g.deadline)}
                  {days !== null && days >= 0 && ` · ${days}d left`}
                  {days !== null && days < 0 && ` · overdue`}
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-1 shrink-0">
            <button onClick={() => openEdit(g)} className="btn-icon w-7 h-7">
              <Pencil size={13} />
            </button>
            <button onClick={() => handleDelete(g.id)} className="btn-icon w-7 h-7 text-rose-400">
              <Trash2 size={13} />
            </button>
          </div>
        </div>
        {g.description && <p className="text-xs text-gray-400 mb-3">{g.description}</p>}
        <ProgressBar value={g.progress} showLabel />
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={g.progress}
          onChange={(e) => quickUpdateProgress(g, parseInt(e.target.value))}
          className="w-full mt-2 accent-blush-500"
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-700 dark:text-gray-100">🌱 Short-Term Goals</h3>
          <button onClick={() => openCreate("short")} className="btn-secondary text-sm flex items-center gap-1.5 py-1.5 px-3.5">
            <Plus size={14} /> Add
          </button>
        </div>
        {shortGoals.length === 0 ? (
          <EmptyState emoji="🌱" title="No short-term goals yet" subtitle="e.g. Finish ARM syllabus" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{shortGoals.map(renderGoalCard)}</div>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-700 dark:text-gray-100">🌳 Long-Term Goals</h3>
          <button onClick={() => openCreate("long")} className="btn-secondary text-sm flex items-center gap-1.5 py-1.5 px-3.5">
            <Plus size={14} /> Add
          </button>
        </div>
        {longGoals.length === 0 ? (
          <EmptyState emoji="🌳" title="No long-term goals yet" subtitle="e.g. Score above 9 CGPA" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{longGoals.map(renderGoalCard)}</div>
        )}
      </section>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Goal" : "New Goal"}>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="label-text">Goal name</label>
            <input
              required
              className="input-field"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Finish ARM syllabus"
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
              <label className="label-text">Type</label>
              <select
                className="input-field"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as GoalType })}
              >
                <option value="short">Short-term</option>
                <option value="long">Long-term</option>
              </select>
            </div>
            <div>
              <label className="label-text">Deadline</label>
              <input
                type="date"
                className="input-field"
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="label-text">Progress: {form.progress}%</label>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={form.progress}
              onChange={(e) => setForm({ ...form, progress: parseInt(e.target.value) })}
              className="w-full accent-blush-500"
            />
          </div>
          <button type="submit" className="btn-primary w-full mt-2">
            {editing ? "Save changes" : "Create goal"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
