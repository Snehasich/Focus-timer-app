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

  const SIZE   = 300;
  const CENTER = SIZE / 2;
  const RADIUS = 130;

  return (
    <div
      className={`w-full h-full min-h-[calc(100vh-48px)] flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 rounded-3xl border shadow-2xl transition-all duration-300 ${
        mounted ? "opacity-100 scale-100" : "opacity-0 scale-95"
      } ${
        isLight 
          ? "bg-white border-slate-200 shadow-slate-200/50 text-slate-900" 
          : "bg-[#111114] border-[#222228] shadow-black/80 text-white"
      }`}
    >
      <div className="w-full max-w-5xl flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-12 my-auto">
        
        {/* ══════════════════════════════════════════
            LEFT: CLEAN DIAL & CONTROLS
        ══════════════════════════════════════════ */}
        <div className="flex flex-col items-center justify-center flex-1 w-full">
          
          {/* Circle Container */}
          <div className="relative flex items-center justify-center w-[clamp(200px,55vmin,320px)] h-[clamp(200px,55vmin,320px)] aspect-square">
            
            <svg
              viewBox={`0 0 ${SIZE} ${SIZE}`}
              className="w-full h-full overflow-visible block"
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

            {/* Digital Time Overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none p-6 translate-y-2.5">
              <div className="flex items-baseline justify-center gap-0.5 font-serif">
                <span className={`text-[clamp(1.9rem,6vw,2.9rem)] font-black tracking-tight leading-none ${
                  isLight ? "text-slate-900" : "text-white"
                }`}>
                  {formatted.hms}
                </span>
                <span className="text-[clamp(0.95rem,2.8vw,1.4rem)] font-extrabold text-emerald-500 opacity-90 leading-none">
                  .{formatted.ms}
                </span>
              </div>
              <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-widest mt-1 ${
                isRunning ? "text-emerald-500" : isLight ? "text-slate-400" : "text-zinc-600"
              }`}>
                {isRunning ? "Running" : time > 0 ? "Paused" : "Stopwatch"}
              </span>
            </div>
          </div>

          {/* 3 CONTROL BUTTONS */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 mt-6 sm:mt-8">
            {/* Start / Pause */}
            <button
              onClick={handleStartPause}
              className={`px-5 sm:px-6 py-2.5 rounded-full font-bold text-xs sm:text-sm cursor-pointer transition-all duration-150 hover:-translate-y-0.5 active:scale-95 border min-h-[44px] min-w-[90px] flex items-center justify-center gap-2 ${
                isRunning
                  ? "bg-amber-500/10 border-amber-500/20 text-amber-500 hover:bg-amber-500/20"
                  : "bg-gradient-to-r from-emerald-500 to-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-500/30"
              }`}
            >
              {isRunning ? <Pause size={16}/> : <Play size={16}/>}
              <span>{isRunning ? "Pause" : "Start"}</span>
            </button>

            {/* Lap */}
            <button
              onClick={handleLap}
              disabled={time === 0}
              className={`px-5 sm:px-6 py-2.5 rounded-full font-bold text-xs sm:text-sm cursor-pointer transition-all duration-150 hover:-translate-y-0.5 active:scale-95 border min-h-[44px] min-w-[80px] flex items-center justify-center gap-2 ${
                time === 0
                  ? "opacity-40 cursor-not-allowed border-slate-300 dark:border-zinc-800"
                  : isLight
                    ? "bg-blue-500/10 border-blue-500/20 text-blue-600 hover:bg-blue-500/20"
                    : "bg-blue-500/15 border-blue-500/30 text-blue-400 hover:bg-blue-500/25"
              }`}
            >
              <Flag size={16} />
              <span>Lap</span>
            </button>

            {/* Reset */}
            <button
              onClick={handleReset}
              className={`px-5 sm:px-6 py-2.5 rounded-full font-bold text-xs sm:text-sm cursor-pointer transition-all duration-150 hover:-translate-y-0.5 active:scale-95 border min-h-[44px] min-w-[80px] flex items-center justify-center gap-2 ${
                isLight
                  ? "bg-red-50 border-red-200 text-red-600 hover:bg-red-100"
                  : "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20"
              }`}
            >
              <RotateCcw size={16} />
              <span>Reset</span>
            </button>
          </div>

        </div>

        {/* ══════════════════════════════════════════
            RIGHT: LAP TIMES LIST
        ══════════════════════════════════════════ */}
        <div className={`w-full lg:w-80 h-64 lg:h-96 rounded-2xl p-4 sm:p-5 flex flex-col border transition-all ${
          isLight ? "bg-slate-50 border-slate-200" : "bg-[#16161a] border-[#22222a]"
        }`}>
          <div className={`flex items-center justify-between pb-3 border-b ${
            isLight ? "border-slate-200" : "border-[#262630]"
          }`}>
            <span className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
              isLight ? "text-slate-500" : "text-slate-400"
            }`}>
              <Trophy size={14} className="text-amber-500" />
              Laps Recorded ({laps.length})
            </span>
          </div>

          <div className="flex-1 overflow-y-auto mt-2 pr-1 flex flex-col gap-1.5">
            {laps.length === 0 ? (
              <div className={`flex flex-col items-center justify-center h-full gap-2 text-center ${
                isLight ? "text-slate-400" : "text-zinc-600"
              }`}>
                <Timer size={24} className="opacity-40" />
                <span className="text-xs">No laps recorded yet</span>
              </div>
            ) : (
              laps.map((lap) => {
                const lapFmt = formatTime(lap.timestamp);
                const diffFmt = formatTime(lap.diff);
                const isFastest = lap.id === fastestId;
                const isSlowest = lap.id === slowestId;

                return (
                  <div
                    key={lap.id}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                      isFastest
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500 font-bold"
                        : isSlowest
                          ? "bg-red-500/10 border-red-500/30 text-red-400"
                          : isLight
                            ? "bg-white border-slate-200 text-slate-700"
                            : "bg-[#1c1c22] border-white/5 text-slate-200"
                    }`}
                  >
                    <span className="font-bold">Lap {lap.index}</span>
                    <div className="flex items-center gap-3">
                      <span className="opacity-75 font-mono">+{diffFmt.hms}.{diffFmt.ms}</span>
                      <span className="font-bold font-mono">{lapFmt.hms}.{lapFmt.ms}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
});

export default StopWatch;
