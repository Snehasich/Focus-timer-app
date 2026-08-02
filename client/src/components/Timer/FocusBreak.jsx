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
    <div className={`w-full h-full flex flex-col items-center justify-center my-auto relative ${
      isLight ? "text-gray-900" : "text-white"
    }`}>

      {/* ── Top-Right Pen & Paper Edit Icon Button ── */}
      <button
        onClick={() => {
          setCustomFocusMins(Math.round(focusInitialTime / 60));
          setCustomBreakMins(Math.round(breakInitialTime / 60));
          setShowSettings(true);
        }}
        className={`absolute top-2 right-2 sm:top-4 sm:right-4 p-2.5 rounded-full border transition-all hover:scale-110 active:scale-95 shadow-md cursor-pointer z-20 ${
          isLight 
            ? "bg-slate-100 border-slate-300 text-slate-600 hover:bg-slate-200" 
            : "bg-[#1a1a20] border-[#2a2a34] text-slate-400 hover:bg-[#25252e] hover:text-white"
        }`}
        title="Edit Timer Durations"
      >
        <NotebookPen size={18} />
      </button>

      {/* ── Pill Tab Switcher ── */}
      <div className="flex justify-center w-full max-w-[460px] mb-4 sm:mb-6">
        <div className={`inline-flex rounded-full p-1 relative border ${
          isLight 
            ? "bg-slate-100 border-slate-300 shadow-xs" 
            : "bg-[#0e0e0e] border-black/50 shadow-inner"
        }`}>
          {/* Sliding active pill */}
          <div 
            className={`absolute top-1 bottom-1 rounded-full transition-all duration-300 ${
              mode === "focus"
                ? "left-1 w-[calc(50%-4px)] bg-gradient-to-r from-blue-500 to-indigo-500 shadow-md shadow-blue-500/40"
                : "left-[calc(50%+2px)] w-[calc(50%-4px)] bg-gradient-to-r from-emerald-500 to-cyan-500 shadow-md shadow-emerald-500/40"
            }`}
          />

          <button
            className={`relative z-10 px-5 py-1.5 rounded-full text-sm font-semibold transition-colors duration-250 border-none outline-none cursor-pointer tracking-wide ${
              mode === "focus" ? "text-white" : isLight ? "text-slate-600 hover:text-gray-900" : "text-gray-400 hover:text-white"
            }`}
            onClick={() => switchMode("focus")}
          >
            ⏱ Focus
          </button>
          <button
            className={`relative z-10 px-5 py-1.5 rounded-full text-sm font-semibold transition-colors duration-250 border-none outline-none cursor-pointer tracking-wide ${
              mode === "break" ? "text-white" : isLight ? "text-slate-600 hover:text-gray-900" : "text-gray-400 hover:text-white"
            }`}
            onClick={() => switchMode("break")}
          >
            ☕ Break
          </button>
        </div>
      </div>

      {/* ── Timer with transition ── */}
      <div className={`flex justify-center transition-all duration-250 ${
        animating ? "opacity-0 scale-95 -translate-y-2" : "opacity-100 scale-100 translate-y-0"
      }`}>
        {mode === "focus" ? <FocusTimer /> : <BreakTimer />}
      </div>

      {/* ── Confirmation Modal ── */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-[9999] animate-in fade-in duration-200">
          <div className={`p-6 rounded-2xl w-[90%] max-w-[380px] text-center flex flex-col gap-4 border shadow-2xl animate-in zoom-in-95 ${
            isLight ? "bg-white border-slate-200 shadow-slate-900/10" : "bg-[#161616] border-[#2a2a2a] shadow-black/80"
          }`}>
            <h3 className={`text-lg font-bold ${isLight ? "text-gray-900" : "text-slate-100"}`}>
              Change Mode
            </h3>
            <p className={`text-sm ${isLight ? "text-slate-600" : "text-slate-400"}`}>
              Should I change to {pendingMode === "focus" ? "Focus" : "Break"} mode?
            </p>
            
            <div className="flex gap-2.5 justify-center mt-2">
              <button
                onClick={cancelSwitch}
                className={`px-5 py-2 rounded-full font-semibold text-xs border cursor-pointer transition-all hover:-translate-y-0.5 active:scale-95 ${
                  isLight 
                    ? "bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200" 
                    : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                }`}
              >
                Cancel
              </button>
              <button
                onClick={confirmSwitch}
                className={`px-5 py-2 rounded-full font-semibold text-xs text-white border-none cursor-pointer transition-all hover:-translate-y-0.5 active:scale-95 shadow-md ${
                  pendingMode === "focus"
                    ? "bg-gradient-to-r from-blue-500 to-indigo-500 shadow-blue-500/30"
                    : "bg-gradient-to-r from-emerald-500 to-cyan-500 shadow-emerald-500/30"
                }`}
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
          className="fixed inset-0 bg-black/50 backdrop-blur-md flex justify-end z-[9999] animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-[360px] h-full p-6 flex flex-col gap-5 border-l shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300 ${
              isLight ? "bg-white border-slate-200" : "bg-[#141418] border-[#282832]"
            }`}
          >
            {/* Drawer Header */}
            <div className={`flex items-center justify-between border-b pb-4 ${
              isLight ? "border-slate-200" : "border-[#26262e]"
            }`}>
              <div className="flex items-center gap-2">
                <NotebookPen size={20} className="text-blue-500" />
                <h3 className={`font-black text-lg ${isLight ? "text-slate-900" : "text-white"}`}>
                  Edit Timer
                </h3>
              </div>
              <button
                onClick={() => setShowSettings(false)}
                className={`p-1.5 rounded-full transition-all hover:scale-110 active:scale-95 ${
                  isLight ? "text-slate-500 hover:bg-slate-200" : "text-slate-400 hover:bg-white/10"
                }`}
              >
                <X size={18} />
              </button>
            </div>

            {/* 1. FOCUS TIMER SETTINGS */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs font-bold text-blue-500">
                <div className="flex items-center gap-1.5">
                  <Clock size={15} />
                  <span>Focus Duration</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[11px] ${
                  isLight ? "bg-blue-50 text-blue-600" : "bg-slate-800 text-blue-400"
                }`}>
                  {Math.round(focusInitialTime / 60)} Mins
                </span>
              </div>

              {/* Focus Presets */}
              <div className="flex items-center gap-2 flex-wrap">
                {[15, 25, 30, 45, 50, 60].map((m) => (
                  <button
                    key={m}
                    onClick={() => handleApplyFocusMins(m)}
                    className={`px-3 py-1 rounded-full text-xs font-bold cursor-pointer transition-all hover:-translate-y-0.5 border ${
                      Math.round(focusInitialTime / 60) === m
                        ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                        : isLight
                          ? "bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200"
                          : "bg-[#222228] text-slate-400 border-[#2e2e38] hover:bg-[#2c2c34] hover:text-white"
                    }`}
                  >
                    {m}m
                  </button>
                ))}
              </div>

              {/* Focus Custom Input */}
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs font-semibold ${isLight ? "text-slate-500" : "text-slate-400"}`}>Custom:</span>
                <input
                  type="number"
                  min="1"
                  max="180"
                  value={customFocusMins}
                  onChange={(e) => setCustomFocusMins(e.target.value)}
                  placeholder="Mins"
                  className={`w-20 px-2.5 py-1.5 rounded-xl text-xs font-bold outline-none border text-center ${
                    isLight 
                      ? "bg-slate-50 border-slate-300 text-slate-900" 
                      : "bg-[#111114] border-[#33333d] text-white"
                  }`}
                />
                <button
                  onClick={() => handleApplyFocusMins(customFocusMins)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-white flex items-center gap-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all hover:scale-105 cursor-pointer shadow-sm shadow-blue-500/30"
                >
                  <Check size={13} /> Apply
                </button>
              </div>
            </div>

            {/* Divider */}
            <div className={`h-px ${isLight ? "bg-slate-200" : "bg-[#26262e]"}`} />

            {/* 2. BREAK TIMER SETTINGS */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-500">
                <div className="flex items-center gap-1.5">
                  <Coffee size={15} />
                  <span>Break Duration</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[11px] ${
                  isLight ? "bg-emerald-50 text-emerald-600" : "bg-emerald-950 text-emerald-400"
                }`}>
                  {Math.round(breakInitialTime / 60)} Mins
                </span>
              </div>

              {/* Break Presets */}
              <div className="flex items-center gap-2 flex-wrap">
                {[5, 10, 15, 20, 30].map((m) => (
                  <button
                    key={m}
                    onClick={() => handleApplyBreakMins(m)}
                    className={`px-3 py-1 rounded-full text-xs font-bold cursor-pointer transition-all hover:-translate-y-0.5 border ${
                      Math.round(breakInitialTime / 60) === m
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                        : isLight
                          ? "bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200"
                          : "bg-[#222228] text-slate-400 border-[#2e2e38] hover:bg-[#2c2c34] hover:text-white"
                    }`}
                  >
                    {m}m
                  </button>
                ))}
              </div>

              {/* Break Custom Input */}
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs font-semibold ${isLight ? "text-slate-500" : "text-slate-400"}`}>Custom:</span>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={customBreakMins}
                  onChange={(e) => setCustomBreakMins(e.target.value)}
                  placeholder="Mins"
                  className={`w-20 px-2.5 py-1.5 rounded-xl text-xs font-bold outline-none border text-center ${
                    isLight 
                      ? "bg-slate-50 border-slate-300 text-slate-900" 
                      : "bg-[#111114] border-[#33333d] text-white"
                  }`}
                />
                <button
                  onClick={() => handleApplyBreakMins(customBreakMins)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-white flex items-center gap-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 transition-all hover:scale-105 cursor-pointer shadow-sm shadow-emerald-500/30"
                >
                  <Check size={13} /> Apply
                </button>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className={`flex flex-col gap-2.5 mt-auto pt-4 border-t ${
              isLight ? "border-slate-200" : "border-[#26262e]"
            }`}>
              <button
                onClick={handleResetSettings}
                className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all hover:scale-[1.02] active:scale-[0.98] border cursor-pointer ${
                  isLight 
                    ? "bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200" 
                    : "bg-[#1e1e24] border-[#2e2e38] text-slate-300 hover:bg-[#282830]"
                }`}
              >
                <RotateCcw size={14} />
                Reset to Default
              </button>
              
              <button
                onClick={() => setShowSettings(false)}
                className="w-full py-3 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer shadow-md shadow-blue-500/30"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default FocusBreak;