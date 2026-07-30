import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Clock, CheckCircle2, Flame, Target, TrendingUp,
  Calendar as CalendarIcon, BarChart3, BookOpen,
  CheckSquare, ChevronRight, Trophy, Play, Activity, ListTodo,
  RefreshCw, AlertCircle
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useTimer } from "../context/TimerContext";
import { getDashboardStats, logFocusSession } from "../services/activityService";

export default function Dashboard() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { focusLoop, focusTime, focusInitialTime, isFocusRunning } = useTimer();
  const isLight = theme === "light";

  // ── State ──
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [username, setUsername] = useState("User");
  const [activeTab, setActiveTab] = useState("thisWeek");
  const [hoveredDay, setHoveredDay] = useState(null);
  const [hoveredCell, setHoveredCell] = useState(null);

  // Track previous focusLoop to detect newly completed sessions
  const prevFocusLoopRef = useRef(focusLoop);

  // ── Fetch dashboard stats from backend ──
  const fetchStats = useCallback(async () => {
    try {
      setError(null);
      const data = await getDashboardStats();
      setStats(data);
    } catch (err) {
      setError("Could not load stats. Backend may be offline.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("username") || "User";
    setUsername(stored);
    fetchStats();
  }, [fetchStats]);

  // ── Auto-log focus session whenever focusLoop increments ──
  useEffect(() => {
    if (focusLoop > prevFocusLoopRef.current) {
      const newSessions = focusLoop - prevFocusLoopRef.current;
      const seconds = newSessions * 50 * 60; // 50 min per session
      logFocusSession(seconds, newSessions).then(() => {
        fetchStats(); // Refresh stats after logging
      });
    }
    prevFocusLoopRef.current = focusLoop;
  }, [focusLoop, fetchStats]);

  // ── Live focus time today (timer + DB stats combined) ──
  const liveFocusSecondsToday = useMemo(() => {
    const dbSeconds = stats?.focusSecondsToday || 0;
    const currentElapsed = isFocusRunning ? Math.max(0, focusInitialTime - focusTime) : 0;
    // focusLoop already counted in DB (logged above). Add only current in-progress session
    return dbSeconds + currentElapsed;
  }, [stats, focusTime, focusInitialTime, isFocusRunning]);

  const formattedFocusTime = useMemo(() => {
    const totalMins = Math.floor(liveFocusSecondsToday / 60);
    const hrs = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    if (hrs === 0 && mins === 0) return "0m";
    if (hrs === 0) return `${mins}m`;
    return `${hrs}h ${mins}m`;
  }, [liveFocusSecondsToday]);

  // ── Greeting ──
  const greetingData = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return { text: "Good Morning", icon: "🌅" };
    if (h < 17) return { text: "Good Afternoon", icon: "☀️" };
    return { text: "Good Evening", icon: "🌙" };
  }, []);

  // ── Daily Quote ──
  const quote = useMemo(() => {
    const quotes = [
      "\"Focus is a muscle. The more you practice, the stronger it gets.\"",
      "\"Small daily improvements over time lead to stunning results.\"",
      "\"You don't have to be extreme, just consistent.\"",
      "\"Do something today that your future self will thank you for.\"",
      "\"Concentrate all your thoughts upon the work in hand.\"",
    ];
    return quotes[new Date().getDate() % quotes.length];
  }, []);

  const formattedDate = useMemo(() =>
    new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" }),
    []);

  // ── Daily goal: 4 hours ──
  const dailyGoalPercent = useMemo(() =>
    Math.min(100, Math.round((liveFocusSecondsToday / (4 * 3600)) * 100)),
    [liveFocusSecondsToday]);

  // ── Heatmap: 12 months, fixed-size, real data ──
  const heatmapMonths = useMemo(() => {
    const heatmapData = stats?.heatmapData || {};
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const months = [];

    for (let i = 11; i >= 0; i--) {
      let m = currentMonth - i;
      let y = currentYear;
      if (m < 0) { m += 12; y -= 1; }

      const monthDate = new Date(y, m, 1);
      const monthName = monthDate.toLocaleDateString("en-US", { month: "short" });
      const daysInMonth = new Date(y, m + 1, 0).getDate();
      const firstDow = monthDate.getDay();
      const totalCells = Math.ceil((firstDow + daysInMonth) / 7) * 7;
      const cells = [];

      for (let c = 0; c < totalCells; c++) {
        const dayNum = c - firstDow + 1;
        const isValid = dayNum >= 1 && dayNum <= daysInMonth;
        const cellDate = isValid ? new Date(y, m, dayNum) : null;
        const isToday = cellDate ? cellDate.toDateString() === now.toDateString() : false;
        const isFuture = cellDate ? cellDate > now : false;

        let seconds = 0;
        if (isValid && cellDate && !isFuture) {
          const key = `${y}-${String(m + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
          seconds = heatmapData[key] || 0;
          if (isToday) seconds = Math.max(seconds, liveFocusSecondsToday);
        }

        const hours = seconds / 3600;
        let level = 0;
        if (hours > 0 && hours <= 1.5) level = 1;
        else if (hours > 1.5 && hours <= 3.5) level = 2;
        else if (hours > 3.5 && hours <= 5.5) level = 3;
        else if (hours > 5.5) level = 4;

        const dateStr = cellDate
          ? cellDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
          : "";
        const cellId = `${y}-${m}-${c}`;

        cells.push({ id: cellId, dayNum: isValid ? dayNum : null, dateStr, hours: hours.toFixed(1), level, isValid, isToday, isFuture });
      }

      // Group into columns of 7 (rows = Sun–Sat)
      const weeks = [];
      for (let w = 0; w < cells.length; w += 7) weeks.push(cells.slice(w, w + 7));

      months.push({ monthName, weeks });
    }
    return months;
  }, [stats, liveFocusSecondsToday]);

  const tileColor = (level) => {
    if (level === 0) return isLight ? "#e2e8f0" : "#262626";
    if (level === 1) return isLight ? "#9be9a8" : "#0e4429";
    if (level === 2) return isLight ? "#40c463" : "#006d32";
    if (level === 3) return isLight ? "#30a14e" : "#26a641";
    return "#2cbb5d";
  };

  // ── Weekly chart data ──
  const weeklyChartData = useMemo(() => {
    if (!stats?.weeklyData) return [];
    return stats.weeklyData.map((d) => {
      const dateObj = new Date(d.date);
      const isToday = dateObj.toDateString() === new Date().toDateString();
      const seconds = isToday ? Math.max(d.focusSeconds || 0, liveFocusSecondsToday) : (d.focusSeconds || 0);
      return {
        day: dateObj.toLocaleDateString("en-US", { weekday: "short" }),
        dateStr: dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        hours: parseFloat((seconds / 3600).toFixed(1)),
        isToday,
      };
    });
  }, [stats, liveFocusSecondsToday]);

  const maxHours = Math.max(...weeklyChartData.map((d) => d.hours), 1);

  // ── Category analytics (static for now, can be made dynamic) ──
  const categories = [
    { name: "React & Frontend", hours: 14.5, percent: 85, color: "#3b82f6", icon: "⚛️" },
    { name: "Data Structures & Algorithms", hours: 12.0, percent: 70, color: "#10b981", icon: "🧩" },
    { name: "Database Management (SQL)", hours: 8.5, percent: 55, color: "#8b5cf6", icon: "🗄️" },
    { name: "Operating Systems", hours: 6.0, percent: 40, color: "#f59e0b", icon: "💻" },
  ];

  // ── Achievements ──
  const badges = [
    { title: "7-Day Streak", icon: "🔥", unlocked: (stats?.currentStreak || 0) >= 7, color: "#f97316" },
    { title: "Focus Champion", icon: "🏆", unlocked: (stats?.tasksCompleted || 0) >= 10, color: "#eab308" },
    { title: "Early Bird", icon: "🌅", unlocked: true, color: "#06b6d4" },
    { title: "Marathoner", icon: "⚡", unlocked: liveFocusSecondsToday >= 4 * 3600, color: "#a855f7" },
  ];

  // ── Skeleton loader ──
  const Skeleton = ({ w = "100%", h = 28, r = 8 }) => (
    <div style={{ width: w, height: h, borderRadius: r, background: isLight ? "#e2e8f0" : "#27272a", animation: "pulse 1.5s ease infinite" }} />
  );

  // ── Shared card style ──
  const card = {
    background: isLight ? "#ffffff" : "#121215",
    border: `1px solid ${isLight ? "#e2e8f0" : "#222228"}`,
    borderRadius: 20,
    boxShadow: isLight ? "0 4px 20px rgba(15,23,42,0.03)" : "none",
  };

  return (
    <>
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
        .dash-in { animation: fadeUp 0.35s cubic-bezier(0.16,1,0.3,1) forwards; }
        .hov-card { transition: transform 0.18s ease, box-shadow 0.18s ease; }
        .hov-card:hover { transform: translateY(-2px); }
        .hov-tile:hover { transform: scale(1.3); z-index: 20; }

        /* ── Responsive helpers ── */
        .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
        .mid-grid   { display: grid; grid-template-columns: 1fr; gap: 20px; }
        .bot-grid   { display: grid; grid-template-columns: 1fr; gap: 20px; }

        @media (min-width: 640px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr); gap: 16px; }
        }
        @media (min-width: 1024px) {
          .stats-grid { grid-template-columns: repeat(4, 1fr); }
          .mid-grid   { grid-template-columns: 2fr 1fr; }
          .bot-grid   { grid-template-columns: 1fr 1fr 1fr; }
        }

        /* ── Fixed heatmap: 12 months in a fixed grid, no horizontal scroll ── */
        .heatmap-grid {
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          gap: 6px;
          width: 100%;
        }
        .heatmap-month { display: flex; flex-direction: column; align-items: center; gap: 3px; min-width: 0; }
        .heatmap-weeks { display: flex; gap: 1.5px; flex: 1; min-width: 0; }
        .heatmap-col   { display: flex; flex-direction: column; gap: 1.5px; }
        .heatmap-cell  {
          border-radius: 2px;
          aspect-ratio: 1;
          width: 100%;
          min-width: 3px;
          cursor: pointer;
          transition: transform 0.12s ease;
          position: relative;
        }

        /* Mobile heatmap: show only last 3 months */
        @media (max-width: 639px) {
          .heatmap-grid { grid-template-columns: repeat(3, 1fr); }
          .heatmap-hide-mobile { display: none; }
        }
        @media (min-width: 640px) and (max-width: 1023px) {
          .heatmap-grid { grid-template-columns: repeat(6, 1fr); }
          .heatmap-hide-tablet { display: none; }
        }

        .tooltip-box {
          position: absolute;
          bottom: calc(100% + 6px);
          left: 50%;
          transform: translateX(-50%);
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 10px;
          font-weight: 700;
          white-space: nowrap;
          pointer-events: none;
          z-index: 50;
          background: ${isLight ? "#0f172a" : "#f8fafc"};
          color: ${isLight ? "#fff" : "#0f172a"};
        }
      `}</style>

      <div className="dash-in w-full flex flex-col gap-4 sm:gap-6" style={{ color: isLight ? "#0f172a" : "#f8fafc" }}>

        {/* ── Error banner ── */}
        {error && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold"
            style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#ef4444" }}>
            <AlertCircle size={16} />
            {error}
            <button onClick={fetchStats} className="ml-auto flex items-center gap-1 underline text-xs">
              <RefreshCw size={12} /> Retry
            </button>
          </div>
        )}

        {/* ═══════════════════════════════════════════
            1. TOP ROW — Greeting
        ═══════════════════════════════════════════ */}
        <div className="hov-card flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl" style={card}>
          <div className="flex flex-col gap-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-2xl">{greetingData.icon}</span>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight">
                {greetingData.text}, <span style={{ color: "#3b82f6" }}>{username}</span>!
              </h1>
            </div>
            <p className="text-xs sm:text-sm italic opacity-70 truncate">{quote}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold"
              style={{ background: isLight ? "#f1f5f9" : "#1a1a20", border: `1px solid ${isLight ? "#cbd5e1" : "#2a2a34"}` }}>
              <CalendarIcon size={14} className="text-blue-500" />
              <span className="hidden sm:inline">{formattedDate}</span>
              <span className="sm:hidden">{new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
            </div>
            <button onClick={() => navigate("/focusbreak")}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white hover:scale-105 active:scale-95 transition-all"
              style={{ background: "linear-gradient(135deg,#3b82f6,#2563eb)", boxShadow: "0 4px 14px rgba(59,130,246,0.35)" }}>
              <Play size={14} fill="white" /> Focus
            </button>
          </div>
        </div>

        {/* ═══════════════════════════════════════════
            2. STATS CARDS (4 cards — real data)
        ═══════════════════════════════════════════ */}
        <div className="stats-grid">

          {/* Focus Time */}
          <div className="hov-card p-4 sm:p-5 rounded-2xl flex flex-col justify-between" style={card}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider opacity-60">Focus Time Today</span>
              <div className="p-2 rounded-xl" style={{ background: "rgba(59,130,246,0.12)" }}>
                <Clock size={16} className="text-blue-500" />
              </div>
            </div>
            <div className="mt-3">
              {loading ? <Skeleton w="80px" /> : (
                <div className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight">{formattedFocusTime}</div>
              )}
              <div className="flex items-center gap-1 mt-1 text-xs font-semibold text-emerald-500">
                <TrendingUp size={12} /><span>Live tracking</span>
              </div>
            </div>
          </div>

          {/* Tasks Completed */}
          <div className="hov-card p-4 sm:p-5 rounded-2xl flex flex-col justify-between" style={card}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider opacity-60">Tasks Done</span>
              <div className="p-2 rounded-xl" style={{ background: "rgba(16,185,129,0.12)" }}>
                <CheckCircle2 size={16} className="text-emerald-500" />
              </div>
            </div>
            <div className="mt-3">
              {loading ? <Skeleton w="70px" /> : (
                <div className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight">
                  {stats?.tasksCompleted ?? 0}
                  <span className="text-sm font-semibold opacity-40"> / {stats?.tasksTotal ?? 0}</span>
                </div>
              )}
              <div className="text-xs font-semibold text-emerald-500 mt-1">
                {stats?.tasksTotal ? Math.round((stats.tasksCompleted / stats.tasksTotal) * 100) : 0}% completion
              </div>
            </div>
          </div>

          {/* Streak */}
          <div className="hov-card p-4 sm:p-5 rounded-2xl flex flex-col justify-between" style={card}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider opacity-60">Current Streak</span>
              <div className="p-2 rounded-xl" style={{ background: "rgba(249,115,22,0.12)" }}>
                <Flame size={16} className="text-orange-500" />
              </div>
            </div>
            <div className="mt-3">
              {loading ? <Skeleton w="60px" /> : (
                <div className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-orange-500">
                  {stats?.currentStreak ?? 0}
                  <span className="text-sm font-semibold text-orange-400"> Days</span>
                </div>
              )}
              <div className="text-xs font-semibold opacity-60 mt-1">
                Best: {stats?.maxStreak ?? 0} days 🔥
              </div>
            </div>
          </div>

          {/* Daily Goal */}
          <div className="hov-card p-4 sm:p-5 rounded-2xl flex flex-col justify-between" style={card}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider opacity-60">Daily Goal</span>
              <div className="p-2 rounded-xl" style={{ background: "rgba(168,85,247,0.12)" }}>
                <Target size={16} className="text-purple-500" />
              </div>
            </div>
            <div className="mt-3">
              {loading ? <Skeleton w="70px" /> : (
                <div className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight">{dailyGoalPercent}%</div>
              )}
              <div className="w-full h-1.5 rounded-full mt-2 overflow-hidden" style={{ background: isLight ? "#e2e8f0" : "#27272a" }}>
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${dailyGoalPercent}%`, background: "linear-gradient(90deg,#a855f7,#6366f1)" }} />
              </div>
              <div className="text-[10px] opacity-50 mt-1 font-semibold">Goal: 4 hours/day</div>
            </div>
          </div>

        </div>

        {/* ═══════════════════════════════════════════
            3. FOCUSFLOW ACTIVITY HEATMAP (fixed size)
        ═══════════════════════════════════════════ */}
        <div className="hov-card p-4 sm:p-6 rounded-2xl flex flex-col gap-4" style={card}>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm sm:text-base font-extrabold flex items-center gap-2">
                <Activity size={16} className="text-emerald-500" />
                FocusFlow Activity
              </h3>
              <p className="text-[11px] font-semibold opacity-60 mt-0.5">
                {loading ? "Loading..." : `${stats?.totalActiveDays ?? 0} active days • ${stats?.totalHoursYear ?? 0}h total`}
              </p>
            </div>
            {/* Legend */}
            <div className="flex items-center gap-1.5 text-[10px] font-semibold opacity-70 flex-shrink-0">
              <span>Less</span>
              {[0,1,2,3,4].map(l => (
                <div key={l} style={{ width: 10, height: 10, borderRadius: 2, background: tileColor(l), flexShrink: 0 }} />
              ))}
              <span>More</span>
            </div>
          </div>

          {/* 12-month fixed grid */}
          <div className="heatmap-grid w-full">
            {heatmapMonths.map((month, mIdx) => {
              // On mobile show last 3 months, on tablet last 6
              const hideOnMobile = mIdx < 9;
              const hideOnTablet = mIdx < 6;
              return (
                <div
                  key={mIdx}
                  className={`heatmap-month ${hideOnMobile ? "heatmap-hide-mobile" : ""} ${!hideOnMobile && hideOnTablet ? "heatmap-hide-tablet" : ""}`}
                >
                  {/* Week columns */}
                  <div className="heatmap-weeks w-full">
                    {month.weeks.map((week, wIdx) => (
                      <div key={wIdx} className="heatmap-col flex-1">
                        {week.map((cell) => {
                          if (!cell.isValid) {
                            return <div key={cell.id} style={{ aspectRatio: 1, opacity: 0, minWidth: 3 }} />;
                          }
                          const isHov = hoveredCell === cell.id;
                          return (
                            <div
                              key={cell.id}
                              className="heatmap-cell hov-tile"
                              style={{
                                background: tileColor(cell.level),
                                opacity: cell.isFuture ? 0.15 : 1,
                                outline: cell.isToday ? "2px solid #10b981" : "none",
                                outlineOffset: 1,
                              }}
                              onMouseEnter={() => !cell.isFuture && setHoveredCell(cell.id)}
                              onMouseLeave={() => setHoveredCell(null)}
                            >
                              {isHov && (
                                <div className="tooltip-box">
                                  {cell.dateStr}: <span style={{ color: "#10b981" }}>{cell.hours}h</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                  {/* Month label */}
                  <span className="text-[9px] sm:text-[10px] font-bold opacity-55 mt-1">{month.monthName}</span>
                </div>
              );
            })}
          </div>

          {/* Bottom stats bar */}
          <div className="flex flex-wrap items-center justify-between pt-3 border-t text-xs font-semibold gap-y-1"
            style={{ borderColor: isLight ? "#e2e8f0" : "#27272a", opacity: 0.85 }}>
            <div className="flex flex-wrap gap-4">
              <span>🔥 Streak: <strong className="text-orange-500">{stats?.currentStreak ?? 0} Days</strong></span>
              <span>⚡ Active Days: <strong className="text-emerald-500">{stats?.totalActiveDays ?? 0}</strong></span>
            </div>
            <span className="text-[10px] opacity-50">Only real focus activity is shown</span>
          </div>
        </div>

        {/* ═══════════════════════════════════════════
            4. MID: Weekly Chart + Task Progress
        ═══════════════════════════════════════════ */}
        <div className="mid-grid">

          {/* Weekly Focus Bar Chart */}
          <div className="hov-card p-4 sm:p-6 rounded-2xl flex flex-col" style={card}>
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <h3 className="text-sm sm:text-base font-bold flex items-center gap-2">
                <BarChart3 size={16} className="text-blue-500" />
                Weekly Focus
              </h3>
              <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: isLight ? "#f1f5f9" : "#1a1a20" }}>
                {["thisWeek","lastWeek"].map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${activeTab === tab ? "bg-blue-600 text-white" : "opacity-60"}`}>
                    {tab === "thisWeek" ? "This Week" : "Last Week"}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-end gap-1.5 sm:gap-2 h-36 sm:h-44 pt-4">
              {(loading ? Array(7).fill({ day: "—", hours: 0, dateStr: "" }) : weeklyChartData).map((item, i) => {
                const pct = Math.max(8, Math.round((item.hours / maxHours) * 100));
                const isHov = hoveredDay === i;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end relative"
                    onMouseEnter={() => setHoveredDay(i)} onMouseLeave={() => setHoveredDay(null)}>
                    {isHov && !loading && (
                      <div className="absolute bottom-full mb-2 px-2 py-1 rounded-lg text-[11px] font-bold shadow-lg z-20 whitespace-nowrap"
                        style={{ background: isLight ? "#0f172a" : "#f8fafc", color: isLight ? "#fff" : "#0f172a" }}>
                        {item.dateStr}: <span className="text-blue-500">{item.hours}h</span>
                      </div>
                    )}
                    <div className="w-full rounded-t-lg transition-all duration-500 relative overflow-hidden"
                      style={{
                        height: `${pct}%`,
                        background: loading ? (isLight ? "#e2e8f0" : "#27272a") :
                          (item.isToday ? "linear-gradient(180deg,#3b82f6,#1d4ed8)" : (isLight ? "#e2e8f0" : "#27272a")),
                        boxShadow: item.isToday ? "0 4px 14px rgba(59,130,246,0.3)" : "none",
                        animation: loading ? "pulse 1.5s ease infinite" : "none",
                      }} />
                    <span className={`text-[10px] sm:text-xs font-bold ${item.isToday ? "text-blue-500" : "opacity-50"}`}>{item.day}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Task Progress Ring */}
          <div className="hov-card p-4 sm:p-6 rounded-2xl flex flex-col" style={card}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm sm:text-base font-bold flex items-center gap-2">
                <CheckSquare size={16} className="text-emerald-500" />
                Tasks
              </h3>
              <button onClick={() => navigate("/")} className="text-xs font-bold text-blue-500 flex items-center gap-0.5">
                All <ChevronRight size={13} />
              </button>
            </div>

            <div className="flex items-center justify-center flex-1 my-2">
              {loading ? (
                <div style={{ width: 110, height: 110, borderRadius: "50%", background: isLight ? "#e2e8f0" : "#27272a", animation: "pulse 1.5s ease infinite" }} />
              ) : (
                <div className="relative">
                  <svg width="110" height="110" className="-rotate-90">
                    <circle cx="55" cy="55" r="44" stroke={isLight ? "#e2e8f0" : "#27272a"} strokeWidth="8" fill="none" />
                    <circle cx="55" cy="55" r="44" stroke="#10b981" strokeWidth="8"
                      strokeDasharray={276.5}
                      strokeDashoffset={276.5 * (1 - (stats?.tasksTotal ? (stats.tasksCompleted / stats.tasksTotal) : 0))}
                      strokeLinecap="round" fill="none"
                      style={{ transition: "stroke-dashoffset 0.8s ease" }} />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-lg font-black">
                      {stats?.tasksTotal ? Math.round((stats.tasksCompleted / stats.tasksTotal) * 100) : 0}%
                    </span>
                    <span className="text-[9px] font-bold uppercase opacity-50">Done</span>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { label: "Pending", val: stats?.tasksPending ?? 0, color: "#f59e0b" },
                { label: "Done", val: stats?.tasksCompleted ?? 0, color: "#10b981" },
                { label: "Total", val: stats?.tasksTotal ?? 0, color: "#3b82f6" },
              ].map(({ label, val, color }) => (
                <div key={label} className="p-2 rounded-xl" style={{ background: isLight ? "#f8fafc" : "#18181c" }}>
                  <span className="block text-xs font-bold" style={{ color }}>{loading ? "—" : val}</span>
                  <span className="text-[9px] font-semibold opacity-55">{label}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ═══════════════════════════════════════════
            5. BOTTOM: Schedule + Subject Analytics + Achievements
        ═══════════════════════════════════════════ */}
        <div className="bot-grid">

          {/* Upcoming Schedule */}
          <div className="hov-card p-4 sm:p-6 rounded-2xl flex flex-col gap-3" style={card}>
            <h3 className="text-sm sm:text-base font-bold flex items-center gap-2">
              <ListTodo size={16} className="text-blue-500" />
              Upcoming
            </h3>
            {[
              { title: "Review State Management PR", time: "2:30 PM", priority: "High" },
              { title: "Solve 2 LeetCode Problems", time: "5:00 PM", priority: "Med" },
              { title: "DBMS Indexing Video", time: "7:30 PM", priority: "Normal" },
              { title: "Weekly Retrospective", time: "Tomorrow, 10 AM", priority: "High" },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl"
                style={{ background: isLight ? "#f8fafc" : "#18181c", border: `1px solid ${isLight ? "#f1f5f9" : "#22222a"}` }}>
                <div className="min-w-0">
                  <p className="text-xs font-bold truncate">{item.title}</p>
                  <p className="text-[10px] opacity-55 font-semibold">{item.time}</p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold flex-shrink-0 ml-2"
                  style={{
                    background: item.priority === "High" ? "rgba(239,68,68,0.12)" : "rgba(59,130,246,0.12)",
                    color: item.priority === "High" ? "#ef4444" : "#3b82f6",
                  }}>
                  {item.priority}
                </span>
              </div>
            ))}
          </div>

          {/* Subject Analytics */}
          <div className="hov-card p-4 sm:p-6 rounded-2xl flex flex-col gap-3" style={card}>
            <h3 className="text-sm sm:text-base font-bold flex items-center gap-2">
              <BookOpen size={16} className="text-purple-500" />
              Subject Analytics
            </h3>
            <div className="flex flex-col gap-3.5 flex-1 justify-center">
              {categories.map((cat, i) => (
                <div key={i} className="flex flex-col gap-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="flex items-center gap-1 truncate">{cat.icon} {cat.name}</span>
                    <span className="opacity-60 flex-shrink-0 ml-1">{cat.percent}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: isLight ? "#e2e8f0" : "#27272a" }}>
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${cat.percent}%`, background: cat.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Achievements */}
          <div className="hov-card p-4 sm:p-6 rounded-2xl flex flex-col gap-3" style={card}>
            <div className="flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-bold flex items-center gap-2">
                <Trophy size={16} className="text-yellow-500" />
                Achievements
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: "rgba(234,179,8,0.12)", color: "#eab308" }}>Level 5</span>
            </div>

            {/* XP bar */}
            <div className="p-3 rounded-xl" style={{ background: isLight ? "#f8fafc" : "#18181c" }}>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span>Deep Work Master</span>
                <span className="text-yellow-500">2,450 / 3,000 XP</span>
              </div>
              <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: isLight ? "#e2e8f0" : "#27272a" }}>
                <div className="h-full rounded-full" style={{ width: "81%", background: "linear-gradient(90deg,#f59e0b,#eab308)" }} />
              </div>
            </div>

            {/* Badges */}
            <div className="grid grid-cols-2 gap-2">
              {badges.map((b, i) => (
                <div key={i} className={`flex items-center gap-2 p-2.5 rounded-xl border ${b.unlocked ? "" : "opacity-35 grayscale"}`}
                  style={{ background: isLight ? "#fff" : "#18181c", borderColor: isLight ? "#f1f5f9" : "#27272a" }}>
                  <span className="text-base flex-shrink-0">{b.icon}</span>
                  <span className="text-[10px] font-bold truncate leading-tight">{b.title}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </>
  );
}