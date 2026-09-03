import { useEffect, useState, useRef } from "react";
import { Menu, Moon, Sun, Bell } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { notificationsApi } from "../api/endpoints";
import type { NotificationItem } from "../types";

interface HeaderProps {
  onMenuClick: () => void;
  title: string;
}

export default function Header({ onMenuClick, title }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showPanel, setShowPanel] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    notificationsApi
      .list()
      .then((res) => setNotifications(res.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setShowPanel(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const urgentCount = notifications.filter((n) => n.severity === "urgent").length;

  return (
    <header className="sticky top-0 z-30 bg-white/70 dark:bg-[#1d1529]/70 backdrop-blur-md border-b border-blush-100 dark:border-lavender-900/40 px-4 sm:px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="btn-icon lg:hidden">
          <Menu size={20} />
        </button>
        <h1 className="font-display font-bold text-lg sm:text-xl text-gray-700 dark:text-gray-50">{title}</h1>
      </div>

      <div className="flex items-center gap-2 relative">
        <button onClick={toggleTheme} className="btn-icon" title="Toggle theme">
          {theme === "light" ? <Moon size={19} /> : <Sun size={19} />}
        </button>

        <div ref={panelRef} className="relative">
          <button onClick={() => setShowPanel((s) => !s)} className="btn-icon relative" title="Notifications">
            <Bell size={19} />
            {notifications.length > 0 && (
              <span
                className={`absolute -top-0.5 -right-0.5 w-4 h-4 text-[10px] rounded-full flex items-center justify-center text-white font-bold ${
                  urgentCount > 0 ? "bg-rose-500" : "bg-blush-400"
                }`}
              >
                {notifications.length > 9 ? "9+" : notifications.length}
              </span>
            )}
          </button>

          {showPanel && (
            <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto card shadow-soft-lg animate-slide-up z-50">
              <p className="font-bold text-sm text-gray-600 dark:text-gray-200 mb-2">🔔 Notifications</p>
              {notifications.length === 0 ? (
                <p className="text-sm text-gray-400 py-4 text-center">You're all caught up! 🌸</p>
              ) : (
                <div className="space-y-2">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`text-sm p-2.5 rounded-xl ${
                        n.severity === "urgent"
                          ? "bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-200"
                          : n.severity === "warning"
                          ? "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-200"
                          : "bg-blush-50 text-gray-600 dark:bg-lavender-900/30 dark:text-gray-200"
                      }`}
                    >
                      {n.message}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
