import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Clock, CheckCircle2, Flame, Target, TrendingUp,
  Calendar as CalendarIcon, BarChart3, BookOpen,
  CheckSquare, ChevronRight, Trophy, Play, Activity, ListTodo,
  RefreshCw, AlertCircle, Wifi, WifiOff
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useTimer } from "../context/TimerContext";
import { getDashboardStats, logFocusSession } from "../services/activityService";

export default function Dashboard() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { focusLoop, focusTime, focusInitialTime, isFocusRunning } = useTimer();
  const isLight = theme === "light";

  const [stats, setStats]           = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [backendOnline, setBackendOnline] = useState(null); // null = checking
  const [username, setUsername]     = useState("User");
  const [activeTab, setActiveTab]   = useState("thisWeek");
  const [hoveredDay, setHoveredDay] = useState(null);
  const [hoveredCell, setHoveredCell] = useState(null);

  const prevFocusLoopRef = useRef(focusLoop);

  // ── Fetch stats & check backend ──
  const fetchStats = useCallback(async () => {
    try {
      setError(null);
      const data = await getDashboardStats();
      setStats(data);
      setBackendOnline(true);
    } catch (err) {
      const status = err?.response?.status;
      // 401/403 = backend online but auth failed → still "online"
      if (status === 401 || status === 403) {
        setBackendOnline(true);
        setError("Session expired. Please log in again.");
      } else {
        setBackendOnline(false);
        setError("Backend offline — showing local data only.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setUsername(localStorage.getItem("username") || "User");
    fetchStats();
  }, [fetchStats]);

  // Auto-log when a focus session completes
  useEffect(() => {
    if (focusLoop > prevFocusLoopRef.current) {
      const diff = focusLoop - prevFocusLoopRef.current;
      logFocusSession(diff * 50 * 60, diff).then(fetchStats);
    }
    prevFocusLoopRef.current = focusLoop;
  }, [focusLoop, fetchStats]);

  // ── Live focus seconds today ──
  const liveFocusSecondsToday = useMemo(() => {
    const db = stats?.focusSecondsToday || 0;
    const live = isFocusRunning ? Math.max(0, focusInitialTime - focusTime) : 0;
    return db + live;
  }, [stats, focusTime, focusInitialTime, isFocusRunning]);

  const fmtTime = (s) => {
    const m = Math.floor(s / 60), h = Math.floor(m / 60), r = m % 60;
    if (h === 0 && r === 0) return "0m";
    if (h === 0) return `${r}m`;
    return `${h}h ${r}m`;
  };

  // ── Greeting ──
  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return { text: "Good Morning", icon: "🌅" };
    if (h < 17) return { text: "Good Afternoon", icon: "☀️" };
    return { text: "Good Evening", icon: "🌙" };
  }, []);

  const quote = useMemo(() => {
    const qs = [
      "Focus is the art of knowing what to ignore.",
      "Small steps every day lead to big results.",
      "Consistency beats intensity every time.",
      "Do the work. The results will come.",
      "Concentrate all your thoughts upon the work at hand.",
    ];
    return qs[new Date().getDate() % qs.length];
  }, []);

  const fmtDate = useMemo(() =>
    new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" }), []);

  const dailyGoalPct = Math.min(100, Math.round((liveFocusSecondsToday / (4 * 3600)) * 100));

  // ─────────────────────────────────────────────────────────
  //  LEETCODE-STYLE 52-WEEK CONTINUOUS HEATMAP
  //  • grid-auto-flow: column  →  days flow top-to-bottom per week
  //  • weeks flow left to right (52-53 columns)
  //  • Month labels sit above the first week of each month
  // ─────────────────────────────────────────────────────────
  const heatmapData = useMemo(() => {
    const hm = stats?.heatmapData || {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Go back exactly 364 days (52 full weeks) from today
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 363); // 364 days inclusive = 52 weeks

    // Align start to Sunday (LeetCode starts week on Sunday)
    const startDow = startDate.getDay(); // 0=Sun
    startDate.setDate(startDate.getDate() - startDow);

    // Build array of all days from startDate to today
    const days = [];
    const cursor = new Date(startDate);
    while (cursor <= today) {
      const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}-${String(cursor.getDate()).padStart(2, "0")}`;
      const isToday = cursor.toDateString() === today.toDateString();
      const isFuture = cursor > today;
      let seconds = isFuture ? 0 : (hm[key] || 0);
      if (isToday) seconds = Math.max(seconds, liveFocusSecondsToday);

      const hrs = seconds / 3600;
      let level = 0;
      if (hrs > 0 && hrs <= 1.5) level = 1;
      else if (hrs > 1.5 && hrs <= 3) level = 2;
      else if (hrs > 3 && hrs <= 5) level = 3;
      else if (hrs > 5) level = 4;

      days.push({
        date: new Date(cursor),
        key,
        seconds,
        level,
        isToday,
        isFuture,
        dateStr: cursor.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
      });
      cursor.setDate(cursor.getDate() + 1);
    }

    // Group into weeks (7-day columns)
    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }

    // Compute month labels (attach to week index where month first appears)
    const monthLabels = {}; // weekIndex → monthName
    weeks.forEach((week, wi) => {
      week.forEach((day) => {
        if (day.date.getDate() === 1 || wi === 0) {
          if (!monthLabels[wi]) {
            monthLabels[wi] = day.date.toLocaleDateString("en-US", { month: "short" });
          }
        }
      });
    });

    return { weeks, monthLabels };
  }, [stats, liveFocusSecondsToday]);

  const tileColor = (level, future) => {
    if (future) return isLight ? "#f1f5f9" : "#1a1a1a";
    if (level === 0) return isLight ? "#ebedf0" : "#262626";
    if (level === 1) return isLight ? "#9be9a8" : "#0e4429";
    if (level === 2) return isLight ? "#40c463" : "#006d32";
    if (level === 3) return isLight ? "#30a14e" : "#26a641";
    return "#2cbb5d";
  };

  // ── Weekly chart ──
  const weeklyChartData = useMemo(() => {
    if (!stats?.weeklyData) return Array(7).fill({ day: "—", hours: 0, isToday: false, dateStr: "" });
    return stats.weeklyData.map((d) => {
      const dt = new Date(d.date);
      const isToday = dt.toDateString() === new Date().toDateString();
      const secs = isToday ? Math.max(d.focusSeconds || 0, liveFocusSecondsToday) : (d.focusSeconds || 0);
      return {
        day: dt.toLocaleDateString("en-US", { weekday: "short" }),
        dateStr: dt.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        hours: parseFloat((secs / 3600).toFixed(1)),
        isToday,
      };
    });
  }, [stats, liveFocusSecondsToday]);

  const maxHours = Math.max(...weeklyChartData.map((d) => d.hours), 1);

  // ── Shared styles ──
  const card = {
    background: isLight ? "#ffffff" : "#111114",
    border: `1px solid ${isLight ? "#e2e8f0" : "#222228"}`,
    borderRadius: 18,
    boxShadow: isLight ? "0 2px 16px rgba(15,23,42,0.04)" : "none",
  };

  const categories = [
    { name: "React & Frontend", percent: 85, color: "#3b82f6", icon: "⚛️" },
    { name: "Data Structures", percent: 70, color: "#10b981", icon: "🧩" },
    { name: "Databases (SQL)", percent: 55, color: "#8b5cf6", icon: "🗄️" },
    { name: "OS & Networks", percent: 40, color: "#f59e0b", icon: "💻" },
  ];

  const badges = [
    { title: "7-Day Streak", icon: "🔥", unlocked: (stats?.currentStreak || 0) >= 7 },
    { title: "10 Tasks Done", icon: "🏆", unlocked: (stats?.tasksCompleted || 0) >= 10 },
    { title: "Early Bird", icon: "🌅", unlocked: true },
    { title: "4h Focus Day", icon: "⚡", unlocked: liveFocusSecondsToday >= 4 * 3600 },
  ];

  // ── Skeleton pill ──
  const SK = ({ w = "80px", h = 24 }) => (
    <div style={{ width: w, height: h, borderRadius: 6, background: isLight ? "#e2e8f0" : "#27272a",
      animation: "skpulse 1.5s ease infinite" }} />
  );

  const taskPct = stats?.tasksTotal ? Math.round((stats.tasksCompleted / stats.tasksTotal) * 100) : 0;

  return (
    <>
      <style>{`
        @keyframes fadeUp   { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes skpulse  { 0%,100%{opacity:1} 50%{opacity:.45} }

        .dash-root { animation: fadeUp 0.3s cubic-bezier(.16,1,.3,1) forwards; }
        .hov-lift   { transition: transform .18s ease, box-shadow .18s ease; }
        .hov-lift:hover { transform: translateY(-2px); }

        /* stats grid */
        .stats-g { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
        @media(min-width:1024px){ .stats-g { grid-template-columns:repeat(4,1fr); gap:16px; } }

        /* mid row */
        .mid-g { display:grid; grid-template-columns:1fr; gap:16px; }
        @media(min-width:1024px){ .mid-g { grid-template-columns:2fr 1fr; } }

        /* bottom row */
        .bot-g { display:grid; grid-template-columns:1fr; gap:16px; }
        @media(min-width:768px)  { .bot-g { grid-template-columns:1fr 1fr; } }
        @media(min-width:1024px) { .bot-g { grid-template-columns:1fr 1fr 1fr; } }

        /* ── LeetCode-style heatmap ── */
        .lc-wrap {
          width: 100%;
          overflow-x: auto;
          overflow-y: hidden;
          padding-bottom: 4px;
        }
        .lc-wrap::-webkit-scrollbar { height: 4px; }
        .lc-wrap::-webkit-scrollbar-thumb { background: ${isLight ? "#cbd5e1" : "#333"}; border-radius: 4px; }

        .lc-inner  { display: inline-flex; flex-direction: column; gap: 0; min-width: max-content; }

        /* Month label row */
        .lc-months { display: flex; gap: 2.5px; margin-bottom: 4px; height: 14px; }
        .lc-mlabel { font-size: 10px; font-weight: 700; opacity: 0.55;
                     color: ${isLight ? "#475569" : "#94a3b8"}; }

        /* Day-of-week + grid row */
        .lc-body  { display: flex; gap: 4px; align-items: flex-start; }
        .lc-dow   { display: flex; flex-direction: column; gap: 2.5px; margin-right: 4px; }
        .lc-dow-label { height: 11px; font-size: 9px; font-weight: 700; opacity: 0.45;
                        color: ${isLight ? "#475569" : "#94a3b8"}; line-height: 11px; }

        /* The 52-week grid */
        .lc-grid {
          display: grid;
          grid-auto-flow: column;
          grid-template-rows: repeat(7, 11px);
          gap: 2.5px;
        }

        .lc-cell {
          width: 11px; height: 11px;
          border-radius: 2px;
          cursor: pointer;
          position: relative;
          transition: transform .1s ease, outline .1s ease;
        }
        .lc-cell:hover { transform: scale(1.35); z-index: 30; }

        /* Tooltip */
        .lc-tip {
          position: absolute;
          bottom: calc(100% + 6px);
          left: 50%;
          transform: translateX(-50%);
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 10px; font-weight: 700;
          white-space: nowrap;
          pointer-events: none;
          z-index: 60;
          background: ${isLight ? "#0f172a" : "#f8fafc"};
          color: ${isLight ? "#fff" : "#0f172a"};
          box-shadow: 0 4px 12px rgba(0,0,0,.25);
        }
        .lc-tip::after {
          content: "";
          position: absolute;
          top: 100%; left: 50%;
          transform: translateX(-50%);
          border: 4px solid transparent;
          border-top-color: ${isLight ? "#0f172a" : "#f8fafc"};
        }
      `}</style>

      <div className="dash-root w-full flex flex-col gap-4 sm:gap-5"
        style={{ color: isLight ? "#0f172a" : "#f8fafc" }}>

        {/* ── Backend status banner ── */}
        {backendOnline !== null && (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold"
            style={{
              background: backendOnline ? "rgba(16,185,129,0.09)" : "rgba(239,68,68,0.09)",
              border: `1px solid ${backendOnline ? "rgba(16,185,129,0.25)" : "rgba(239,68,68,0.25)"}`,
              color: backendOnline ? "#10b981" : "#ef4444",
            }}>
            {backendOnline ? <Wifi size={13} /> : <WifiOff size={13} />}
            {backendOnline
              ? "Backend connected — all stats are live & synced to your account"
              : "Backend offline — stats shown from local session only"}
            {!backendOnline && (
              <button onClick={fetchStats}
                className="ml-auto flex items-center gap-1 underline opacity-80 hover:opacity-100">
                <RefreshCw size={11} /> Retry
              </button>
            )}
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold"
            style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444" }}>
            <AlertCircle size={13} />{error}
          </div>
        )}

        {/* ══════════════════════════════════════
            1. TOP — Greeting
        ══════════════════════════════════════ */}
        <div className="hov-lift flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl" style={card}>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xl sm:text-2xl">{greeting.icon}</span>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight">
                {greeting.text}, <span style={{ color: "#3b82f6" }}>{username}</span>!
              </h1>
            </div>
            <p className="text-xs sm:text-sm italic opacity-60 mt-1 truncate max-w-lg">"{quote}"</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold"
              style={{ background: isLight ? "#f1f5f9" : "#1c1c20", border: `1px solid ${isLight ? "#cbd5e1" : "#2a2a34"}` }}>
              <CalendarIcon size={13} className="text-blue-500" />
              {fmtDate}
            </div>
            <button onClick={() => navigate("/focusbreak")}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white hover:scale-105 active:scale-95 transition-all"
              style={{ background: "linear-gradient(135deg,#3b82f6,#2563eb)", boxShadow: "0 4px 14px rgba(59,130,246,.3)" }}>
              <Play size={13} fill="white" /> Start Focus
            </button>
          </div>
        </div>

        {/* ══════════════════════════════════════
            2. STATS CARDS — real data
        ══════════════════════════════════════ */}
        <div className="stats-g">
          {[
            {
              label: "Focus Today", icon: <Clock size={15} className="text-blue-500" />, iconBg: "rgba(59,130,246,.12)",
              value: loading ? null : fmtTime(liveFocusSecondsToday),
              sub: <span className="text-emerald-500 flex items-center gap-1"><TrendingUp size={11}/>Live tracking</span>,
            },
            {
              label: "Tasks Done", icon: <CheckCircle2 size={15} className="text-emerald-500" />, iconBg: "rgba(16,185,129,.12)",
              value: loading ? null : `${stats?.tasksCompleted ?? 0} / ${stats?.tasksTotal ?? 0}`,
              sub: <span className="text-emerald-500">{taskPct}% completion</span>,
            },
            {
              label: "Streak", icon: <Flame size={15} className="text-orange-500" />, iconBg: "rgba(249,115,22,.12)",
              value: loading ? null : `${stats?.currentStreak ?? 0} Days`,
              valueColor: "#f97316",
              sub: <span className="opacity-60">Best: {stats?.maxStreak ?? 0} days 🔥</span>,
            },
            {
              label: "Daily Goal", icon: <Target size={15} className="text-purple-500" />, iconBg: "rgba(168,85,247,.12)",
              value: loading ? null : `${dailyGoalPct}%`,
              sub: (
                <div>
                  <div className="w-full h-1.5 rounded-full overflow-hidden mt-1" style={{ background: isLight ? "#e2e8f0" : "#27272a" }}>
                    <div className="h-full rounded-full" style={{ width: `${dailyGoalPct}%`, background: "linear-gradient(90deg,#a855f7,#6366f1)", transition: "width .7s ease" }} />
                  </div>
                  <span className="opacity-40 text-[10px]">Goal: 4h / day</span>
                </div>
              ),
            },
          ].map(({ label, icon, iconBg, value, sub, valueColor }, i) => (
            <div key={i} className="hov-lift p-4 sm:p-5 rounded-2xl flex flex-col gap-2" style={card}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider opacity-55">{label}</span>
                <div className="p-2 rounded-xl" style={{ background: iconBg }}>{icon}</div>
              </div>
              {loading
                ? <SK w="70px" h={28} />
                : <div className="text-lg sm:text-xl lg:text-2xl font-black tracking-tight" style={valueColor ? { color: valueColor } : {}}>{value}</div>
              }
              <div className="text-xs font-semibold">{sub}</div>
            </div>
          ))}
        </div>

        {/* ══════════════════════════════════════
            3. LEETCODE-STYLE ACTIVITY HEATMAP
        ══════════════════════════════════════ */}
        <div className="hov-lift p-4 sm:p-6 rounded-2xl flex flex-col gap-4" style={card}>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm sm:text-base font-extrabold flex items-center gap-2">
                <Activity size={15} className="text-emerald-500" />
                FocusFlow Activity
                <span className="text-[10px] font-semibold opacity-50 normal-case">last 52 weeks</span>
              </h3>
              <p className="text-[11px] font-semibold opacity-55 mt-0.5">
                {loading
                  ? "Loading your activity..."
                  : `${stats?.totalActiveDays ?? 0} active days in the last year • ${stats?.totalHoursYear ?? 0} hrs total`
                }
              </p>
            </div>
            {/* Legend */}
            <div className="flex items-center gap-1.5 text-[10px] font-bold opacity-65 flex-shrink-0">
              <span>Less</span>
              {[0,1,2,3,4].map(l => (
                <div key={l} title={["No activity","≤1.5h","≤3h","≤5h","5h+"][l]}
                  style={{ width:11, height:11, borderRadius:2, background:tileColor(l,false), flexShrink:0 }} />
              ))}
              <span>More</span>
            </div>
          </div>

          {/* ── The actual LeetCode grid ── */}
          <div className="lc-wrap">
            <div className="lc-inner">
              {/* Month labels row */}
              <div className="lc-months">
                {heatmapData.weeks.map((week, wi) => (
                  <div key={wi} style={{ width: 11, flexShrink: 0 }}>
                    {heatmapData.monthLabels[wi] && (
                      <span className="lc-mlabel">{heatmapData.monthLabels[wi]}</span>
                    )}
                  </div>
                ))}
              </div>

              {/* Day labels + grid */}
              <div className="lc-body">
                {/* Day-of-week labels (Sun Mon … Sat) */}
                <div className="lc-dow">
                  {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d, i) => (
                    <div key={d} className="lc-dow-label"
                      style={{ visibility: i % 2 === 1 ? "visible" : "hidden" }}>
                      {d}
                    </div>
                  ))}
                </div>

                {/* Grid — 52 columns × 7 rows, auto-flow column */}
                <div className="lc-grid">
                  {heatmapData.weeks.map((week) =>
                    week.map((day) => {
                      const isHov = hoveredCell === day.key;
                      return (
                        <div
                          key={day.key}
                          className="lc-cell"
                          style={{
                            background: tileColor(day.level, day.isFuture),
                            outline: day.isToday ? "2px solid #10b981" : "none",
                            outlineOffset: "1px",
                            opacity: day.isFuture ? 0 : 1,
                          }}
                          onMouseEnter={() => !day.isFuture && setHoveredCell(day.key)}
                          onMouseLeave={() => setHoveredCell(null)}
                        >
                          {isHov && (
                            <div className="lc-tip">
                              {day.dateStr} —{" "}
                              {day.seconds > 0
                                ? <span style={{ color: "#2cbb5d" }}>{fmtTime(day.seconds)} focused</span>
                                : <span style={{ opacity: 0.6 }}>No activity</span>
                              }
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom stats row — LeetCode style */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1 pt-3 border-t text-xs font-bold"
            style={{ borderColor: isLight ? "#e2e8f0" : "#27272a" }}>
            <span>🔥 Current Streak: <strong className="text-orange-500">{stats?.currentStreak ?? 0} Days</strong></span>
            <span>🏆 Max Streak: <strong className="text-yellow-500">{stats?.maxStreak ?? 0} Days</strong></span>
            <span>⚡ Active Days: <strong className="text-emerald-500">{stats?.totalActiveDays ?? 0}</strong></span>
            <span className="ml-auto text-[10px] font-semibold opacity-40">
              {backendOnline ? "Synced with your account" : "Local session only"}
            </span>
          </div>
        </div>

        {/* ══════════════════════════════════════
            4. MID — Weekly Chart + Task Ring
        ══════════════════════════════════════ */}
        <div className="mid-g">
          {/* Weekly bar chart */}
          <div className="hov-lift p-4 sm:p-6 rounded-2xl flex flex-col" style={card}>
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <h3 className="text-sm sm:text-base font-bold flex items-center gap-2">
                <BarChart3 size={15} className="text-blue-500" />
                Weekly Focus
              </h3>
              <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: isLight ? "#f1f5f9" : "#1c1c20" }}>
                {["thisWeek","lastWeek"].map(t => (
                  <button key={t} onClick={() => setActiveTab(t)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${activeTab === t ? "bg-blue-600 text-white" : "opacity-50 hover:opacity-80"}`}>
                    {t === "thisWeek" ? "This Week" : "Last Week"}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-end gap-1.5 sm:gap-2 h-36 sm:h-44 pt-4 relative">
              {weeklyChartData.map((item, i) => {
                const pct = Math.max(6, Math.round((item.hours / maxHours) * 100));
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end relative"
                    onMouseEnter={() => setHoveredDay(i)} onMouseLeave={() => setHoveredDay(null)}>
                    {hoveredDay === i && !loading && (
                      <div className="absolute bottom-full mb-2 px-2 py-1 rounded-lg text-[11px] font-bold shadow-lg z-20 whitespace-nowrap pointer-events-none"
                        style={{ background: isLight ? "#0f172a" : "#f8fafc", color: isLight ? "#fff" : "#0f172a" }}>
                        {item.dateStr}: <span className="text-blue-400">{item.hours}h</span>
                      </div>
                    )}
                    <div className="w-full rounded-t-lg transition-all duration-500"
                      style={{
                        height: `${pct}%`,
                        background: loading
                          ? (isLight ? "#e2e8f0" : "#27272a")
                          : (item.isToday
                            ? "linear-gradient(180deg,#3b82f6,#1d4ed8)"
                            : (isLight ? "#e2e8f0" : "#27272a")),
                        boxShadow: item.isToday ? "0 4px 14px rgba(59,130,246,.3)" : "none",
                        animation: loading ? "skpulse 1.5s ease infinite" : "none",
                      }} />
                    <span className={`text-[10px] sm:text-xs font-bold ${item.isToday ? "text-blue-500" : "opacity-45"}`}>{item.day}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Task ring */}
          <div className="hov-lift p-4 sm:p-6 rounded-2xl flex flex-col gap-3" style={card}>
            <div className="flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-bold flex items-center gap-2">
                <CheckSquare size={15} className="text-emerald-500" />Tasks
              </h3>
              <button onClick={() => navigate("/")} className="text-xs font-bold text-blue-500 flex items-center gap-0.5">
                All <ChevronRight size={13} />
              </button>
            </div>
            <div className="flex items-center justify-center flex-1 py-2">
              {loading
                ? <div style={{ width:110,height:110,borderRadius:"50%",background:isLight?"#e2e8f0":"#27272a",animation:"skpulse 1.5s ease infinite"}} />
                : (
                  <div className="relative">
                    <svg width="110" height="110" className="-rotate-90">
                      <circle cx="55" cy="55" r="44" stroke={isLight?"#e2e8f0":"#27272a"} strokeWidth="8" fill="none"/>
                      <circle cx="55" cy="55" r="44" stroke="#10b981" strokeWidth="8"
                        strokeDasharray={276.5}
                        strokeDashoffset={276.5 * (1 - taskPct / 100)}
                        strokeLinecap="round" fill="none"
                        style={{ transition: "stroke-dashoffset .8s ease" }}/>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-xl font-black">{taskPct}%</span>
                      <span className="text-[9px] uppercase font-bold opacity-50">Done</span>
                    </div>
                  </div>
                )
              }
            </div>
            <div className="grid grid-cols-3 gap-1.5 text-center">
              {[
                { l: "Pending", v: stats?.tasksPending ?? 0, c: "#f59e0b" },
                { l: "Done",    v: stats?.tasksCompleted ?? 0, c: "#10b981" },
                { l: "Total",   v: stats?.tasksTotal ?? 0,  c: "#3b82f6" },
              ].map(({ l, v, c }) => (
                <div key={l} className="p-2 rounded-xl" style={{ background: isLight ? "#f8fafc" : "#19191d" }}>
                  <span className="block text-xs font-black" style={{ color: c }}>{loading ? "—" : v}</span>
                  <span className="text-[9px] font-semibold opacity-50">{l}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════
            5. BOTTOM — Schedule + Analytics + Achievements
        ══════════════════════════════════════ */}
        <div className="bot-g">
          {/* Schedule */}
          <div className="hov-lift p-4 sm:p-6 rounded-2xl flex flex-col gap-3" style={card}>
            <h3 className="text-sm sm:text-base font-bold flex items-center gap-2">
              <ListTodo size={15} className="text-blue-500" />Upcoming
            </h3>
            {[
              { title:"Review State Management PR",  time:"2:30 PM",      pri:"High" },
              { title:"Solve 2 LeetCode Problems",   time:"5:00 PM",      pri:"Med"  },
              { title:"DBMS Indexing Video",         time:"7:30 PM",      pri:"Normal"},
              { title:"Weekly Retrospective",        time:"Tomorrow 10AM",pri:"High" },
            ].map((item,i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl gap-2"
                style={{ background: isLight?"#f8fafc":"#19191d", border:`1px solid ${isLight?"#f1f5f9":"#222228"}` }}>
                <div className="min-w-0">
                  <p className="text-xs font-bold truncate">{item.title}</p>
                  <p className="text-[10px] opacity-50 font-semibold">{item.time}</p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold flex-shrink-0"
                  style={{
                    background: item.pri==="High"?"rgba(239,68,68,.12)":"rgba(59,130,246,.12)",
                    color: item.pri==="High"?"#ef4444":"#3b82f6",
                  }}>{item.pri}</span>
              </div>
            ))}
          </div>

          {/* Subject analytics */}
          <div className="hov-lift p-4 sm:p-6 rounded-2xl flex flex-col gap-4" style={card}>
            <h3 className="text-sm sm:text-base font-bold flex items-center gap-2">
              <BookOpen size={15} className="text-purple-500" />Subject Analytics
            </h3>
            <div className="flex flex-col gap-3.5">
              {categories.map((c,i) => (
                <div key={i} className="flex flex-col gap-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="flex items-center gap-1.5">{c.icon}{c.name}</span>
                    <span className="opacity-55">{c.percent}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: isLight?"#e2e8f0":"#27272a" }}>
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width:`${c.percent}%`, background:c.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Achievements */}
          <div className="hov-lift p-4 sm:p-6 rounded-2xl flex flex-col gap-3" style={card}>
            <div className="flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-bold flex items-center gap-2">
                <Trophy size={15} className="text-yellow-500" />Achievements
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                style={{ background:"rgba(234,179,8,.12)", color:"#eab308" }}>Level 5</span>
            </div>
            {/* XP */}
            <div className="p-3 rounded-xl" style={{ background:isLight?"#f8fafc":"#19191d" }}>
              <div className="flex justify-between text-xs font-bold mb-1.5">
                <span>Deep Work Master</span>
                <span className="text-yellow-500">2,450 / 3,000 XP</span>
              </div>
              <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background:isLight?"#e2e8f0":"#27272a" }}>
                <div style={{ width:"81%",height:"100%",borderRadius:99,background:"linear-gradient(90deg,#f59e0b,#eab308)" }} />
              </div>
            </div>
            {/* Badges */}
            <div className="grid grid-cols-2 gap-2">
              {badges.map((b,i) => (
                <div key={i}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border ${b.unlocked?"":"opacity-35 grayscale"}`}
                  style={{ background:isLight?"#fff":"#19191d", borderColor:isLight?"#f1f5f9":"#27272a" }}>
                  <span className="text-base flex-shrink-0">{b.icon}</span>
                  <span className="text-[10px] font-bold leading-tight truncate">{b.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </>
  );
}