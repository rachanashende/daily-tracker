import { useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw, Coffee, Brain } from "lucide-react";

const MODES = {
  work: { label: "Focus", minutes: 25, color: "#f4548a" },
  shortBreak: { label: "Short Break", minutes: 5, color: "#9966f0" },
  longBreak: { label: "Long Break", minutes: 15, color: "#fbbf24" },
};

type ModeKey = keyof typeof MODES;

export default function Pomodoro() {
  const [mode, setMode] = useState<ModeKey>("work");
  const [secondsLeft, setSecondsLeft] = useState(MODES.work.minutes * 60);
  const [running, setRunning] = useState(false);
  const [cyclesCompleted, setCyclesCompleted] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) {
            handleComplete();
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  function playChime() {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = 880;
      osc.type = "sine";
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.8);
    } catch {
      // audio not available — fail silently
    }
  }

  function handleComplete() {
    setRunning(false);
    playChime();

    if (mode === "work") {
      const newCycles = cyclesCompleted + 1;
      setCyclesCompleted(newCycles);
      const nextMode: ModeKey = newCycles % 4 === 0 ? "longBreak" : "shortBreak";
      switchMode(nextMode);
    } else {
      switchMode("work");
    }
  }

  function switchMode(newMode: ModeKey) {
    setMode(newMode);
    setSecondsLeft(MODES[newMode].minutes * 60);
    setRunning(false);
  }

  function resetTimer() {
    setSecondsLeft(MODES[mode].minutes * 60);
    setRunning(false);
  }

  const totalSeconds = MODES[mode].minutes * 60;
  const progress = ((totalSeconds - secondsLeft) / totalSeconds) * 100;
  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const radius = 110;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      <div className="flex gap-2 bg-white dark:bg-lavender-900/30 p-1.5 rounded-full shadow-soft">
        {(Object.keys(MODES) as ModeKey[]).map((m) => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
              mode === m ? "bg-gradient-to-r from-blush-400 to-lavender-400 text-white shadow-soft" : "text-gray-500 dark:text-gray-300"
            }`}
          >
            {MODES[m].label}
          </button>
        ))}
      </div>

      <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center animate-pop">
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 240 240">
          <circle cx="120" cy="120" r={radius} fill="none" stroke="#fde2f3" strokeWidth="14" className="dark:opacity-20" />
          <circle
            cx="120"
            cy="120"
            r={radius}
            fill="none"
            stroke={MODES[mode].color}
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - (progress / 100) * circumference}
            className="progress-fill"
          />
        </svg>
        <div className="text-center z-10">
          <p className="text-5xl sm:text-6xl font-extrabold text-gray-700 dark:text-gray-50 font-display">
            {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
          </p>
          <p className="text-sm text-gray-400 mt-2 flex items-center justify-center gap-1.5">
            {mode === "work" ? <Brain size={14} /> : <Coffee size={14} />}
            {MODES[mode].label} time
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button onClick={resetTimer} className="btn-icon w-12 h-12 bg-white dark:bg-lavender-900/30 shadow-soft">
          <RotateCcw size={18} />
        </button>
        <button
          onClick={() => setRunning((r) => !r)}
          className="w-16 h-16 rounded-full bg-gradient-to-r from-blush-400 to-lavender-400 text-white flex items-center justify-center shadow-soft-lg hover:scale-105 active:scale-95 transition-transform"
        >
          {running ? <Pause size={24} /> : <Play size={24} />}
        </button>
        <div className="w-12 h-12" /> {/* spacer for symmetry */}
      </div>

      <div className="card text-center">
        <p className="text-sm text-gray-500 dark:text-gray-300">
          🍅 Pomodoros completed today: <span className="font-bold text-blush-500">{cyclesCompleted}</span>
        </p>
        <p className="text-xs text-gray-400 mt-1">Every 4th focus session earns a long break ✨</p>
      </div>
    </div>
  );
}
