import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, BookOpen, CheckSquare, Target, Sparkles } from "lucide-react";
import { calendarApi } from "../api/endpoints";
import { todayISO } from "../utils/format";

function getMonthLabel(month: string) {
  const [y, m] = month.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function buildGrid(month: string) {
  const [y, m] = month.split("-").map(Number);
  const firstDay = new Date(y, m - 1, 1);
  const daysInMonth = new Date(y, m, 0).getDate();
  const startWeekday = firstDay.getDay();

  const cells: (string | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(`${month}-${String(d).padStart(2, "0")}`);
  }
  return cells;
}

export default function CalendarPage() {
  const [month, setMonth] = useState(todayISO().slice(0, 7));
  const [days, setDays] = useState<Record<string, any>>({});
  const [selected, setSelected] = useState<string>(todayISO());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    calendarApi.get(month).then((res) => {
      setDays(res.data.days);
      setLoading(false);
    });
  }, [month]);

  function changeMonth(delta: number) {
    const [y, m] = month.split("-").map(Number);
    const d = new Date(y, m - 1 + delta, 1);
    setMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }

  const cells = buildGrid(month);
  const selectedData = days[selected];
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2 card animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => changeMonth(-1)} className="btn-icon">
            <ChevronLeft size={18} />
          </button>
          <h3 className="font-bold text-gray-700 dark:text-gray-100">{getMonthLabel(month)}</h3>
          <button onClick={() => changeMonth(1)} className="btn-icon">
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-gray-400 mb-2">
          {weekDays.map((w) => (
            <div key={w}>{w}</div>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-10 text-3xl animate-float">🗓️</div>
        ) : (
          <div className="grid grid-cols-7 gap-1">
            {cells.map((date, i) => {
              if (!date) return <div key={i} />;
              const dayNum = parseInt(date.slice(-2));
              const data = days[date];
              const hasActivity = data && (data.habits.length || data.studySessions.length || data.tasks.length || data.goals.length);
              const isToday = date === todayISO();
              const isSelected = date === selected;

              return (
                <button
                  key={date}
                  onClick={() => setSelected(date)}
                  className={`aspect-square rounded-xl text-sm font-semibold flex flex-col items-center justify-center gap-0.5 transition-all
                    ${isSelected ? "bg-gradient-to-br from-blush-400 to-lavender-400 text-white shadow-soft" : "hover:bg-blush-50 dark:hover:bg-lavender-900/40"}
                    ${isToday && !isSelected ? "ring-2 ring-blush-300" : ""}
                  `}
                >
                  <span className={isSelected ? "text-white" : "text-gray-600 dark:text-gray-200"}>{dayNum}</span>
                  {hasActivity && !isSelected && <span className="w-1.5 h-1.5 rounded-full bg-blush-400" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="card animate-slide-up">
        <h3 className="font-bold text-gray-700 dark:text-gray-100 mb-1">
          {new Date(selected + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
        </h3>
        <p className="text-xs text-gray-400 mb-4">Everything that happened this day</p>

        {!selectedData ||
        (!selectedData.habits.length && !selectedData.studySessions.length && !selectedData.tasks.length && !selectedData.goals.length) ? (
          <p className="text-sm text-gray-400 text-center py-8">No activity logged for this day 🌸</p>
        ) : (
          <div className="space-y-4">
            {selectedData.habits.length > 0 && (
              <div>
                <p className="text-xs font-bold text-blush-500 mb-1.5 flex items-center gap-1">
                  <Sparkles size={12} /> Habits
                </p>
                <div className="space-y-1.5">
                  {selectedData.habits.map((h: any) => (
                    <div key={h.id} className="text-sm flex items-center gap-2 bg-blush-50/60 dark:bg-lavender-950/30 rounded-xl px-2.5 py-1.5">
                      <span>{h.icon}</span>
                      <span className="text-gray-600 dark:text-gray-200">{h.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedData.studySessions.length > 0 && (
              <div>
                <p className="text-xs font-bold text-lavender-500 mb-1.5 flex items-center gap-1">
                  <BookOpen size={12} /> Study Sessions
                </p>
                <div className="space-y-1.5">
                  {selectedData.studySessions.map((s: any) => (
                    <div key={s.id} className="text-sm bg-lavender-50/60 dark:bg-lavender-950/30 rounded-xl px-2.5 py-1.5">
                      <span className="font-medium text-gray-600 dark:text-gray-200">{s.subject}</span>
                      <span className="text-gray-400"> · {s.duration}min</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedData.tasks.length > 0 && (
              <div>
                <p className="text-xs font-bold text-amber-500 mb-1.5 flex items-center gap-1">
                  <CheckSquare size={12} /> Tasks Due
                </p>
                <div className="space-y-1.5">
                  {selectedData.tasks.map((t: any) => (
                    <div key={t.id} className="text-sm bg-amber-50/60 dark:bg-amber-950/20 rounded-xl px-2.5 py-1.5 text-gray-600 dark:text-gray-200">
                      {t.title}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedData.goals.length > 0 && (
              <div>
                <p className="text-xs font-bold text-emerald-500 mb-1.5 flex items-center gap-1">
                  <Target size={12} /> Goal Deadlines
                </p>
                <div className="space-y-1.5">
                  {selectedData.goals.map((g: any) => (
                    <div key={g.id} className="text-sm bg-emerald-50/60 dark:bg-emerald-950/20 rounded-xl px-2.5 py-1.5 text-gray-600 dark:text-gray-200">
                      {g.title} ({g.progress}%)
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
