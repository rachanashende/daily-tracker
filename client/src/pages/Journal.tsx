import { useEffect, useState } from "react";
import { Save, Trash2 } from "lucide-react";
import { journalApi } from "../api/endpoints";
import EmptyState from "../components/EmptyState";
import { formatShortDate, todayISO, formatPrettyDate } from "../utils/format";
import type { JournalEntry } from "../types";

const MOODS = ["😊", "😌", "😄", "😴", "😢", "😤", "🥳", "😰"];

export default function Journal() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [mood, setMood] = useState("😊");
  const [saving, setSaving] = useState(false);

  async function load() {
    const res = await journalApi.list();
    setEntries(res.data);
    const todayEntry = res.data.find((e) => e.date === todayISO());
    if (todayEntry) {
      setContent(todayEntry.content);
      setMood(todayEntry.mood || "😊");
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSave() {
    if (!content.trim()) return;
    setSaving(true);
    await journalApi.save({ content, mood, date: todayISO() });
    setSaving(false);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this journal entry?")) return;
    await journalApi.delete(id);
    load();
  }

  if (loading) return <div className="text-center py-20 text-4xl animate-float">📝</div>;

  const pastEntries = entries.filter((e) => e.date !== todayISO());

  return (
    <div className="space-y-6">
      <div className="card animate-slide-up">
        <p className="text-sm text-gray-400 mb-1">{formatPrettyDate()}</p>
        <h3 className="font-bold text-gray-700 dark:text-gray-100 mb-3">How are you feeling today?</h3>

        <div className="flex gap-2 mb-4 flex-wrap">
          {MOODS.map((m) => (
            <button
              key={m}
              onClick={() => setMood(m)}
              className={`w-10 h-10 rounded-full text-xl flex items-center justify-center transition-all ${
                mood === m ? "bg-blush-100 dark:bg-lavender-800 scale-110 shadow-soft" : "bg-gray-50 dark:bg-lavender-900/20"
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        <textarea
          className="input-field"
          rows={6}
          placeholder="Write about your day, your wins, your thoughts... 🌸"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <button onClick={handleSave} disabled={saving || !content.trim()} className="btn-primary mt-3 flex items-center gap-2 text-sm">
          <Save size={15} /> {saving ? "Saving..." : "Save entry"}
        </button>
      </div>

      <div>
        <h3 className="font-bold text-gray-700 dark:text-gray-100 mb-3">Past Entries</h3>
        {pastEntries.length === 0 ? (
          <EmptyState emoji="📔" title="No past entries yet" subtitle="Your journal history will appear here." />
        ) : (
          <div className="space-y-3">
            {pastEntries.map((e) => (
              <div key={e.id} className="card animate-slide-up">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{e.mood || "📝"}</span>
                    <span className="font-semibold text-sm text-gray-600 dark:text-gray-200">{formatShortDate(e.date)}</span>
                  </div>
                  <button onClick={() => handleDelete(e.id)} className="btn-icon w-7 h-7 text-rose-400">
                    <Trash2 size={13} />
                  </button>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-300 whitespace-pre-wrap">{e.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
