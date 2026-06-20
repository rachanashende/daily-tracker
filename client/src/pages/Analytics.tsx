import { useEffect, useState } from "react";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import "../utils/chartSetup";
import { analyticsApi } from "../api/endpoints";
import { formatShortDate, minutesToHM } from "../utils/format";
import StatCard from "../components/StatCard";
import ProgressBar from "../components/ProgressBar";
import { Flame, BookOpen, CheckCircle2, Award } from "lucide-react";

const FONT = { family: "Quicksand, sans-serif", weight: 600 as const };

const baseOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { labels: { font: FONT, color: "#9d6b8b" } },
  },
  scales: {
    x: { ticks: { font: FONT, color: "#b08ff8" }, grid: { display: false } },
    y: { ticks: { font: FONT, color: "#b08ff8" }, grid: { color: "#fde2f3" } },
  },
};

export default function Analytics() {
  const [habitData, setHabitData] = useState<any>(null);
  const [studyData, setStudyData] = useState<any>(null);
  const [prodData, setProdData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([analyticsApi.habits(), analyticsApi.study(), analyticsApi.productivity()]).then(
      ([h, s, p]) => {
        setHabitData(h.data);
        setStudyData(s.data);
        setProdData(p.data);
        setLoading(false);
      }
    );
  }, []);

  if (loading) return <div className="text-center py-20 text-4xl animate-float">📊</div>;

  const consistencyChart = {
    labels: habitData.monthlyConsistency.map((d: any) => formatShortDate(d.date)),
    datasets: [
      {
        label: "Habit consistency %",
        data: habitData.monthlyConsistency.map((d: any) => d.rate),
        borderColor: "#f4548a",
        backgroundColor: "rgba(244,84,138,0.15)",
        fill: true,
        tension: 0.4,
        pointRadius: 0,
      },
    ],
  };

  const studyTrendChart = {
    labels: studyData.weeklyTrend.map((d: any) => formatShortDate(d.date)),
    datasets: [
      {
        label: "Minutes studied",
        data: studyData.weeklyTrend.map((d: any) => d.minutes),
        backgroundColor: "#b08ff8",
        borderRadius: 8,
      },
    ],
  };

  const monthlyStudyChart = {
    labels: studyData.monthlyTrend.map((d: any) => formatShortDate(d.date)),
    datasets: [
      {
        label: "Minutes studied",
        data: studyData.monthlyTrend.map((d: any) => d.minutes),
        borderColor: "#9966f0",
        backgroundColor: "rgba(153,102,240,0.12)",
        fill: true,
        tension: 0.35,
        pointRadius: 0,
      },
    ],
  };

  const subjectLabels = Object.keys(studyData.bySubject);
  const subjectChart = {
    labels: subjectLabels,
    datasets: [
      {
        data: Object.values(studyData.bySubject),
        backgroundColor: ["#fda4c0", "#b08ff8", "#bae6fd", "#fde68a", "#bbf7d0", "#fecdd3"],
        borderWidth: 0,
      },
    ],
  };

  const taskPriorityChart = {
    labels: ["Low", "Medium", "High"],
    datasets: [
      {
        data: [prodData.tasksByPriority.Low, prodData.tasksByPriority.Medium, prodData.tasksByPriority.High],
        backgroundColor: ["#bbf7d0", "#fde68a", "#fda4c0"],
        borderWidth: 0,
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Productivity score hero */}
      <div className="card animate-slide-up bg-gradient-to-r from-blush-100 via-cream-100 to-lavender-100 dark:from-blush-900/30 dark:via-lavender-900/20 dark:to-lavender-900/30">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-300">Overall Productivity Score</p>
            <p className="text-5xl font-extrabold text-blush-500 mt-1">{prodData.productivityScore}%</p>
            <p className="text-xs text-gray-400 mt-1">Based on habits, tasks &amp; goals combined ✨</p>
          </div>
          <Award size={64} className="text-lavender-400 animate-float" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={<Flame size={18} />} label="Habit consistency" value={`${prodData.habitConsistencyRate}%`} accent="from-amber-300 to-blush-300" />
        <StatCard icon={<CheckCircle2 size={18} />} label="Task completion" value={`${prodData.taskCompletionRate}%`} accent="from-emerald-300 to-lavender-300" />
        <StatCard icon={<BookOpen size={18} />} label="Total study sessions" value={studyData.totalSessions} accent="from-lavender-400 to-purple-300" />
      </div>

      {/* Habit Analytics */}
      <div>
        <h3 className="font-bold text-gray-700 dark:text-gray-100 mb-3">🌸 Habit Analytics</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="card h-72">
            <p className="text-sm font-semibold text-gray-500 mb-2">30-Day Consistency Trend</p>
            <div className="h-56">
              <Line data={consistencyChart} options={baseOptions} />
            </div>
          </div>
          <div className="card">
            <p className="text-sm font-semibold text-gray-500 mb-3">Streaks &amp; Completion Rate</p>
            <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
              {habitData.habitStats.map((h: any) => (
                <div key={h.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-600 dark:text-gray-200">
                      {h.icon} {h.name}
                    </span>
                    <span className="text-xs text-amber-500 font-bold flex items-center gap-1">
                      <Flame size={11} /> {h.currentStreak}
                    </span>
                  </div>
                  <ProgressBar value={h.completionRate} colorFrom={h.color} colorTo="#b08ff8" height="h-2" />
                </div>
              ))}
              {habitData.habitStats.length === 0 && <p className="text-sm text-gray-400 text-center py-6">No habits yet.</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Study Analytics */}
      <div>
        <h3 className="font-bold text-gray-700 dark:text-gray-100 mb-3">📚 Study Analytics</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="card h-72">
            <p className="text-sm font-semibold text-gray-500 mb-2">Weekly Study Trend</p>
            <div className="h-56">
              <Bar data={studyTrendChart} options={baseOptions} />
            </div>
          </div>
          <div className="card h-72">
            <p className="text-sm font-semibold text-gray-500 mb-2">Study Hours by Subject</p>
            <div className="h-56 flex items-center justify-center">
              {subjectLabels.length > 0 ? (
                <Doughnut data={subjectChart} options={{ ...baseOptions, scales: undefined as any }} />
              ) : (
                <p className="text-sm text-gray-400">No study data yet.</p>
              )}
            </div>
          </div>
          <div className="card h-72 lg:col-span-2">
            <p className="text-sm font-semibold text-gray-500 mb-2">Monthly Study Trend (30 days)</p>
            <div className="h-56">
              <Line data={monthlyStudyChart} options={baseOptions} />
            </div>
          </div>
        </div>
      </div>

      {/* Productivity Analytics */}
      <div>
        <h3 className="font-bold text-gray-700 dark:text-gray-100 mb-3">🎯 Productivity Analytics</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="card h-72">
            <p className="text-sm font-semibold text-gray-500 mb-2">Tasks by Priority</p>
            <div className="h-56 flex items-center justify-center">
              <Doughnut data={taskPriorityChart} options={{ ...baseOptions, scales: undefined as any }} />
            </div>
          </div>
          <div className="card">
            <p className="text-sm font-semibold text-gray-500 mb-3">Goals Progress</p>
            <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
              {prodData.goalsProgress.map((g: any) => (
                <div key={g.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-600 dark:text-gray-200 truncate">
                      {g.type === "long" ? "🌳" : "🌱"} {g.title}
                    </span>
                    <span className="text-gray-400">{g.progress}%</span>
                  </div>
                  <ProgressBar value={g.progress} />
                </div>
              ))}
              {prodData.goalsProgress.length === 0 && <p className="text-sm text-gray-400 text-center py-6">No goals yet.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
