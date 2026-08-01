import { useState, useEffect, useRef, memo, useMemo } from "react";
import { RotateCcw, Play, Pause, Flag, Trophy, Timer } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useTimer } from "../../context/TimerContext";

export const StopWatch = memo(() => {
  const { theme } = useTheme();
  const {
    isStopWatchRunning: isRunning,
    setIsStopWatchRunning: setIsRunning,
    stopWatchStartTime: startTime,
    setStopWatchStartTime: setStartTime,
    stopWatchPausedTime: pausedTime,
    setStopWatchPausedTime: setPausedTime,
    stopWatchLaps: laps,
    setStopWatchLaps: setLaps,
    stopWatchTime: time,
    setStopWatchTime: setTime,
  } = useTimer();

  const [mounted, setMounted] = useState(false);
  const requestRef = useRef(null);

  useEffect(() => {
    setTimeout(() => setMounted(true), 60);
    return () => cancelAnimationFrame(requestRef.current);
  }, []);

  const updateTimer = () => {
    if (startTime !== null) {
      const now = Date.now();
      const elapsed = now - startTime + pausedTime;
      setTime(elapsed);
    }
    requestRef.current = requestAnimationFrame(updateTimer);
  };

  useEffect(() => {
    if (isRunning) {
      requestRef.current = requestAnimationFrame(updateTimer);
    } else {
      cancelAnimationFrame(requestRef.current);
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [isRunning, startTime, pausedTime]);

  const handleStartPause = () => {
    if (isRunning) {
      setIsRunning(false);
      if (startTime) {
        setPausedTime((prev) => prev + (Date.now() - startTime));
      }
      setStartTime(null);
    } else {
      setStartTime(Date.now());
      setIsRunning(true);
    }
  };

  const handleReset = () => {
    cancelAnimationFrame(requestRef.current);
    setTime(0);
    setIsRunning(false);
    setLaps([]);
    setPausedTime(0);
    setStartTime(null);
  };

  const handleLap = () => {
    if (time === 0) return;
    const previousLapTime = laps.length > 0 ? laps[0].timestamp : 0;
    const lapDiff = time - previousLapTime;

    const newLap = {
      id: Date.now(),
      index: laps.length + 1,
      timestamp: time,
      diff: lapDiff,
    };
    setLaps([newLap, ...laps]);
  };

  const formatTime = (ms) => {
    const hours  = String(Math.floor(ms / 3600000)).padStart(2, "0");
    const mins   = String(Math.floor((ms % 3600000) / 60000)).padStart(2, "0");
    const secs   = String(Math.floor((ms % 60000) / 1000)).padStart(2, "0");
    const centis = String(Math.floor((ms % 1000) / 10)).padStart(2, "0");

    return {
      hms: `${hours}:${mins}:${secs}`,
      ms: centis,
    };
  };

  const formatted = formatTime(time);

  // 60-second rotation (360deg per 60,000ms)
  const secondsFraction = (time % 60000) / 60000;

  // Track fastest & slowest laps
  const { fastestId, slowestId } = useMemo(() => {
    if (laps.length < 2) return { fastestId: null, slowestId: null };
    let min = Infinity, max = -1;
    let fId = null, sId = null;
    laps.forEach((l) => {
      if (l.diff < min) { min = l.diff; fId = l.id; }
      if (l.diff > max) { max = l.diff; sId = l.id; }
    });
    return { fastestId: fId, slowestId: sId };
  }, [laps]);

  const isLight = theme === "light";

  const cardStyle = {
    background: isLight ? "#ffffff" : "#111114",
    border: `1px solid ${isLight ? "#e2e8f0" : "#222228"}`,
    borderRadius: 24,
    boxShadow: isLight ? "0 8px 30px rgba(15,23,42,0.04)" : "0 10px 40px rgba(0,0,0,0.5)",
  };

  const SIZE   = 300;
  const CENTER = SIZE / 2;
  const RADIUS = 130;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const strokeDashoffset = CIRCUMFERENCE * (1 - secondsFraction);

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .sw-mount { animation: fadeIn 0.35s cubic-bezier(0.16,1,0.3,1) forwards; }
        
        .sw-btn {
          display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          padding: 11px 22px; border-radius: 50px; border: none;
          font-weight: 700; font-size: 0.88rem; cursor: pointer;
          outline: none; min-height: 44px; min-width: 80px;
          transition: transform 0.15s ease, filter 0.15s ease, box-shadow 0.15s ease;
        }
        .sw-btn:hover { transform: translateY(-1.5px); filter: brightness(1.08); }
        .sw-btn:active { transform: scale(0.96); }
        @media (max-width: 480px) {
          .sw-btn { padding: 11px 18px; font-size: 0.82rem; }
        }

        .lap-item {
          transition: background 0.15s ease;
        }
        .lap-scroll::-webkit-scrollbar { width: 4px; }
        .lap-scroll::-webkit-scrollbar-thumb {
          background: ${isLight ? "#cbd5e1" : "#27272a"};
          border-radius: 4px;
        }
      `}</style>

      <div
        className="sw-mount w-full h-full min-h-[calc(100vh-48px)] flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8"
        style={{
          ...cardStyle,
          opacity: mounted ? 1 : 0,
          boxSizing: "border-box",
          color: isLight ? "#0f172a" : "#ffffff",
        }}
      >
        <div className="w-full max-w-5xl flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-12 my-auto">
          
          {/* ══════════════════════════════════════════
              LEFT: CLEAN DIAL & CONTROLS
          ══════════════════════════════════════════ */}
          <div className="flex flex-col items-center justify-center flex-1 w-full">
            
            {/* Compact Clean Circle Container — scales for mobile */}
            <div className="relative flex items-center justify-center"
              style={{
                width: "clamp(200px, 55vmin, 320px)",
                height: "clamp(200px, 55vmin, 320px)",
                aspectRatio: "1 / 1",
              }}>
              
              <svg
                viewBox={`0 0 ${SIZE} ${SIZE}`}
                width="100%"
                height="100%"
                className="overflow-visible block"
              >
                <defs>
                  <linearGradient id="swProgressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                </defs>

                {/* Outer Track Ring */}
                <circle
                  cx={CENTER} cy={CENTER} r={RADIUS}
                  fill="none"
                  stroke={isLight ? "#e2e8f0" : "#1f1f26"}
                  strokeWidth="4"
                />

                {/* 60 Ticks Dial */}
                {Array.from({ length: 60 }).map((_, i) => {
                  const angle = i * 6;
                  const rad = (angle - 90) * (Math.PI / 180);
                  const isMajor = i % 5 === 0;
                  const tickLen = isMajor ? 10 : 5;
                  const x1 = CENTER + (RADIUS - tickLen) * Math.cos(rad);
                  const y1 = CENTER + (RADIUS - tickLen) * Math.sin(rad);
                  const x2 = CENTER + RADIUS * Math.cos(rad);
                  const y2 = CENTER + RADIUS * Math.sin(rad);
                  return (
                    <line
                      key={i}
                      x1={x1} y1={y1} x2={x2} y2={y2}
                      stroke={isMajor ? (isLight ? "#64748b" : "#475569") : (isLight ? "#cbd5e1" : "#27272a")}
                      strokeWidth={isMajor ? 2 : 1}
                    />
                  );
                })}

                {/* Green Needle / Second Hand */}
                <line
                  x1={CENTER}
                  y1={CENTER}
                  x2={CENTER + (RADIUS - 10) * Math.cos((secondsFraction * 360 - 90) * (Math.PI / 180))}
                  y2={CENTER + (RADIUS - 10) * Math.sin((secondsFraction * 360 - 90) * (Math.PI / 180))}
                  stroke="#10b981"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <circle cx={CENTER} cy={CENTER} r="3.5" fill="#10b981" />
              </svg>

              {/* Digital Time Overlay — Times New Roman Format (Bold, Larger, Shifted +10px down) */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none p-6 box-border"
                style={{ transform: "translateY(10px)" }}>
                <div className="flex items-baseline justify-center gap-0.5" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
                  <span className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight"
                    style={{
                      color: isLight ? "#0f172a" : "#ffffff",
                      fontFamily: '"Times New Roman", Times, serif',
                      fontWeight: 900,
                      fontVariantNumeric: "tabular-nums",
                      fontFeatureSettings: '"tnum"',
                    }}>
                    {formatted.hms}
                  </span>
                  <span className="text-lg sm:text-xl lg:text-2xl font-black text-emerald-500 inline-block text-left"
                    style={{
                      fontFamily: '"Times New Roman", Times, serif',
                      fontWeight: 900,
                      fontVariantNumeric: "tabular-nums",
                      fontFeatureSettings: '"tnum"',
                      minWidth: "2.5ch",
                    }}>
                    .{formatted.ms}
                  </span>
                </div>

                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] mt-2"
                  style={{ color: isRunning ? "#10b981" : (isLight ? "#94a3b8" : "#64748b") }}>
                  {isRunning ? "Running" : time > 0 ? "Paused" : "Ready"}
                </span>
              </div>
            </div>

            {/* Controls Bar */}
            <div className="flex items-center gap-3 sm:gap-4 mt-8 flex-wrap justify-center">
              {/* Start / Pause */}
              <button
                onClick={handleStartPause}
                className="sw-btn"
                style={{
                  background: isRunning
                    ? (isLight ? "rgba(16,185,129,0.1)" : "rgba(16,185,129,0.15)")
                    : "linear-gradient(135deg, #10b981, #059669)",
                  color: isRunning ? "#10b981" : "#ffffff",
                  border: isRunning
                    ? (isLight ? "1px solid rgba(16,185,129,0.25)" : "1px solid rgba(16,185,129,0.3)")
                    : "none",
                  boxShadow: isRunning ? "none" : "0 4px 18px rgba(16,185,129,0.35)",
                }}
              >
                {isRunning ? <Pause size={17} /> : <Play size={17} fill="white" />}
                {isRunning ? "Pause" : "Start"}
              </button>

              {/* Lap Button */}
              <button
                onClick={handleLap}
                disabled={!isRunning && time === 0}
                className="sw-btn"
                style={{
                  background: isLight ? "#f1f5f9" : "rgba(255,255,255,0.06)",
                  color: isLight ? "#475569" : "#ffffff",
                  border: `1px solid ${isLight ? "#cbd5e1" : "#27272a"}`,
                  opacity: (!isRunning && time === 0) ? 0.4 : 1,
                  cursor: (!isRunning && time === 0) ? "not-allowed" : "pointer",
                }}
              >
                <Flag size={16} />
                Lap
              </button>

              {/* Reset Button */}
              <button
                onClick={handleReset}
                disabled={time === 0 && !isRunning}
                className="sw-btn"
                style={{
                  background: isLight ? "#fee2e2" : "rgba(239,68,68,0.1)",
                  color: "#ef4444",
                  border: `1px solid ${isLight ? "#fca5a5" : "rgba(239,68,68,0.25)"}`,
                  opacity: (time === 0 && !isRunning) ? 0.4 : 1,
                  cursor: (time === 0 && !isRunning) ? "not-allowed" : "pointer",
                }}
              >
                <RotateCcw size={16} />
                Reset
              </button>
            </div>

          </div>

          {/* ══════════════════════════════════════════
              RIGHT: LAP RECORDS PANEL
          ══════════════════════════════════════════ */}
          <div className="w-full lg:w-96 flex flex-col rounded-2xl overflow-hidden"
            style={{
              height: "clamp(240px, 40vh, 384px)",
              background: isLight ? "#f8fafc" : "#16161a",
              border: `1px solid ${isLight ? "#e2e8f0" : "#222228"}`,
              color: isLight ? "#0f172a" : "#ffffff",
            }}>
            
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b"
              style={{
                borderColor: isLight ? "#e2e8f0" : "#222228",
                background: isLight ? "#ffffff" : "#121215",
              }}>
              <div className="flex items-center gap-2">
                <Timer size={16} className="text-emerald-500" />
                <span className="text-xs sm:text-sm font-extrabold" style={{ color: isLight ? "#0f172a" : "#ffffff" }}>
                  Lap Records
                </span>
              </div>
              {laps.length > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold text-emerald-500"
                  style={{ background: "rgba(16,185,129,0.12)" }}>
                  {laps.length} {laps.length === 1 ? "lap" : "laps"}
                </span>
              )}
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2 lap-scroll">
              {laps.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-2 text-center py-8">
                  <Trophy size={28} className="text-emerald-500 opacity-80" />
                  <p className="text-xs font-bold" style={{ color: isLight ? "#475569" : "#ffffff" }}>
                    Record laps while running
                  </p>
                  <p className="text-[10px] font-medium" style={{ color: isLight ? "#64748b" : "#cbd5e1" }}>
                    Click the Lap button during stopwatch execution
                  </p>
                </div>
              ) : (
                laps.map((lap) => {
                  const val     = formatTime(lap.timestamp);
                  const diffVal = formatTime(lap.diff);
                  const isFastest = lap.id === fastestId;
                  const isSlowest = lap.id === slowestId;

                  return (
                    <div
                      key={lap.id}
                      className="lap-item flex items-center justify-between p-3 rounded-xl text-xs"
                      style={{
                        background: isFastest
                          ? "rgba(16,185,129,0.1)"
                          : isSlowest
                          ? "rgba(245,158,11,0.1)"
                          : (isLight ? "#ffffff" : "#1e1e24"),
                        border: `1px solid ${
                          isFastest
                            ? "rgba(16,185,129,0.3)"
                            : isSlowest
                            ? "rgba(245,158,11,0.3)"
                            : (isLight ? "#e2e8f0" : "#2a2a32")
                        }`,
                        color: isLight ? "#0f172a" : "#ffffff",
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold" style={{ color: isLight ? "#475569" : "#cbd5e1" }}>
                          Lap {lap.index}
                        </span>
                        {isFastest && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-emerald-500/20 text-emerald-500">
                            Fastest
                          </span>
                        )}
                        {isSlowest && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-amber-500/20 text-amber-500">
                            Slowest
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 font-mono font-semibold">
                        <span className="text-[11px]" style={{ color: isLight ? "#64748b" : "#94a3b8" }}>
                          +{diffVal.hms}.{diffVal.ms}
                        </span>
                        <span className="font-bold text-sm" style={{ color: isLight ? "#0f172a" : "#ffffff" }}>
                          {val.hms}<span className="text-emerald-500 text-xs">.{val.ms}</span>
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  );
});

export default StopWatch;
