import { useState, useRef, useEffect } from "react";
import { RotateCcw, Play, Pause } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useTimer } from "../../context/TimerContext";

const RADIUS = 118;
const SIZE = 290;
const CENTER = SIZE / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const BreakTimer = () => {
  const alarmRef = useRef(null);
  const { theme } = useTheme();
  const {
    breakInitialTime: initialTime,
    setBreakInitialTime,
    breakTime: time,
    setBreakTime: setTime,
    isBreakRunning: isRunning,
    setIsBreakRunning: setIsRunning,
    breakStartedAt: startedAt,
    setBreakStartedAt: setStartedAt,
    breakLoop,
  } = useTimer();

  const [btnPulse, setBtnPulse] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    alarmRef.current = new Audio("/alarm.mp3");
    setTimeout(() => setMounted(true), 60);
  }, []);

  const handleStartPause = () => {
    setBtnPulse(true);
    setTimeout(() => setBtnPulse(false), 300);
    if (isRunning) {
      setIsRunning(false);
      setStartedAt(null);
    } else {
      setStartedAt(Date.now() - (initialTime - time) * 1000);
      setIsRunning(true);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setTime(initialTime);
    setStartedAt(null);
  };

  const formatTime = () => {
    const m = String(Math.floor(time / 60)).padStart(2, "0");
    const s = String(time % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  const progress   = time / initialTime;
  const dashOffset = CIRCUMFERENCE * (1 - progress);

  const angle = -90 + 360 * (1 - progress);
  const dotX  = CENTER + RADIUS * Math.cos((angle * Math.PI) / 180);
  const dotY  = CENTER + RADIUS * Math.sin((angle * Math.PI) / 180);

  const isLight = theme === "light";

  return (
    <div
      className={`flex flex-col items-center gap-3.5 transition-all duration-500 ${
        mounted ? "opacity-100 scale-100" : "opacity-0 scale-95"
      }`}
    >
      {/* ── SVG Ring ── */}
      <div className="relative w-[clamp(180px,45vmin,290px)] h-[clamp(180px,45vmin,290px)]">
        <svg
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="w-full h-full block overflow-visible"
        >
          <defs>
            <linearGradient id="breakGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"   stopColor="#10b981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <filter id="emeraldGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#10b981" floodOpacity="0.8" />
            </filter>
          </defs>

          {/* Track */}
          <circle
            cx={CENTER} cy={CENTER} r={RADIUS}
            fill="none"
            stroke={isLight ? "#e2e8f0" : "#122a22"}
            strokeWidth={9}
          />

          {/* Progress Arc */}
          <circle
            cx={CENTER} cy={CENTER} r={RADIUS}
            fill="none"
            stroke="#10b981"
            strokeWidth={9}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            transform={`rotate(-90 ${CENTER} ${CENTER})`}
            filter="url(#emeraldGlow)"
            className="transition-[stroke-dashoffset] duration-1000 ease-linear"
          />

          {/* Dot */}
          {(isRunning || time < initialTime) && (
            <circle
              cx={dotX} cy={dotY} r={6}
              fill="#34d399"
              style={{ filter: "drop-shadow(0 0 6px #10b981)" }}
            />
          )}
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
          <span
            className={`text-5xl font-extrabold tracking-tight tabular-nums leading-none transition-transform duration-150 ${
              isRunning ? "animate-pulse" : ""
            } ${btnPulse ? "scale-95" : "scale-100"} ${
              isLight ? "text-gray-900" : "text-[#e8f8f0]"
            }`}
          >
            {formatTime()}
          </span>
          <span
            className={`text-[11px] font-bold tracking-widest uppercase transition-colors duration-300 ${
              isRunning ? "text-emerald-500" : isLight ? "text-slate-500" : "text-zinc-600"
            }`}
          >
            {isRunning ? "resting" : time < initialTime ? "paused" : "break time"}
          </span>
        </div>
      </div>

      {/* Break loops badge */}
      {breakLoop > 0 && (
        <div
          key={breakLoop}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border animate-in zoom-in-95 ${
            isLight 
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600" 
              : "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
          }`}
        >
          <span>☕ {breakLoop} break{breakLoop > 1 ? "s" : ""} done</span>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={handleStartPause}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-sm cursor-pointer transition-all duration-150 hover:-translate-y-0.5 active:scale-95 border min-h-[44px] ${
            isRunning
              ? isLight
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600"
                : "bg-emerald-500/15 border-emerald-500/30 text-white"
              : "bg-gradient-to-r from-emerald-500 to-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-500/30"
          }`}
        >
          {isRunning ? <Pause size={15}/> : <Play size={15}/>}
          {isRunning ? "Pause" : "Start"}
        </button>

        <button
          onClick={handleReset}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm cursor-pointer transition-all duration-150 hover:-translate-y-0.5 active:scale-95 border min-h-[44px] ${
            isLight
              ? "bg-red-50 border-red-200 text-red-600 hover:bg-red-100"
              : "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20"
          }`}
        >
          <RotateCcw size={15} />
          Reset
        </button>
      </div>
    </div>
  );
};

export default BreakTimer;