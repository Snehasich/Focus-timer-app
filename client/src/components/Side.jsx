import { useLocation, useNavigate } from "react-router-dom";
import { Timer, House, TimerReset, LayoutDashboard, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { logout } from "../services/authService";
import { useTheme } from "../context/ThemeContext";

export const Side = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState("Username");
  const [greetingVisible, setGreetingVisible] = useState(false);
  const [nameVisible, setNameVisible] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const { theme } = useTheme();

  useEffect(() => {
    const stored = localStorage.getItem("username") || "Username";
    setUsername(stored);

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
      `}</style>

      <div 
        className="h-screen w-[241px] flex flex-col transition-colors duration-200"
        style={{
          background: isLight ? "#f1f5f9" : "#0f0f0f",
          borderRight: isLight ? "1px solid #cbd5e1" : "1px solid #1c1c1c"
        }}
      >
        <div className="flex flex-col gap-4 p-6 flex-1">

          {/* ── Greeting Glass Card ── */}
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            padding: "14px 10px",
            marginBottom: 4,
            borderRadius: 14,
            background: isLight ? "rgba(0, 0, 0, 0.03)" : "rgba(255, 255, 255, 0.04)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: isLight ? "1px solid rgba(0, 0, 0, 0.06)" : "1px solid rgba(255, 255, 255, 0.08)",
            boxShadow: isLight ? "0 4px 20px rgba(0,0,0,0.02)" : "0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)",
          }}>
            {/* Avatar */}
            <div
              className="avatar-pulse"
              style={{
                width: 36, height: 36,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.85rem", fontWeight: 700, color: "#fff",
              }}
            >
              {getInitials(username)}
            </div>

            {/* Typewriter name */}
            <span
              className={nameVisible ? "name-in" : ""}
              style={{
                color: isLight ? "#111827" : "#e5e7eb",
                fontSize: "0.85rem",
                fontWeight: 600,
                letterSpacing: "-0.1px",
                opacity: nameVisible ? 1 : 0,
                textAlign: "center",
              }}
            >
              {displayName}
              {displayName.length < username.length && (
                <span className="cursor-blink" style={{ color: "#60a5fa" }}>|</span>
              )}
            </span>
          </div>

          {/* ── Nav Buttons ── */}
          <button onClick={() => navigate("/")} className={getClass("/")}>
            <House size={18} /> Home
          </button>

          <button onClick={() => navigate("/focusbreak")} className={getClass("/focusbreak")}>
            <Timer size={18} /> Timer
          </button>

          <button onClick={() => navigate("/stopwatch")} className={getClass("/stopwatch")}>
            <TimerReset size={18} /> StopWatch
          </button>

          <button onClick={() => navigate("/dashboard")} className={getClass("/dashboard")}>
            <LayoutDashboard size={18} /> Dashboard
          </button>

          {/* spacer */}
          <div className="flex-1" />

        </div>

        {/* ── Logout ── */}
        <div style={{
          padding: "12px 16px",
          borderTop: isLight ? "1px solid #cbd5e1" : "1px solid rgba(255,255,255,0.06)",
        }}>
          <button
            onClick={() => { logout(); navigate("/login"); }}
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
      </div>
    </>
  );
};