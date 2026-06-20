import { useEffect, useState } from "react";
import { Sparkles, BookOpen, CheckSquare, Target, Flame } from "lucide-react";
import { dashboardApi, habitsApi } from "../api/endpoints";
import StatCard from "../components/StatCard";
import ProgressBar from "../components/ProgressBar";
import EmptyState from "../components/EmptyState";
import { formatPrettyDate, minutesToHM } from "../utils/format";
import { Link } from "react-router-dom";
import type { DashboardSummary, Habit } from "../types";

export default function Dashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    const [dashRes, habitsRes] = await Promise.all([dashboardApi.get(), habitsApi.list()]);
    setSummary(dashRes.data);
    setHabits(habitsRes.data);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleToggle(habitId: string) {
    await habitsApi.toggle(habitId);
    loadData();
  }

  if (loading) {
    return <div className="text-center py-20 text-4xl animate-float">🌸</div>;
  }

  return (
    <div className="space-y-6">
      <div className="animate-slide-up">
        <p className="text-gray-400 text-sm font-medium">{formatPrettyDate()}</p>
        <h2 className="font-display text-2xl font-extrabold text-gray-700 dark:text-gray-50 mt-1">
          Hello there! Here's today's glow-up ✨
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Sparkles size={20} />}
          label="Habits completed"
          value={`${summary?.habitsCompletedToday ?? 0}/${summary?.totalHabits ?? 0}`}
          accent="from-blush-400 to-rose-300"
        />
        <StatCard
          icon={<BookOpen size={20} />}
          label="Study time today"
          value={minutesToHM(summary?.studyMinutesToday ?? 0)}
          accent="from-lavender-400 to-purple-300"
        />
        <StatCard
          icon={<CheckSquare size={20} />}
          label="Tasks done today"
          value={summary?.tasksCompletedToday ?? 0}
          sublabel={`${summary?.tasksDueToday ?? 0} due today`}
          accent="from-amber-300 to-blush-300"
        />
        <StatCard
          icon={<Target size={20} />}
          label="Goal progress"
          value={`${summary?.avgGoalProgress ?? 0}%`}
          sublabel={`${summary?.activeGoalsCount ?? 0} active goals`}
          accent="from-emerald-300 to-lavender-300"
        />
      </div>

      <div className="card animate-slide-up">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-700 dark:text-gray-100">Today's Completion</h3>
          <span className="text-2xl font-extrabold text-blush-500">{summary?.completionPercentage ?? 0}%</span>
        </div>
        <ProgressBar value={summary?.completionPercentage ?? 0} height="h-3" />
      </div>

      <div className="card animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-700 dark:text-gray-100">Today's Habits</h3>
          <Link to="/habits" className="text-sm text-blush-500 font-semibold hover:underline">
            View all
          </Link>
        </div>

        {habits.length === 0 ? (
          <EmptyState
            title="No habits yet"
            subtitle="Create your first habit to start your streak journey!"
            action={
              <Link to="/habits" className="btn-primary text-sm">
                Add a habit
              </Link>
            }
          />
        ) : (
          <div className="space-y-2.5">
            {habits.slice(0, 6).map((h) => (
              <div
                key={h.id}
                className="flex items-center gap-3 p-3 rounded-2xl bg-blush-50/60 dark:bg-lavender-950/30 hover:bg-blush-50 dark:hover:bg-lavender-900/40 transition-colors"
              >
                <input
                  type="checkbox"
                  className="cute-checkbox"
                  checked={!!h.completedToday}
                  onChange={() => handleToggle(h.id)}
                />
                <span className="text-xl">{h.icon}</span>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-semibold truncate ${
                      h.completedToday ? "text-gray-400 line-through" : "text-gray-700 dark:text-gray-100"
                    }`}
                  >
                    {h.name}
                  </p>
                  <p className="text-xs text-gray-400">{h.category}</p>
                </div>
                {h.currentStreak > 0 && (
                  <span className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-50 dark:bg-amber-900/30 px-2 py-1 rounded-full shrink-0">
                    <Flame size={12} /> {h.currentStreak}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
