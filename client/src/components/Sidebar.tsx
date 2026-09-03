import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Sparkles,
  BookOpen,
  CheckSquare,
  Target,
  BarChart3,
  CalendarDays,
  Timer,
  NotebookPen,
  StickyNote,
  Settings,
  LogOut,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/habits", label: "Habits", icon: Sparkles },
  { to: "/study", label: "Study", icon: BookOpen },
  { to: "/tasks", label: "Tasks", icon: CheckSquare },
  { to: "/goals", label: "Goals", icon: Target },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/calendar", label: "Calendar", icon: CalendarDays },
  { to: "/pomodoro", label: "Pomodoro", icon: Timer },
  { to: "/journal", label: "Journal", icon: NotebookPen },
  { to: "/notes", label: "Notes", icon: StickyNote },
  { to: "/settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export default function Sidebar({ mobileOpen, onCloseMobile }: SidebarProps) {
  const { user, logout } = useAuth();

  const content = (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-5 pt-6 pb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌸</span>
          <span className="font-display font-extrabold text-lg text-gray-700 dark:text-gray-50">
            Daily<span className="text-blush-500">Tracker</span>
          </span>
        </div>
        <button onClick={onCloseMobile} className="btn-icon lg:hidden">
          <X size={18} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onCloseMobile}
            className={({ isActive }) => `pill-nav-item ${isActive ? "active" : ""}`}
          >
            <item.icon size={19} />
            <span className="text-sm">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-blush-100 dark:border-lavender-800/60">
        <div className="flex items-center gap-3 px-2 mb-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blush-300 to-lavender-300 flex items-center justify-center text-white font-bold text-sm shrink-0">
            {user?.name?.[0]?.toUpperCase() || "🌸"}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-100 truncate">{user?.name}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 justify-center text-sm font-medium text-blush-500 hover:bg-blush-50 dark:hover:bg-lavender-900/40 rounded-2xl py-2 transition-colors"
        >
          <LogOut size={16} /> Log out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 h-screen sticky top-0 bg-white/70 dark:bg-[#1d1529]/70 backdrop-blur-sm border-r border-blush-100 dark:border-lavender-900/40">
        {content}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onCloseMobile} />
          <aside className="absolute left-0 top-0 h-full w-72 bg-white dark:bg-[#1d1529] shadow-soft-lg animate-slide-up">
            {content}
          </aside>
        </div>
      )}
    </>
  );
}
