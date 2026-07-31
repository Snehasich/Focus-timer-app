import React, { useState } from 'react';
import FocusTimer from './FocusTimer';
import BreakTimer from './BreakTimer';
import { useTheme } from '../../context/ThemeContext';
import { useTimer } from '../../context/TimerContext';
import { NotebookPen, X, Check, Clock, Coffee, RotateCcw } from 'lucide-react';

const FocusBreak = () => {
  const [mode, setMode] = useState('focus');
  const [animating, setAnimating] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingMode, setPendingMode] = useState(null);
  const [showSettings, setShowSettings] = useState(false);

  const { theme } = useTheme();
  const { 
    isFocusRunning, 
    isBreakRunning, 
    setIsFocusRunning, 
    setFocusStartedAt, 
    setIsBreakRunning, 
    setBreakStartedAt,
    focusInitialTime,
    setFocusInitialTime,
    setFocusTime,
    breakInitialTime,
    setBreakInitialTime,
    setBreakTime
  } = useTimer();

  const [customFocusMins, setCustomFocusMins] = useState(Math.round(focusInitialTime / 60));
  const [customBreakMins, setCustomBreakMins] = useState(Math.round(breakInitialTime / 60));

  const switchMode = (next) => {
    if (next === mode) return;
    
    // Only show confirmation if the active timer is currently running
    const isCurrentRunning = (mode === "focus" && isFocusRunning) || (mode === "break" && isBreakRunning);
    
    if (isCurrentRunning) {
      setPendingMode(next);
      setShowConfirm(true);
    } else {
      setAnimating(true);
      setTimeout(() => {
        setMode(next);
        setAnimating(false);
      }, 220);
    }
  };

  const confirmSwitch = () => {
    // Reset the currently active timer before switching modes
    if (mode === "focus") {
      setIsFocusRunning(false);
      setFocusStartedAt(null);
      setFocusTime(focusInitialTime);
    } else if (mode === "break") {
      setIsBreakRunning(false);
      setBreakStartedAt(null);
      setBreakTime(breakInitialTime);
    }

    setShowConfirm(false);
    setAnimating(true);
    setTimeout(() => {
      setMode(pendingMode);
      setAnimating(false);
      setPendingMode(null);
    }, 220);
  };

  const cancelSwitch = () => {
    setShowConfirm(false);
    setPendingMode(null);
  };

  const handleApplyFocusMins = (mins) => {
    const valid = Math.max(1, Math.min(180, parseInt(mins, 10) || 25));
    setFocusInitialTime(valid * 60);
    setCustomFocusMins(valid);
  };

  const handleApplyBreakMins = (mins) => {
    const valid = Math.max(1, Math.min(120, parseInt(mins, 10) || 10));
    setBreakInitialTime(valid * 60);
    setCustomBreakMins(valid);
  };

  const handleResetSettings = () => {
    setFocusInitialTime(50 * 60);
    setBreakInitialTime(10 * 60);
    setCustomFocusMins(50);
    setCustomBreakMins(10);
  };

  const isLight = theme === "light";

  return (
    <>
      <style>{`
        @keyframes timerFadeIn {
          from { opacity: 0; transform: translateY(12px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes timerFadeOut {
          from { opacity: 1; transform: translateY(0) scale(1); }
          to   { opacity: 0; transform: translateY(-10px) scale(0.97); }
        }
        .timer-in  { animation: timerFadeIn  0.28s cubic-bezier(0.22,1,0.36,1) forwards; }
        .timer-out { animation: timerFadeOut 0.2s ease forwards; }

        .tab-pill {
          position: relative;
          cursor: pointer;
          font-size: 0.88rem;
          font-weight: 600;
          padding: 7px 22px;
          border: none;
          background: none;
          border-radius: 50px;
          outline: none;
          transition: color 0.25s ease;
          z-index: 1;
          letter-spacing: 0.02em;
        }
        .modal-btn {
          transition: transform 0.15s ease, background 0.15s ease, filter 0.15s ease, box-shadow 0.15s ease;
        }
        .modal-btn:hover {
          transform: translateY(-1.5px);
          filter: brightness(1.05);
        }
        .modal-btn:active {
          transform: scale(0.96);
        }
        .settings-preset-btn {
          padding: 5px 12px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s ease;
          border: 1px solid transparent;
        }
        .settings-preset-btn:hover { transform: translateY(-1px); }
      `}</style>

      <div style={{ color: isLight ? "#111827" : "white", width: "100%", maxWidth: "clamp(280px, 90vw, 460px)", display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>

        {/* ── Top-Right Pen & Paper Edit Icon Button ── */}
        <button
          onClick={() => {
            setCustomFocusMins(Math.round(focusInitialTime / 60));
            setCustomBreakMins(Math.round(breakInitialTime / 60));
            setShowSettings(true);
          }}
          className="absolute top-0 right-0 p-2 rounded-full transition-all hover:scale-110 active:scale-95"
          style={{
            background: isLight ? "#f1f5f9" : "#1a1a20",
            border: isLight ? "1px solid #cbd5e1" : "1px solid #2a2a34",
            color: isLight ? "#475569" : "#9ca3af",
            cursor: "pointer",
            zIndex: 10,
          }}
          title="Edit Timer Durations"
        >
          <NotebookPen size={17} />
        </button>

        {/* ── Pill Tab Switcher ── */}
        <div style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: "clamp(16px, 4vw, 28px)",
        }}>
          <div style={{
            display: "inline-flex",
            background: isLight ? "#f1f5f9" : "#0e0e0e",
            border: isLight ? "1px solid #cbd5e1" : "1px solid rgba(0,0,0,0.5)",
            boxShadow: isLight 
              ? "none" 
              : "inset 0 1px 0 rgba(255,255,255,0.03), 0 2px 10px rgba(0,0,0,0.4)",
            borderRadius: 50,
            padding: 4,
            position: "relative",
          }}>
            {/* Sliding active pill */}
            <div style={{
              position: "absolute",
              top: 4, bottom: 4,
              left: mode === "focus" ? 4 : "calc(50% + 2px)",
              width: "calc(50% - 6px)",
              background: mode === "focus"
                ? "linear-gradient(135deg, #3b82f6, #6366f1)"
                : "linear-gradient(135deg, #10b981, #06b6d4)",
              borderRadius: 50,
              boxShadow: mode === "focus"
                ? "0 2px 12px rgba(59,130,246,0.4)"
                : "0 2px 12px rgba(16,185,129,0.4)",
              transition: "left 0.32s cubic-bezier(0.4,0,0.2,1), background 0.32s ease, box-shadow 0.32s ease",
            }} />

            <button
              className="tab-pill"
              onClick={() => switchMode("focus")}
              style={{ color: mode === "focus" ? "#fff" : (isLight ? "#6B7280" : "#555") }}
            >
              ⏱ Focus
            </button>
            <button
              className="tab-pill"
              onClick={() => switchMode("break")}
              style={{ color: mode === "break" ? "#fff" : (isLight ? "#6B7280" : "#555") }}
            >
              ☕ Break
            </button>
          </div>
        </div>

        {/* ── Timer with fade transition ── */}
        <div
          className={animating ? "timer-out" : "timer-in"}
          style={{ display: "flex", justifyContent: "center" }}
        >
          {mode === "focus" ? <FocusTimer /> : <BreakTimer />}
        </div>

        {/* ── Confirmation Modal ── */}
        {showConfirm && (
          <div style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.45)",
            backdropFilter: "blur(5px)",
            WebkitBackdropFilter: "blur(5px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            animation: "timerFadeIn 0.2s ease forwards",
          }}>
            <div style={{
              background: isLight ? "#ffffff" : "#161616",
              border: isLight ? "1px solid #e5e7eb" : "1px solid #2a2a2a",
              boxShadow: isLight 
                ? "0 10px 30px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.6)" 
                : "0 20px 50px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)",
              borderRadius: 20,
              padding: 24,
              width: "90%",
              maxWidth: 380,
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              gap: 16,
              animation: "timerFadeIn 0.25s cubic-bezier(0.22, 1, 0.36, 1) forwards",
            }}>
              <h3 style={{
                margin: 0,
                fontSize: "1.15rem",
                fontWeight: 700,
                color: isLight ? "#111827" : "#f3f4f6",
              }}>
                Change Mode
              </h3>
              <p style={{
                margin: 0,
                fontSize: "0.88rem",
                color: isLight ? "#4b5563" : "#9ca3af",
                lineHeight: 1.5,
              }}>
                Should I change to {pendingMode === "focus" ? "Focus" : "Break"} mode?
              </p>
              
              <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 8 }}>
                <button
                  onClick={cancelSwitch}
                  className="modal-btn"
                  style={{
                    background: isLight ? "#f1f5f9" : "rgba(255,255,255,0.03)",
                    border: isLight ? "1px solid #cbd5e1" : "1px solid rgba(255,255,255,0.06)",
                    color: isLight ? "#4b5563" : "#e5e7eb",
                    padding: "9px 20px",
                    borderRadius: 50,
                    fontWeight: 600,
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    outline: "none",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmSwitch}
                  className="modal-btn"
                  style={{
                    background: pendingMode === "focus"
                      ? "linear-gradient(135deg, #3b82f6, #6366f1)"
                      : "linear-gradient(135deg, #10b981, #06b6d4)",
                    border: "none",
                    color: "#ffffff",
                    padding: "9px 20px",
                    borderRadius: 50,
                    fontWeight: 600,
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    outline: "none",
                    boxShadow: pendingMode === "focus"
                      ? "0 4px 12px rgba(59,130,246,0.3)"
                      : "0 4px 12px rgba(16,185,129,0.3)",
                  }}
                >
                  Yes, Switch
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Timer Settings Slide-In Drawer ── */}
        {showSettings && (
          <div 
            onClick={() => setShowSettings(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0, 0, 0, 0.45)",
              backdropFilter: "blur(5px)",
              WebkitBackdropFilter: "blur(5px)",
              display: "flex",
              justifyContent: "flex-end",
              zIndex: 9999,
            }}
          >
            <div 
              onClick={(e) => e.stopPropagation()}
              className="slide-drawer-in"
              style={{
                background: isLight ? "#ffffff" : "#141418",
                borderLeft: isLight ? "1px solid #e5e7eb" : "1px solid #282832",
                boxShadow: "-12px 0 40px rgba(0, 0, 0, 0.5)",
                width: "100%",
                maxWidth: 360,
                height: "100%",
                padding: 24,
                display: "flex",
                flexDirection: "column",
                gap: 20,
                boxSizing: "border-box",
                overflowY: "auto",
              }}
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: isLight ? "#e2e8f0" : "#26262e" }}>
                <div className="flex items-center gap-2">
                  <NotebookPen size={20} className="text-blue-500" />
                  <h3 className="m-0 font-black text-lg" style={{ color: isLight ? "#0f172a" : "#ffffff" }}>
                    Edit Timer
                  </h3>
                </div>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-1.5 rounded-full transition-all hover:bg-black/10 hover:scale-110 active:scale-95"
                  style={{ color: isLight ? "#64748b" : "#94a3b8" }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* 1. FOCUS TIMER SETTINGS */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between text-xs font-bold" style={{ color: "#3b82f6" }}>
                  <div className="flex items-center gap-1.5">
                    <Clock size={15} />
                    <span>Focus Duration</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[11px]" style={{ background: isLight ? "#eff6ff" : "#1e293b" }}>
                    {Math.round(focusInitialTime / 60)} Mins
                  </span>
                </div>

                {/* Focus Presets */}
                <div className="flex items-center gap-2 flex-wrap">
                  {[15, 25, 30, 45, 50, 60].map((m) => (
                    <button
                      key={m}
                      onClick={() => handleApplyFocusMins(m)}
                      className="settings-preset-btn"
                      style={{
                        background: Math.round(focusInitialTime / 60) === m ? "#3b82f6" : (isLight ? "#f1f5f9" : "#222228"),
                        color: Math.round(focusInitialTime / 60) === m ? "#ffffff" : (isLight ? "#475569" : "#94a3b8"),
                        borderColor: Math.round(focusInitialTime / 60) === m ? "#2563eb" : (isLight ? "#cbd5e1" : "#2e2e38"),
                      }}
                    >
                      {m}m
                    </button>
                  ))}
                </div>

                {/* Focus Custom Input */}
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-semibold" style={{ color: isLight ? "#64748b" : "#94a3b8" }}>Custom:</span>
                  <input
                    type="number"
                    min="1"
                    max="180"
                    value={customFocusMins}
                    onChange={(e) => setCustomFocusMins(e.target.value)}
                    placeholder="Mins"
                    className="w-20 px-2.5 py-1.5 rounded-xl text-xs font-bold outline-none border text-center"
                    style={{
                      background: isLight ? "#f8fafc" : "#111114",
                      borderColor: isLight ? "#cbd5e1" : "#33333d",
                      color: isLight ? "#0f172a" : "#ffffff",
                    }}
                  />
                  <button
                    onClick={() => handleApplyFocusMins(customFocusMins)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold text-white flex items-center gap-1 hover:scale-105"
                    style={{ background: "linear-gradient(135deg, #3b82f6, #2563eb)" }}
                  >
                    <Check size={13} /> Apply
                  </button>
                </div>
              </div>

              {/* Divider */}
              <div style={{ height: 1, background: isLight ? "#e2e8f0" : "#26262e" }} />

              {/* 2. BREAK TIMER SETTINGS */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between text-xs font-bold" style={{ color: "#10b981" }}>
                  <div className="flex items-center gap-1.5">
                    <Coffee size={15} />
                    <span>Break Duration</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[11px]" style={{ background: isLight ? "#ecfdf5" : "#064e3b" }}>
                    {Math.round(breakInitialTime / 60)} Mins
                  </span>
                </div>

                {/* Break Presets */}
                <div className="flex items-center gap-2 flex-wrap">
                  {[5, 10, 15, 20, 30].map((m) => (
                    <button
                      key={m}
                      onClick={() => handleApplyBreakMins(m)}
                      className="settings-preset-btn"
                      style={{
                        background: Math.round(breakInitialTime / 60) === m ? "#10b981" : (isLight ? "#f1f5f9" : "#222228"),
                        color: Math.round(breakInitialTime / 60) === m ? "#ffffff" : (isLight ? "#475569" : "#94a3b8"),
                        borderColor: Math.round(breakInitialTime / 60) === m ? "#059669" : (isLight ? "#cbd5e1" : "#2e2e38"),
                      }}
                    >
                      {m}m
                    </button>
                  ))}
                </div>

                {/* Break Custom Input */}
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-semibold" style={{ color: isLight ? "#64748b" : "#94a3b8" }}>Custom:</span>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={customBreakMins}
                    onChange={(e) => setCustomBreakMins(e.target.value)}
                    placeholder="Mins"
                    className="w-20 px-2.5 py-1.5 rounded-xl text-xs font-bold outline-none border text-center"
                    style={{
                      background: isLight ? "#f8fafc" : "#111114",
                      borderColor: isLight ? "#cbd5e1" : "#33333d",
                      color: isLight ? "#0f172a" : "#ffffff",
                    }}
                  />
                  <button
                    onClick={() => handleApplyBreakMins(customBreakMins)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold text-white flex items-center gap-1 hover:scale-105"
                    style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}
                  >
                    <Check size={13} /> Apply
                  </button>
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="flex flex-col gap-2.5 mt-auto pt-4 border-t" style={{ borderColor: isLight ? "#e2e8f0" : "#26262e" }}>
                <button
                  onClick={handleResetSettings}
                  className="w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    background: isLight ? "#fee2e2" : "rgba(239,68,68,0.1)",
                    color: "#ef4444",
                    border: isLight ? "1px solid #fca5a5" : "1px solid rgba(239,68,68,0.25)",
                    cursor: "pointer",
                  }}
                >
                  <RotateCcw size={14} />
                  Reset to Default (50m Focus / 10m Break)
                </button>
                
                <button
                  onClick={() => setShowSettings(false)}
                  className="w-full py-3 rounded-xl font-bold text-xs text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
                  style={{ background: "linear-gradient(135deg, #3b82f6, #2563eb)", boxShadow: "0 4px 14px rgba(59,130,246,0.3)", cursor: "pointer" }}
                >
                  Close Settings
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
};

export default FocusBreak;