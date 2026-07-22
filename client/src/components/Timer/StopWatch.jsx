import { useState, useEffect, useRef, memo } from "react";
import { RotateCcw, Play, Pause, ListPlus } from "lucide-react";
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
    const newLap = {
      id: Date.now(),
      index: laps.length + 1,
      timestamp: time,
      diff: laps.length > 0 ? time - laps[0].timestamp : time,
    };
    setLaps([newLap, ...laps]);
  };

  const formatTime = (ms) => {
    const hours = String(Math.floor(ms / 3600000)).padStart(2, "0");
    const mins = String(Math.floor((ms % 3600000) / 60000)).padStart(2, "0");
    const secs = String(Math.floor((ms % 60000) / 1000)).padStart(2, "0");
    const centis = String(Math.floor((ms % 1000) / 10)).padStart(2, "0");

    return {
      hms: `${hours}:${mins}:${secs}`,
      ms: centis,
    };
  };

  const formatted = formatTime(time);

  // SVG rotating dial logic
  const secondsFraction = (time % 60000) / 60000;
  const rotationAngle = secondsFraction * 360;

  const isLight = theme === "light";

  return (
    <>
      <style>{`
        @keyframes mountIn {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        .stopwatch-mount {
          animation: mountIn 0.4s cubic-bezier(0.22,1,0.36,1) forwards;
        }
        .ctrl-btn {
          display: flex; align-items: center; gap: 8px;
          padding: 10px 24px; border-radius: 50px; border: none;
          font-weight: 600; font-size: 0.9rem; cursor: pointer;
          outline: none;
          transition: transform 0.15s ease, filter 0.15s ease;
        }
        .ctrl-btn:hover { transform: translateY(-1px); filter: brightness(1.1); }
        .ctrl-btn:active { transform: scale(0.96); }
        .lap-row {
          animation: slideDown 0.25s cubic-bezier(0.22,1,0.36,1) forwards;
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div
        className={`w-full h-full flex flex-col items-center justify-center p-6 stopwatch-mount`}
        style={{
          background: isLight ? "#ffffff" : "#111",
          borderRadius: 24,
          border: isLight ? "1px solid #e5e7eb" : "1px solid #222",
          boxShadow: isLight ? "0 8px 24px rgba(15,23,42,0.03)" : "none",
          opacity: mounted ? 1 : 0,
          boxSizing: "border-box",
        }}
      >
        <div className="flex flex-col lg:flex-row items-center justify-center gap-12 w-full max-w-4xl">
          
          {/* ── Left Half: Clock Face ── */}
          <div className="flex flex-col items-center">
            {/* Clock Face Circle */}
            <div style={{ position: "relative", width: 260, height: 260 }}>
              <svg width="260" height="260" style={{ overflow: "visible" }}>
                {/* Background Ring */}
                <circle cx="130" cy="130" r="118" fill="none" stroke={isLight ? "#f1f5f9" : "#1d1d1f"} strokeWidth="6" />

                {/* Dial Markings */}
                {[...Array(12)].map((_, i) => {
                  const angle = (i * 30 * Math.PI) / 180;
                  const x1 = 130 + 108 * Math.cos(angle);
                  const y1 = 130 + 108 * Math.sin(angle);
                  const x2 = 130 + 116 * Math.cos(angle);
                  const y2 = 130 + 116 * Math.sin(angle);
                  return (
                    <line
                      key={i}
                      x1={x1} y1={y1} x2={x2} y2={y2}
                      stroke={i % 3 === 0 ? (isLight ? "#94A3B8" : "#4b5563") : (isLight ? "#e2e8f0" : "#374151")}
                      strokeWidth={i % 3 === 0 ? 3 : 1.5}
                    />
                  );
                })}

                {/* Hand rotation */}
                <line
                  x1="130" y1="130"
                  x2="130" y2="35"
                  stroke="#10b981"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  transform={`rotate(${rotationAngle} 130 130)`}
                  style={{ transformOrigin: "130px 130px" }}
                />

                {/* Center Pin */}
                <circle cx="130" cy="130" r="5" fill="#10b981" />
                <circle cx="130" cy="130" r="2" fill="#06b6d4" />
              </svg>

              {/* Time display text overlay */}
              <div style={{
                position: "absolute", inset: 0,
                display: "flex", flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                paddingTop: 100,
              }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 2 }}>
                  <span style={{
                    fontSize: "2.8rem",
                    fontWeight: 800,
                    color: isLight ? "#111827" : "#f3f4f6",
                    letterSpacing: "-2px",
                    fontVariantNumeric: "tabular-nums",
                    lineHeight: 1,
                  }}>
                    {formatted.hms}
                  </span>
                  <span style={{
                    fontSize: "1.3rem",
                    fontWeight: 700,
                    color: "#10b981",
                    fontVariantNumeric: "tabular-nums",
                  }}>
                    .{formatted.ms}
                  </span>
                </div>
                <span style={{
                  fontSize: "0.68rem",
                  color: isRunning ? "#10b981" : (isLight ? "#6B7280" : "#4b5563"),
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  fontWeight: 600,
                  marginTop: 6,
                }}>
                  {isRunning ? "Running" : time > 0 ? "Paused" : "Stopwatch"}
                </span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex gap-4 mt-8">
              <button
                onClick={handleStartPause}
                className="ctrl-btn"
                style={{
                  background: isRunning
                    ? (isLight ? "rgba(16,185,129,0.08)" : "rgba(16,185,129,0.12)")
                    : "linear-gradient(135deg,#10b981,#059669)",
                  color: isRunning ? "#10b981" : "#fff",
                  border: isRunning ? (isLight ? "1px solid rgba(16,185,129,0.15)" : "1px solid rgba(16,185,129,0.2)") : "none",
                  boxShadow: isRunning ? "none" : "0 4px 14px rgba(16,185,129,0.3)",
                }}
              >
                {isRunning ? <Pause size={16} /> : <Play size={16} />}
                {isRunning ? "Pause" : "Start"}
              </button>

              {isRunning && (
                <button
                  onClick={handleLap}
                  className="ctrl-btn"
                  style={{
                    background: isLight ? "#f1f5f9" : "rgba(255,255,255,0.04)",
                    color: isLight ? "#4B5563" : "#e5e7eb",
                    border: isLight ? "1px solid #e5e7eb" : "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <ListPlus size={16} />
                  Lap
                </button>
              )}

              <button
                onClick={handleReset}
                className="ctrl-btn"
                style={{
                  background: isLight ? "#fee2e2" : "rgba(239,68,68,0.08)",
                  color: "#ef4444",
                  border: isLight ? "1px solid #fca5a5" : "1px solid rgba(239,68,68,0.15)",
                }}
              >
                <RotateCcw size={15} />
                Reset
              </button>
            </div>
          </div>

          {/* ── Right Half: Lap Times List ── */}
          <div style={{
            flex: 1,
            width: "100%",
            maxWidth: 380,
            display: "flex",
            flexDirection: "column",
            alignSelf: "stretch",
            maxHeight: 330,
            background: isLight ? "#f8fafc" : "#0c0c0e",
            borderRadius: 16,
            border: isLight ? "1px solid #e5e7eb" : "1px solid #1c1c1f",
            overflow: "hidden",
          }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "12px 16px",
              borderBottom: isLight ? "1px solid #e5e7eb" : "1px solid #1c1c1f",
              background: isLight ? "#ffffff" : "#0f0f12",
            }}>
              <span style={{ fontSize: "0.82rem", fontWeight: 600, color: isLight ? "#4B5563" : "#9ca3af" }}>
                Lap Records
              </span>
              {laps.length > 0 && (
                <span style={{ fontSize: "0.75rem", color: isLight ? "#6B7280" : "#6b7280" }}>
                  {laps.length} total
                </span>
              )}
            </div>

            <div style={{
              flex: 1,
              overflowY: "auto",
              padding: "8px 12px",
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}>
              {laps.length === 0 ? (
                <div style={{
                  display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center",
                  height: "100%", opacity: 0.35, gap: 8,
                }}>
                  <span style={{ fontSize: "1.4rem" }}>⏱</span>
                  <span style={{ fontSize: "0.78rem", color: isLight ? "#6B7280" : "#9ca3af" }}>
                    Record laps while running
                  </span>
                </div>
              ) : (
                laps.map((lap) => {
                  const val = formatTime(lap.timestamp);
                  const diffVal = formatTime(lap.diff);
                  return (
                    <div
                      key={lap.id}
                      className="lap-row"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "8px 10px",
                        background: isLight ? "#ffffff" : "rgba(255,255,255,0.01)",
                        borderRadius: 8,
                        border: isLight ? "1px solid #e5e7eb" : "1px solid rgba(255,255,255,0.02)",
                      }}
                    >
                      <span style={{ fontSize: "0.8rem", color: isLight ? "#6B7280" : "#6b7280", fontWeight: 500 }}>
                        Lap {lap.index}
                      </span>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                        <span style={{ fontSize: "0.72rem", color: isLight ? "#94A3B8" : "#4b5563" }}>
                          +{diffVal.hms}
                        </span>
                        <span style={{ fontSize: "0.85rem", color: isLight ? "#111827" : "#e5e7eb", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
                          {val.hms}
                          <span style={{ color: "#10b981", fontSize: "0.78rem" }}>
                            .{val.ms}
                          </span>
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
