import { useEffect, useState } from "react";
import { Download, Database, Moon, Sun, Bell } from "lucide-react";
import { settingsApi, exportApi } from "../api/endpoints";
import { useTheme } from "../context/ThemeContext";
import type { UserSettings } from "../types";

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    settingsApi.get().then((res) => {
      setSettings(res.data);
      setLoading(false);
    });
  }, []);

  async function updateSetting(key: string, value: any) {
    if (!settings) return;
    const updated = { ...settings, [key]: value };
    setSettings(updated as UserSettings);
    await settingsApi.update({ [key]: value });
  }

  function downloadFile(url: string) {
    const token = localStorage.getItem("dt_token");
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.blob())
      .then((blob) => {
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = url.includes("backup") ? "daily_tracker_backup.json" : "export.csv";
        link.click();
      });
  }

  if (loading) return <div className="text-center py-20 text-4xl animate-float">⚙️</div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="card animate-slide-up">
        <h3 className="font-bold text-gray-700 dark:text-gray-100 mb-4 flex items-center gap-2">
          {theme === "light" ? <Sun size={17} /> : <Moon size={17} />} Appearance
        </h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-sm text-gray-600 dark:text-gray-200">Dark mode</p>
            <p className="text-xs text-gray-400">Easier on the eyes at night 🌙</p>
          </div>
          <button
            onClick={toggleTheme}
            className={`w-14 h-8 rounded-full p-1 transition-colors ${theme === "dark" ? "bg-lavender-500" : "bg-blush-200"}`}
          >
            <div
              className={`w-6 h-6 rounded-full bg-white shadow-soft transition-transform ${theme === "dark" ? "translate-x-6" : ""}`}
            />
          </button>
        </div>
      </div>

      <div className="card animate-slide-up">
        <h3 className="font-bold text-gray-700 dark:text-gray-100 mb-4 flex items-center gap-2">
          <Bell size={17} /> Notifications
        </h3>
        <div className="space-y-4">
          {[
            { key: "dailyReminder", label: "Daily reminder", sub: "Remind me to log habits & study" },
            { key: "deadlineReminders", label: "Deadline reminders", sub: "Alert me about upcoming due dates" },
            { key: "missedHabitAlerts", label: "Missed habit alerts", sub: "Notify me if I miss a habit" },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm text-gray-600 dark:text-gray-200">{item.label}</p>
                <p className="text-xs text-gray-400">{item.sub}</p>
              </div>
              <button
                onClick={() => updateSetting(item.key, !(settings as any)?.[item.key])}
                className={`w-14 h-8 rounded-full p-1 transition-colors ${
                  (settings as any)?.[item.key] ? "bg-blush-400" : "bg-gray-200 dark:bg-gray-700"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full bg-white shadow-soft transition-transform ${
                    (settings as any)?.[item.key] ? "translate-x-6" : ""
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="card animate-slide-up">
        <h3 className="font-bold text-gray-700 dark:text-gray-100 mb-4 flex items-center gap-2">
          <Download size={17} /> Export Data (CSV)
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {["habits", "study", "tasks", "goals"].map((type) => (
            <button key={type} onClick={() => downloadFile(exportApi.csvUrl(type))} className="btn-secondary text-sm capitalize">
              {type}.csv
            </button>
          ))}
        </div>
      </div>

      <div className="card animate-slide-up">
        <h3 className="font-bold text-gray-700 dark:text-gray-100 mb-4 flex items-center gap-2">
          <Database size={17} /> Backup
        </h3>
        <p className="text-sm text-gray-400 mb-3">Download a full JSON backup of all your data — habits, study sessions, tasks, goals, journal, and notes.</p>
        <button onClick={() => downloadFile(exportApi.backupUrl())} className="btn-primary text-sm">
          Download full backup
        </button>
      </div>
    </div>
  );
}
