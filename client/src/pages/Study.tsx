import { useEffect, useState } from "react";
import { Plus, Trash2, BookOpen, Clock, CalendarDays, TrendingUp } from "lucide-react";
import { studyApi } from "../api/endpoints";
import Modal from "../components/Modal";
import EmptyState from "../components/EmptyState";
import StatCard from "../components/StatCard";
import { minutesToHM, formatShortDate, todayISO } from "../utils/format";
import type { StudySession } from "../types";

interface StudyStats {
  todayMinutes: number;
  weekMinutes: number;
  monthMinutes: number;
  bySubject: Record<string, number>;
  trend: { date: string; minutes: number }[];
}

const SUGGESTED_SUBJECTS = ["ARM Architecture", "Algorithms", "DBMS", "Operating Systems"];

export default function Study() {
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [stats, setStats] = useState<StudyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const [form, setForm] = useState({
    subject: "",
    topic: "",
    duration: 30,
    notes: "",
    date: todayISO(),
  });

  async function load() {
    const [sessRes, statsRes] = await Promise.all([studyApi.list({ limit: "50" } as any), studyApi.stats()]);
    setSessions(sessRes.data);
    setStats(statsRes.data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setForm({ subject: "", topic: "", duration: 30, notes: "", date: todayISO() });
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await studyApi.create(form);
    setModalOpen(false);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this study session?")) return;
    await studyApi.delete(id);
    load();
  }

  if (loading) return <div className="text-center py-20 text-4xl animate-float">📖</div>;

  const subjectEntries = Object.entries(stats?.bySubject || {}).sort((a, b) => b[1] - a[1]);
  const maxSubjectMinutes = Math.max(...subjectEntries.map((e) => e[1]), 1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-gray-400 text-sm">Track your focused study time, subject by subject 📚</p>
        <button onClick={openCreate} className="btn-primary flex items-center gap-1.5 text-sm">
          <Plus size={16} /> Log Session
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={<Clock size={20} />} label="Today" value={minutesToHM(stats?.todayMinutes ?? 0)} accent="from-blush-400 to-rose-300" />
        <StatCard icon={<CalendarDays size={20} />} label="This Week" value={minutesToHM(stats?.weekMinutes ?? 0)} accent="from-lavender-400 to-purple-300" />
        <StatCard icon={<TrendingUp size={20} />} label="This Month" value={minutesToHM(stats?.monthMinutes ?? 0)} accent="from-amber-300 to-blush-300" />
      </div>

      <div className="card">
        <h3 className="font-bold text-gray-700 dark:text-gray-100 mb-4">Subject-wise breakdown</h3>
        {subjectEntries.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">No study sessions logged yet.</p>
        ) : (
          <div className="space-y-3">
            {subjectEntries.map(([subject, mins]) => (
              <div key={subject}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-600 dark:text-gray-200">{subject}</span>
                  <span className="text-gray-400">{minutesToHM(mins)}</span>
                </div>
                <div className="w-full h-2.5 bg-blush-50 dark:bg-lavender-950/50 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blush-400 to-lavender-400 progress-fill"
                    style={{ width: `${(mins / maxSubjectMinutes) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <h3 className="font-bold text-gray-700 dark:text-gray-100 mb-4">Recent Sessions</h3>
        {sessions.length === 0 ? (
          <EmptyState
            emoji="📖"
            title="No sessions yet"
            subtitle="Log your first study session to start tracking your hours."
            action={
              <button onClick={openCreate} className="btn-primary text-sm">
                Log a session
              </button>
            }
          />
        ) : (
          <div className="space-y-2.5">
            {sessions.map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-3 p-3 rounded-2xl bg-blush-50/60 dark:bg-lavender-950/30 animate-slide-up"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-lavender-200 to-blush-200 flex items-center justify-center shrink-0">
                  <BookOpen size={17} className="text-lavender-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-100 truncate">{s.subject}</p>
                  <p className="text-xs text-gray-400 truncate">
                    {s.topic ? `${s.topic} · ` : ""}
                    {formatShortDate(s.date)}
                  </p>
                </div>
                <span className="badge bg-lavender-100 text-lavender-600 dark:bg-lavender-900/40 dark:text-lavender-200 shrink-0">
                  {minutesToHM(s.duration)}
                </span>
                <button onClick={() => handleDelete(s.id)} className="btn-icon w-7 h-7 text-rose-400 shrink-0">
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Log Study Session">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="label-text">Subject</label>
            <input
              required
              list="subject-suggestions"
              className="input-field"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              placeholder="e.g. ARM Architecture"
            />
            <datalist id="subject-suggestions">
              {SUGGESTED_SUBJECTS.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </div>
          <div>
            <label className="label-text">Topic (optional)</label>
            <input
              className="input-field"
              value={form.topic}
              onChange={(e) => setForm({ ...form, topic: e.target.value })}
              placeholder="e.g. Pipelining"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-text">Duration (minutes)</label>
              <input
                type="number"
                min={1}
                required
                className="input-field"
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: parseInt(e.target.value) || 1 })}
              />
            </div>
            <div>
              <label className="label-text">Date</label>
              <input
                type="date"
                className="input-field"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="label-text">Notes (optional)</label>
            <textarea
              className="input-field"
              rows={3}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="What did you cover?"
            />
          </div>
          <button type="submit" className="btn-primary w-full mt-2">
            Save session
          </button>
        </form>
      </Modal>
    </div>
  );
}
