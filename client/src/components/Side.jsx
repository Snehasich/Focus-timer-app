import { useLocation, useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { Timer, House, TimerReset, LayoutDashboard, LogOut, Calendar, NotebookPen, Flame, PanelLeftClose } from "lucide-react";
import { useEffect, useState } from "react";
import { logout } from "../services/authService";
import { useTheme } from "../context/ThemeContext";
import focusflowLogoDark from "../assets/focusflow-logo-dark.png";
import focusflowLogoLight from "../assets/focusflow-logo-light.png";

import { useApp } from "../context/AppContext";

export const Side = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { stats } = useApp();
  const [username, setUsername] = useState("Username");
  const [localStreak, setLocalStreak] = useState(1);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { theme, sidebarOpen, toggleSidebar } = useTheme();

  const streak = Math.max(stats?.currentStreak || 0, localStreak, 1);

  const handleConfirmLogout = () => {
    logout();
    navigate("/login");
  };

  useEffect(() => {
    const stored = localStorage.getItem("username") || "Username";
    setUsername(stored);

    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    
    const lastVisit = localStorage.getItem("focusflow_last_visit");
    const storedStreak = parseInt(localStorage.getItem("focusflow_streak") || "0", 10);

    if (!lastVisit) {
      setLocalStreak(1);
      localStorage.setItem("focusflow_streak", "1");
      localStorage.setItem("focusflow_last_visit", todayStr);
    } else if (lastVisit === todayStr) {
      setLocalStreak(storedStreak > 0 ? storedStreak : 1);
    } else {
      const lastDate = new Date(lastVisit);
      const todayDate = new Date(todayStr);
      const diffTime = Math.abs(todayDate - lastDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        const newStreak = (storedStreak > 0 ? storedStreak : 0) + 1;
        setLocalStreak(newStreak);
        localStorage.setItem("focusflow_streak", String(newStreak));
      } else {
        setLocalStreak(1);
        localStorage.setItem("focusflow_streak", "1");
      }
      localStorage.setItem("focusflow_last_visit", todayStr);
    }
  }, []);

  const isLight = theme === "light";

  const getClass = (path) => {
    const isActive = location.pathname === path;
    if (isLight) {
      return `p-2.5 rounded-2xl flex items-center gap-2.5 transition-all duration-150 cursor-pointer w-full text-left font-medium text-sm
      ${isActive ? "bg-blue-600 text-white shadow-sm font-semibold" : "text-gray-600 hover:bg-slate-200 hover:text-gray-900"}`;
    } else {
      return `p-2.5 rounded-2xl flex items-center gap-2.5 transition-all duration-150 cursor-pointer w-full text-left font-medium text-sm
      ${isActive ? "bg-blue-600 text-white font-semibold" : "text-gray-400 hover:bg-[#1a1a1a] hover:text-white"}`;
    }
  };

  const handleNavigate = (path) => {
    navigate(path);
    if (window.innerWidth < 1024) {
      toggleSidebar();
    }
  };

  return (
    <aside 
      className={`h-screen hidden lg:flex flex-col shrink-0 transition-all duration-300 relative z-40 overflow-hidden ${
        sidebarOpen ? "w-[211px] translate-x-0" : "w-0 -translate-x-full"
      } ${
        isLight ? "bg-slate-100 border-r border-slate-200" : "bg-[#0f0f0f] border-r border-[#1c1c1c]"
      }`}
    >
      <div className="flex flex-col gap-3 p-4 flex-1 min-h-0 w-[211px] box-border">
        
        {/* ── Collapse Toggle Icon ── */}
        <button
          onClick={toggleSidebar}
          className={`absolute top-3.5 right-3.5 p-1.5 rounded-md cursor-pointer transition-colors ${
            isLight ? "text-slate-400 hover:text-slate-700 hover:bg-black/5" : "text-zinc-600 hover:text-zinc-300 hover:bg-white/5"
          }`}
          title="Toggle Sidebar"
        >
          <PanelLeftClose size={16} />
        </button>

        {/* ── Logo Header ── */}
        <div className="flex flex-col items-center justify-center gap-1.5 mt-5 mb-2 shrink-0">
          <img 
            src={isLight ? focusflowLogoLight : focusflowLogoDark} 
            alt="FocusFlow Logo" 
            className="w-12 h-12 rounded-xl"
          />
          <span className={`text-base font-extrabold tracking-tight ${isLight ? "text-gray-900" : "text-white"}`}>
            FocusFlow
          </span>
          <span className={`text-[11px] font-semibold tracking-wide -mt-1 ${isLight ? "text-gray-500" : "text-gray-400"}`}>
            Study • Focus • Achieve
          </span>
        </div>

        {/* ── Nav Buttons ONLY ── */}
        <div className="flex flex-col gap-3 flex-1 min-h-0 overflow-y-auto pr-1 py-1">
          <button onClick={() => handleNavigate("/")} className={getClass("/")}>
            <House size={18} /> Home
          </button>

          <button onClick={() => handleNavigate("/focusbreak")} className={getClass("/focusbreak")}>
            <Timer size={18} /> Timer
          </button>

          <button onClick={() => handleNavigate("/stopwatch")} className={getClass("/stopwatch")}>
            <TimerReset size={18} /> StopWatch
          </button>

          <button onClick={() => handleNavigate("/calendar")} className={getClass("/calendar")}>
            <Calendar size={18} /> Calendar
          </button>

          <button onClick={() => handleNavigate("/notes")} className={getClass("/notes")}>
            <NotebookPen size={18} /> Notes
          </button>

          <button onClick={() => handleNavigate("/dashboard")} className={getClass("/dashboard")}>
            <LayoutDashboard size={18} /> Dashboard
          </button>
        </div>

        {/* ── Streak Widget ── */}
        <div className={`rounded-xl p-2.5 flex items-center gap-2.5 shrink-0 border ${
          isLight 
            ? "bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/20 text-orange-950" 
            : "bg-gradient-to-br from-orange-500/15 to-orange-500/5 border-orange-500/25 text-orange-200"
        }`}>
          <div className="w-8 h-8 rounded-lg bg-orange-500/15 flex items-center justify-center shrink-0">
            <Flame size={18} className="text-orange-500 fill-orange-500/20" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className={`text-xs font-bold whitespace-nowrap ${isLight ? "text-orange-900" : "text-orange-300"}`}>
              {streak} Day{streak > 1 ? "s" : ""} Streak!
            </span>
            <span className={`text-[10px] font-medium whitespace-nowrap ${isLight ? "text-orange-700" : "text-orange-400"}`}>
              Keep focusing daily
            </span>
          </div>
        </div>

      </div>

      {/* ── Logout (Fixed at bottom footer) ── */}
      <div className={`p-3 border-t shrink-0 ${isLight ? "border-slate-200" : "border-white/5"}`}>
        <button
          onClick={() => setShowLogoutConfirm(true)}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
            isLight 
              ? "text-gray-500 hover:bg-red-500/10 hover:text-red-500" 
              : "text-zinc-500 hover:bg-red-500/10 hover:text-red-400"
          }`}
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>

      {/* ── Logout Confirmation Modal (Portal) ── */}
      {showLogoutConfirm && createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[99999]">
          <div className={`p-6 rounded-2xl w-[90%] max-w-[360px] text-center flex flex-col gap-4 border shadow-2xl animate-in fade-in zoom-in-95 ${
            isLight ? "bg-white border-slate-200 shadow-slate-900/10" : "bg-[#161616] border-[#2a2a2a] shadow-black/80"
          }`}>
            <div className="w-11 h-11 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
              <LogOut size={20} className="text-red-500" />
            </div>

            <div>
              <h3 className={`text-base font-extrabold ${isLight ? "text-gray-900" : "text-slate-100"}`}>
                Log Out
              </h3>
              <p className={`text-xs mt-1 ${isLight ? "text-gray-500" : "text-slate-400"}`}>
                Are you sure you want to log out of your session?
              </p>
            </div>

            <div className="flex gap-2.5 justify-center mt-1">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className={`px-5 py-2 rounded-full font-semibold text-xs border cursor-pointer ${
                  isLight 
                    ? "bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200" 
                    : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmLogout}
                className="px-5 py-2 rounded-full font-semibold text-xs bg-gradient-to-r from-red-500 to-red-600 text-white cursor-pointer hover:from-red-600 hover:to-red-700 shadow-md shadow-red-500/30"
              >
                Yes, Log Out
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </aside>
  );
};