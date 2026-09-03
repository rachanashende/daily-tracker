import { ReactNode } from "react";

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  sublabel?: string;
  accent?: string; // tailwind gradient classes
}

export default function StatCard({ icon, label, value, sublabel, accent = "from-blush-400 to-lavender-400" }: StatCardProps) {
  return (
    <div className="card card-hover animate-slide-up">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
          <p className="text-3xl font-extrabold mt-1 text-gray-700 dark:text-gray-50">{value}</p>
          {sublabel && <p className="text-xs text-gray-400 mt-1">{sublabel}</p>}
        </div>
        <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${accent} flex items-center justify-center text-white shadow-soft shrink-0`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
