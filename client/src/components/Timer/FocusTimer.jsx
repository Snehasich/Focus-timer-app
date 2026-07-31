import { useState, useRef, useEffect } from "react";
import { RotateCcw, Play, Pause } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useTimer } from "../../context/TimerContext";

// ── All dimensions kept in SVG units (viewBox). Container uses clamp CSS.
const RADIUS = 118;
const STROKE = 8;
const SIZE = 290; // viewBox reference size
const CENTER = SIZE / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const FocusTimer = () => {
  const alarmRef = useRef(null);
  const { theme } = useTheme();
  const {
    focusInitialTime: initialTime,
    focusTime: time,
    setFocusTime: setTime,
    isFocusRunning: isRunning,
    setIsFocusRunning: setIsRunning,
    focusStartedAt: startedAt,
    setFocusStartedAt: setStartedAt,
    focusLoop,
    setFocusLoop,
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

  const progress   = time / initialTime;           // 1 → 0
  const dashOffset = CIRCUMFERENCE * (1 - progress); // 0 → full

  // Dot position on the ring
  const angle  = -90 + 360 * (1 - progress);
  const dotX   = CENTER + RADIUS * Math.cos((angle * Math.PI) / 180);
  const dotY   = CENTER + RADIUS * Math.sin((angle * Math.PI) / 180);

  const isLight = theme === "light";

  return (
    <>
      <style>{`
        @keyframes spin        { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes rotateRing  { from{transform:rotate(-90deg)} to{transform:rotate(270deg)} }
        @keyframes pulseGlow   {
          0%,100% { box-shadow: 0 0 0 0px rgba(59,130,246,0.3); }
          50%     { box-shadow: 0 0 0 8px rgba(59,130,246,0); }
        }
        @keyframes tickBounce {
          0%,100% { transform: scale(1); }
          50%     { transform: scale(1.02); }
        }
        @keyframes mountIn {
          from { opacity:0; transform: scale(0.92); }
          to   { opacity:1; transform: scale(1); }
        }
        @keyframes loopPop {
          0%   { transform: scale(1); }
          40%  { transform: scale(1.15); }
          100% { transform: scale(1); }
        }
        .focus-ring-wrap { transform-origin: center; }
        .focus-timer-mount { animation: mountIn 0.45s cubic-bezier(0.22,1,0.36,1) forwards; }
        .tick-active { animation: tickBounce 1s ease-in-out infinite; }
        .loop-pop    { animation: loopPop 0.4s cubic-bezier(0.22,1,0.36,1); }
        .btn-pulse   { animation: pulseGlow 0.3s ease; }
        .ctrl-btn {
          display:flex; align-items:center; gap:7px;
          padding: 10px 20px; border-radius: 50px; border: none;
          font-weight: 600; font-size: 0.87rem; cursor: pointer;
          outline: none; min-height: 44px;
          transition: transform 0.15s ease, filter 0.15s ease;
        }
        .ctrl-btn:hover  { transform: translateY(-1px); filter: brightness(1.1); }
        .ctrl-btn:active { transform: scale(0.95); }
      `}</style>

      <div
        className={mounted ? "focus-timer-mount" : ""}
        style={{ display:"flex", flexDirection:"column", alignItems:"center", gap: 16, opacity: mounted ? undefined : 0 }}
      >
        {/* ── SVG Ring — responsive via viewBox ── */}
        <div style={{
          position: "relative",
          width: "clamp(180px, 45vmin, 290px)",
          height: "clamp(180px, 45vmin, 290px)",
        }}>
          <svg
            viewBox={`0 0 ${SIZE} ${SIZE}`}
            width="100%" height="100%"
            style={{ overflow: "visible", display: "block" }}
          >
            <defs>
              <linearGradient id="focusGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%"   stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#2563eb" />
              </linearGradient>
            </defs>

            {/* Background track */}
            <circle
              cx={CENTER} cy={CENTER} r={RADIUS}
              fill="none"
              stroke={isLight ? "#e5e7eb" : "#1a1a2e"}
              strokeWidth={STROKE}
            />

            {/* Main progress arc */}
            <circle
              cx={CENTER} cy={CENTER} r={RADIUS}
              fill="none"
              stroke="url(#focusGrad)"
              strokeWidth={STROKE}
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
              transform={`rotate(-90 ${CENTER} ${CENTER})`}
              style={{ transition: "stroke-dashoffset 1s linear" }}
            />

            {/* Leading dot */}
            {(isRunning || time < initialTime) && (
              <circle
                cx={dotX} cy={dotY} r={5}
                fill="#3b82f6"
              />
            )}
          </svg>

          {/* Center text */}
          <div style={{
            position:"absolute", inset:0,
            display:"flex", flexDirection:"column",
            alignItems:"center", justifyContent:"center",
            gap: 4,
          }}>
            <span
              className={isRunning ? "tick-active" : ""}
              style={{
                fontSize: "3rem",
                fontWeight: 800,
                color: isLight ? "#111827" : "#e8e8ff",
                letterSpacing: "-2px",
                fontVariantNumeric: "tabular-nums",
                lineHeight: 1,
                transform: btnPulse ? "scale(0.93)" : "scale(1)",
                transition: "transform 0.15s ease",
              }}
            >
              {formatTime()}
            </span>
            <span style={{
              fontSize: "0.72rem",
              color: isRunning ? "#3b82f6" : (isLight ? "#6B7280" : "#444"),
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              fontWeight: 600,
              transition: "color 0.3s ease",
            }}>
              {isRunning ? "focusing" : time < initialTime ? "paused" : "ready"}
            </span>
          </div>
        </div>

        {/* Focus loops badge */}
        {focusLoop > 0 && (
          <div
            key={focusLoop}
            className="loop-pop"
            style={{
              display:"flex", alignItems:"center", gap:6,
              background: isLight ? "rgba(59,130,246,0.06)" : "rgba(59,130,246,0.1)",
              border: isLight ? "1px solid rgba(59,130,246,0.15)" : "1px solid rgba(59,130,246,0.2)",
              borderRadius:20, padding:"3px 12px",
            }}
          >
            <span style={{ fontSize:"0.75rem", color: isLight ? "#2563eb" : "#60a5fa", fontWeight:600 }}>
              🔁 {focusLoop} session{focusLoop > 1 ? "s" : ""} done
            </span>
          </div>
        )}

        {/* Controls */}
        <div style={{ display:"flex", gap:10 }}>
          <button
            className={`ctrl-btn${btnPulse ? " btn-pulse" : ""}`}
            onClick={handleStartPause}
            style={{
              background: isRunning
                ? (isLight ? "rgba(59,130,246,0.06)" : "rgba(59,130,246,0.15)")
                : "linear-gradient(135deg,#3b82f6,#2563eb)",
              color: isRunning ? (isLight ? "#3B82F6" : "#fff") : "#fff",
              border: isRunning 
                ? (isLight ? "1px solid rgba(59,130,246,0.15)" : "1px solid rgba(59,130,246,0.3)") 
                : (isLight ? "none" : "1px solid rgba(0,0,0,0.4)"),
              boxShadow: isRunning 
                ? "none" 
                : (isLight ? "0 4px 10px rgba(59,130,246,0.15)" : "inset 0 1px 0 rgba(255,255,255,0.22), 0 4px 12px rgba(0,0,0,0.35)"),
            }}
          >
            {isRunning ? <Pause size={15}/> : <Play size={15}/>}
            {isRunning ? "Pause" : "Start"}
          </button>

          <button
            className="ctrl-btn"
            onClick={handleReset}
            style={{
              background: isLight ? "#fee2e2" : "rgba(239,68,68,0.08)",
              color: "#EF4444",
              border: isLight ? "1px solid #fca5a5" : "1px solid rgba(239,68,68,0.2)",
              boxShadow: isLight
                ? "none"
                : "inset 0 1px 0 rgba(255,255,255,0.02), 0 2px 6px rgba(0,0,0,0.15)",
            }}
          >
            <RotateCcw size={14}/>
            Reset
          </button>
        </div>
      </div>
    </>
  );
};

export default FocusTimer;