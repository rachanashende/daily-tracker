interface ProgressBarProps {
  value: number; // 0-100
  colorFrom?: string;
  colorTo?: string;
  height?: string;
  showLabel?: boolean;
}

export default function ProgressBar({
  value,
  colorFrom = "#fb7aa3",
  colorTo = "#b08ff8",
  height = "h-2.5",
  showLabel = false,
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className="w-full">
      <div className={`w-full bg-blush-50 dark:bg-lavender-950/50 rounded-full overflow-hidden ${height}`}>
        <div
          className="progress-fill h-full rounded-full"
          style={{
            width: `${clamped}%`,
            background: `linear-gradient(90deg, ${colorFrom}, ${colorTo})`,
          }}
        />
      </div>
      {showLabel && <p className="text-xs text-gray-500 mt-1 font-medium">{clamped}% complete</p>}
    </div>
  );
}
