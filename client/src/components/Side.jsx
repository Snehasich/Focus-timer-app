import { useLocation, useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { Timer, House, TimerReset, LayoutDashboard, LogOut, Calendar, NotebookPen, Flame } from "lucide-react";
import { useEffect, useState } from "react";
import { logout } from "../services/authService";
import { useTheme } from "../context/ThemeContext";
import focusflowLogoDark from "../assets/focusflow-logo-dark.png";
import focusflowLogoLight from "../assets/focusflow-logo-light.png";

export const Side = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState("Username");
  const [streak, setStreak] = useState(1);
  const [greetingVisible, setGreetingVisible] = useState(false);
  const [nameVisible, setNameVisible] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { theme, sidebarOpen, toggleSidebar } = useTheme();

  const handleConfirmLogout = () => {
    logout();
    navigate("/login");
  };

  useEffect(() => {
    const stored = localStorage.getItem("username") || "Username";
    setUsername(stored);

    // ── Dynamic Real Daily Streak Calculation ──
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    
    const lastVisit = localStorage.getItem("focusflow_last_visit");
    const storedStreak = parseInt(localStorage.getItem("focusflow_streak") || "0", 10);

    if (!lastVisit) {
      setStreak(1);
      localStorage.setItem("focusflow_streak", "1");
      localStorage.setItem("focusflow_last_visit", todayStr);
    } else if (lastVisit === todayStr) {
      setStreak(storedStreak > 0 ? storedStreak : 1);
    } else {
      const lastDate = new Date(lastVisit);
      const todayDate = new Date(todayStr);
      const diffTime = Math.abs(todayDate - lastDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        const newStreak = (storedStreak > 0 ? storedStreak : 0) + 1;
        setStreak(newStreak);
        localStorage.setItem("focusflow_streak", String(newStreak));
      } else {
        setStreak(1);
        localStorage.setItem("focusflow_streak", "1");
      }
      localStorage.setItem("focusflow_last_visit", todayStr);
    }

    // Animate greeting first
    setTimeout(() => setGreetingVisible(true), 200);

    // Then type out the name letter by letter
    setTimeout(() => {
      setNameVisible(true);
      let i = 0;
      const interval = setInterval(() => {
        i++;
        setDisplayName(stored.slice(0, i));
        if (i >= stored.length) clearInterval(interval);
      }, 60);
    }, 600);
  }, []);

  const isLight = theme === "light";

  const getClass = (path) => {
    const isActive = location.pathname === path;
    if (isLight) {
      return `p-2 rounded-2xl flex items-center gap-2 transition-all duration-150 cursor-pointer
      ${isActive ? "bg-blue-600 text-white shadow-sm font-semibold" : "text-gray-600 hover:bg-[#e2e8f0] hover:text-gray-900"}`;
    } else {
      return `p-2 rounded-2xl flex items-center gap-2 transition-all duration-150 cursor-pointer
      ${isActive ? "bg-blue-600 text-white font-semibold" : "text-gray-400 hover:bg-[#1a1a1a] hover:text-white"}`;
    }
  };

  // Get initials for avatar
  const getInitials = (name) => name.charAt(0).toUpperCase();

  return (
    <>
      <style>{`
        @keyframes fadeSlideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes pulse-ring {
          0%   { box-shadow: 0 0 0 0px ${isLight ? "rgba(37,99,235,0.2)" : "rgba(96,165,250,0.35)"}; }
          70%  { box-shadow: 0 0 0 7px ${isLight ? "rgba(37,99,235,0)" : "rgba(96,165,250,0)"}; }
          100% { box-shadow: 0 0 0 0px ${isLight ? "rgba(37,99,235,0)" : "rgba(96,165,250,0)"}; }
        }
        .greeting-in  { animation: fadeSlideDown 0.5s ease forwards; }
        .name-in      { animation: fadeSlideUp 0.45s ease forwards; }
        .avatar-pulse { animation: pulse-ring 2.5s ease-out infinite; }
        .cursor-blink { animation: blink 0.75s step-end infinite; }
        .sidebar-nav::-webkit-scrollbar { width: 2px; transition: width 0.2s ease; }
        .sidebar-nav::-webkit-scrollbar-track { background: transparent; }
        .sidebar-nav::-webkit-scrollbar-thumb { background: ${isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.06)"}; border-radius: 4px; }
        .sidebar-nav:hover::-webkit-scrollbar { width: 4px; }
        .sidebar-nav:hover::-webkit-scrollbar-thumb { background: ${isLight ? "#94a3b8" : "#555555"}; }

        @media (max-width: 767px) {
          .sidebar-responsive {
            position: fixed !important;
            top: 0;
            left: 0;
            z-index: 50 !important;
            box-shadow: 0 0 40px rgba(0, 0, 0, 0.5);
          }
        }
      `}</style>

      <div 
        className="h-screen sidebar-responsive flex flex-col transition-all duration-300"
        style={{
          width: sidebarOpen ? 211 : 0,
          transform: sidebarOpen ? "translateX(0)" : "translateX(-211px)",
          background: isLight ? "#f1f5f9" : "#0f0f0f",
          borderRight: sidebarOpen ? (isLight ? "1px solid #e2e8f0" : "1px solid #1c1c1c") : "none",
          overflow: "hidden",
          position: "relative",
          zIndex: 40,
        }}
      >
        <div className="flex flex-col gap-3 p-4 flex-1 min-h-0" style={{ minWidth: 211, boxSizing: "border-box" }}>
          
          {/* ── Collapse Toggle Icon ── */}
          <button
            onClick={toggleSidebar}
            style={{
              position: "absolute",
              top: 14,
              right: 14,
              background: "transparent",
              border: "none",
              color: isLight ? "#94a3b8" : "#555",
              cursor: "pointer",
              padding: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "color 0.2s, transform 0.15s, background 0.2s",
              borderRadius: "6px",
            }}
            onMouseEnter={(e) => { 
              e.currentTarget.style.color = isLight ? "#4b5563" : "#cbd5e1";
              e.currentTarget.style.background = isLight ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.05)";
            }}
            onMouseLeave={(e) => { 
              e.currentTarget.style.color = isLight ? "#94a3b8" : "#555";
              e.currentTarget.style.background = "transparent";
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/></svg>
          </button>

          {/* ── Logo Header ── */}
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            marginTop: 20,
            marginBottom: 10,
            flexShrink: 0,
          }}>
            <img 
              src={isLight ? focusflowLogoLight : focusflowLogoDark} 
              alt="FocusFlow Logo" 
              style={{ 
                width: 48, 
                height: 48, 
                borderRadius: 12,
              }} 
            />
            <span
              style={{
                color: isLight ? "#111827" : "#ffffff",
                fontSize: "1.05rem",
                fontWeight: 800,
                letterSpacing: "-0.5px",
              }}
            >
              FocusFlow
            </span>
            <span
              style={{
                color: isLight ? "#6b7280" : "#9ca3af",
                fontSize: "0.68rem",
                fontWeight: 600,
                letterSpacing: "0.2px",
                marginTop: -4,
              }}
            >
              Study • Focus • Achieve
            </span>
          </div>

          {/* ── Nav Buttons ONLY (Scrollable with gap-4) ── */}
          <div 
            className="sidebar-nav flex flex-col gap-4 flex-1 min-h-0 overflow-y-auto pr-1 py-1"
          >
            <button onClick={() => navigate("/")} className={getClass("/")}>
              <House size={18} /> Home
            </button>

            <button onClick={() => navigate("/focusbreak")} className={getClass("/focusbreak")}>
              <Timer size={18} /> Timer
            </button>

            <button onClick={() => navigate("/stopwatch")} className={getClass("/stopwatch")}>
              <TimerReset size={18} /> StopWatch
            </button>

            <button onClick={() => navigate("/calendar")} className={getClass("/calendar")}>
              <Calendar size={18} /> Calendar
            </button>

            <button onClick={() => navigate("/notes")} className={getClass("/notes")}>
              <NotebookPen size={18} /> Notes
            </button>

            <button onClick={() => navigate("/dashboard")} className={getClass("/dashboard")}>
              <LayoutDashboard size={18} /> Dashboard
            </button>
          </div>

          {/* ── Streak Widget (Fixed at bottom of flex area) ── */}
          <div style={{
            background: isLight 
              ? "linear-gradient(135deg, rgba(249, 115, 22, 0.08), rgba(234, 88, 12, 0.04))" 
              : "linear-gradient(135deg, rgba(249, 115, 22, 0.12), rgba(234, 88, 12, 0.06))",
            border: isLight 
              ? "1px solid rgba(249, 115, 22, 0.2)" 
              : "1px solid rgba(249, 115, 22, 0.25)",
            borderRadius: 14,
            padding: "10px 12px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexShrink: 0,
          }}>
            <div style={{
              width: 32, height: 32,
              borderRadius: 10,
              background: "rgba(249, 115, 22, 0.15)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <Flame size={18} color="#f97316" />
            </div>
            <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
              <span style={{
                fontSize: "0.82rem",
                fontWeight: 700,
                color: isLight ? "#9a3412" : "#fdba74",
                letterSpacing: "-0.2px",
                whiteSpace: "nowrap",
              }}>
                {streak} Day{streak > 1 ? "s" : ""} Streak!
              </span>
              <span style={{
                fontSize: "0.68rem",
                color: isLight ? "#c2410c" : "#fb923c",
                fontWeight: 500,
                whiteSpace: "nowrap",
              }}>
                Keep focusing daily
              </span>
            </div>
          </div>

        </div>

        {/* ── Logout (Fixed at bottom footer) ── */}
        <div style={{
          padding: "12px 16px",
          borderTop: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255,255,255,0.06)",
          flexShrink: 0,
        }}>
          <button
            onClick={() => setShowLogoutConfirm(true)}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 9,
              padding: "9px 12px",
              borderRadius: 10,
              border: "1px solid transparent",
              background: "transparent",
              color: isLight ? "#6B7280" : "#555",
              fontSize: "0.85rem",
              fontWeight: 500,
              cursor: "pointer",
              transition: "background 0.2s, color 0.2s, border-color 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(239,68,68,0.08)";
              e.currentTarget.style.color = "#f87171";
              e.currentTarget.style.borderColor = "rgba(239,68,68,0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = isLight ? "#6B7280" : "#555";
              e.currentTarget.style.borderColor = "transparent";
            }}
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>

        {/* ── Logout Confirmation Modal (Portal to Full Screen Body) ── */}
        {showLogoutConfirm && createPortal(
          <div style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.55)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999999,
          }}>
            <div style={{
              background: isLight ? "#ffffff" : "#161616",
              border: isLight ? "1px solid #e5e7eb" : "1px solid #2a2a2a",
              boxShadow: isLight 
                ? "0 10px 30px rgba(0,0,0,0.08)" 
                : "0 20px 50px rgba(0,0,0,0.5)",
              borderRadius: 20,
              padding: 24,
              width: "90%",
              maxWidth: 360,
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              gap: 16,
              animation: "fadeSlideDown 0.25s cubic-bezier(0.22, 1, 0.36, 1) forwards",
            }}>
              <div style={{
                width: 42,
                height: 42,
                borderRadius: "50%",
                background: "rgba(239, 68, 68, 0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto",
              }}>
                <LogOut size={20} color="#ef4444" />
              </div>

              <div>
                <h3 style={{
                  margin: 0,
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  color: isLight ? "#111827" : "#f3f4f6",
                }}>
                  Log Out
                </h3>
                <p style={{
                  margin: "6px 0 0",
                  fontSize: "0.85rem",
                  color: isLight ? "#6b7280" : "#9ca3af",
                }}>
                  Are you sure you want to log out of your session?
                </p>
              </div>

              <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 4 }}>
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  style={{
                    background: isLight ? "#f1f5f9" : "rgba(255,255,255,0.04)",
                    border: isLight ? "1px solid #cbd5e1" : "1px solid rgba(255,255,255,0.08)",
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
                  onClick={handleConfirmLogout}
                  style={{
                    background: "linear-gradient(135deg, #ef4444, #dc2626)",
                    border: "none",
                    color: "#ffffff",
                    padding: "9px 20px",
                    borderRadius: 50,
                    fontWeight: 600,
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    outline: "none",
                    boxShadow: "0 4px 12px rgba(239,68,68,0.3)",
                  }}
                >
                  Yes, Log Out
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
      </div>
    </>
  );
};