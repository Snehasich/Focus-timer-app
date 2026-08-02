import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { 
  House, Timer, TimerReset, Calendar, NotebookPen, 
  LayoutDashboard, MoreHorizontal, Sun, Moon, LogOut, X 
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { logout } from "../services/authService";

export const MobileBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === "light";
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const menuRef = useRef(null);

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMoreMenu(false);
      }
    };
    if (showMoreMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMoreMenu]);

  // Main 4 tabs + 1 More tab
  const primaryNavItems = [
    { path: "/", label: "Home", icon: House },
    { path: "/focusbreak", label: "Timer", icon: Timer },
    { path: "/notes", label: "Notes", icon: NotebookPen },
    { path: "/calendar", label: "Calendar", icon: Calendar },
  ];

  const secondaryNavItems = [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/stopwatch", label: "StopWatch", icon: TimerReset },
  ];

  const isMoreActive = secondaryNavItems.some((item) => item.path === location.pathname);

  const handleNavigate = (path) => {
    navigate(path);
    setShowMoreMenu(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="lg:hidden fixed bottom-3 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 pointer-events-auto min-w-[280px] max-w-[90vw]" ref={menuRef}>
      
      {/* ── More Popover Menu (Frosted Glass) ── */}
      {showMoreMenu && (
        <div 
          className={`absolute bottom-full mb-3 right-0 w-52 rounded-2xl p-2.5 shadow-2xl border flex flex-col gap-1 z-50 backdrop-blur-xl backdrop-saturate-150 animate-in fade-in slide-in-from-bottom-2 duration-200 ${
            isLight 
              ? "bg-white/80 border-white/80 shadow-slate-900/15" 
              : "bg-[#121218]/80 border-white/10 shadow-black/80"
          }`}
        >
          <div className={`flex items-center justify-between px-3 py-1.5 border-b mb-1 ${
            isLight ? "border-slate-200/60" : "border-white/10"
          }`}>
            <span className={`text-[10px] font-extrabold uppercase tracking-wider ${
              isLight ? "text-slate-500" : "text-slate-400"
            }`}>
              More Options
            </span>
            <button 
              onClick={() => setShowMoreMenu(false)}
              className={`p-1 rounded-md cursor-pointer transition-colors ${
                isLight ? "hover:bg-slate-200/60 text-slate-500" : "hover:bg-white/10 text-slate-400"
              }`}
            >
              <X size={14} />
            </button>
          </div>

          {secondaryNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => handleNavigate(item.path)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer w-full text-left ${
                  isActive 
                    ? "bg-blue-600 text-white shadow-sm" 
                    : isLight ? "text-slate-800 hover:bg-slate-900/10" : "text-gray-100 hover:bg-white/10"
                }`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className={`my-1 border-t ${isLight ? "border-slate-200/60" : "border-white/10"}`} />

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer w-full text-left ${
              isLight ? "text-slate-800 hover:bg-slate-900/10" : "text-gray-100 hover:bg-white/10"
            }`}
          >
            {isLight ? <Moon size={18} className="text-indigo-500" /> : <Sun size={18} className="text-amber-400" />}
            <span>{isLight ? "Dark Mode" : "Light Mode"}</span>
          </button>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer w-full text-left text-red-500 hover:bg-red-500/10"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      )}

      {/* ── Main Frosted Glass Floating Dock Bar ── */}
      <div
        className={`flex items-center justify-between gap-1 px-3 py-2 rounded-3xl transition-all shadow-2xl border backdrop-blur-xl backdrop-saturate-150 ${
          isLight 
            ? "bg-white/70 border-white/80 shadow-slate-900/12" 
            : "bg-[#121218]/70 border-white/10 shadow-black/70"
        }`}
      >
        {/* Primary 4 Items */}
        {primaryNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <button
              key={item.path}
              onClick={() => handleNavigate(item.path)}
              className={`flex flex-col items-center justify-center flex-1 px-1 py-1 rounded-2xl transition-all duration-200 cursor-pointer group ${
                isActive 
                  ? "text-blue-400 font-extrabold" 
                  : isLight 
                    ? "text-slate-700 hover:text-slate-950 active:scale-95" 
                    : "text-gray-300 hover:text-white active:scale-95"
              }`}
            >
              <div 
                className={`p-2 rounded-2xl transition-all flex items-center justify-center ${
                  isActive 
                    ? "bg-blue-600/30 border border-blue-500/40 text-blue-400 shadow-md scale-105" 
                    : "group-hover:bg-black/10 dark:group-hover:bg-white/15"
                }`}
              >
                <Icon size={22} className="transition-transform group-hover:scale-110" />
              </div>
              <span className={`text-[10px] tracking-tight mt-1 leading-none transition-all ${
                isActive ? "font-black text-blue-400" : "font-semibold opacity-90"
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}

        {/* 5th Item: 'More' (...) */}
        <button
          onClick={() => setShowMoreMenu(!showMoreMenu)}
          className={`flex flex-col items-center justify-center flex-1 px-1 py-1 rounded-2xl transition-all duration-200 cursor-pointer group ${
            showMoreMenu || isMoreActive
              ? "text-blue-400 font-extrabold" 
              : isLight 
                ? "text-slate-700 hover:text-slate-950 active:scale-95" 
                : "text-gray-300 hover:text-white active:scale-95"
          }`}
        >
          <div 
            className={`p-2 rounded-2xl transition-all flex items-center justify-center ${
              showMoreMenu || isMoreActive
                ? "bg-blue-600/30 border border-blue-500/40 text-blue-400 shadow-md scale-105" 
                : "group-hover:bg-black/10 dark:group-hover:bg-white/15"
            }`}
          >
            <MoreHorizontal size={22} className="transition-transform group-hover:scale-110" />
          </div>
          <span className={`text-[10px] tracking-tight mt-1 leading-none transition-all ${
            showMoreMenu || isMoreActive ? "font-black text-blue-400" : "font-semibold opacity-90"
          }`}>
            More
          </span>
        </button>

      </div>
    </div>
  );
};

export default MobileBottomNav;
