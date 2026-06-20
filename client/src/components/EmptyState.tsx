import { ReactNode } from "react";

interface EmptyStateProps {
  emoji?: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export default function EmptyState({ emoji = "🌸", title, subtitle, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-6 animate-fade-in">
      <div className="text-5xl mb-3 animate-float">{emoji}</div>
      <h3 className="font-bold text-gray-600 dark:text-gray-200 text-lg">{title}</h3>
      {subtitle && <p className="text-sm text-gray-400 mt-1 max-w-xs">{subtitle}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
