import React, { useState } from 'react';
import FocusTimer from './FocusTimer';
import BreakTimer from './BreakTimer';
import { useTheme } from '../../context/ThemeContext';
import { useTimer } from '../../context/TimerContext';

const FocusBreak = () => {
  const [mode, setMode] = useState('focus');
  const [animating, setAnimating] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingMode, setPendingMode] = useState(null);
  const { theme } = useTheme();
  const { 
    isFocusRunning, 
    isBreakRunning, 
    setIsFocusRunning, 
    setFocusStartedAt, 
    setIsBreakRunning, 
    setBreakStartedAt,
    focusInitialTime,
    setFocusTime,
    breakInitialTime,
    setBreakTime
  } = useTimer();

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
      `}</style>

      <div style={{ color: isLight ? "#111827" : "white", width: "100%", maxWidth: "clamp(280px, 90vw, 460px)", display: "flex", flexDirection: "column", alignItems: "center" }}>

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

      </div>
    </>
  );
};

export default FocusBreak;