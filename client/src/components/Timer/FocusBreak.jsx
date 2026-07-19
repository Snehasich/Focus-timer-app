import React, { useState } from 'react';
import FocusTimer from './FocusTimer';
import BreakTimer from './BreakTimer';
import { useTheme } from '../../context/ThemeContext';

const FocusBreak = () => {
  const [mode, setMode] = useState('focus');
  const [animating, setAnimating] = useState(false);
  const { theme } = useTheme();

  const switchMode = (next) => {
    if (next === mode) return;
    setAnimating(true);
    setTimeout(() => {
      setMode(next);
      setAnimating(false);
    }, 220);
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
          transition: color 0.25s ease;
          z-index: 1;
          letter-spacing: 0.02em;
        }
      `}</style>

      <div style={{ color: isLight ? "#111827" : "white", width: "100%", maxWidth: 460, display: "flex", flexDirection: "column", alignItems: "center" }}>

        {/* ── Pill Tab Switcher ── */}
        <div style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: 28,
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

      </div>
    </>
  );
};

export default FocusBreak;