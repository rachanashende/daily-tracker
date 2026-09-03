import { useEffect, useState } from "react";
import { Plus, Pin, Trash2 } from "lucide-react";
import { notesApi } from "../api/endpoints";
import Modal from "../components/Modal";
import EmptyState from "../components/EmptyState";
import type { Note } from "../types";

const COLORS = ["#fde2f3", "#fef3c7", "#dbeafe", "#dcfce7", "#ede9fe", "#fee2e2"];

export default function Notes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", color: COLORS[0] });

  async function load() {
    const res = await notesApi.list();
    setNotes(res.data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setForm({ title: "", content: "", color: COLORS[Math.floor(Math.random() * COLORS.length)] });
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await notesApi.create(form);
    setModalOpen(false);
    load();
  }

  async function togglePin(note: Note) {
    await notesApi.update(note.id, { pinned: !note.pinned });
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this note?")) return;
    await notesApi.delete(id);
    load();
  }

  if (loading) return <div className="text-center py-20 text-4xl animate-float">📌</div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-gray-400 text-sm">Jot down anything on your mind 💭</p>
        <button onClick={openCreate} className="btn-primary flex items-center gap-1.5 text-sm">
          <Plus size={16} /> New Note
        </button>
      </div>

      {notes.length === 0 ? (
        <EmptyState
          emoji="📌"
          title="No notes yet"
          subtitle="Capture quick thoughts, reminders, or ideas."
          action={
            <button onClick={openCreate} className="btn-primary text-sm">
              Add a note
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((n) => (
            <div
              key={n.id}
              className="rounded-3xl p-4 shadow-soft animate-slide-up relative"
              style={{ backgroundColor: n.color }}
            >
              <div className="flex items-start justify-between mb-2">
                <p className="font-bold text-gray-700 text-sm pr-2">{n.title}</p>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => togglePin(n)} className={`btn-icon w-7 h-7 ${n.pinned ? "text-blush-600" : "text-gray-400"}`}>
                    <Pin size={13} fill={n.pinned ? "currentColor" : "none"} />
                  </button>
                  <button onClick={() => handleDelete(n.id)} className="btn-icon w-7 h-7 text-rose-400">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{n.content}</p>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Note">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="label-text">Title</label>
            <input
              required
              className="input-field"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Note title"
            />
          </div>
          <div>
            <label className="label-text">Content</label>
            <textarea
              className="input-field"
              rows={4}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="Write your note..."
            />
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
            Save note
          </button>
        </form>
      </Modal>
    </div>
  );
}
