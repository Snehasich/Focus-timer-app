import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Clock,
  CheckCircle2,
  Flame,
  Target,
  TrendingUp,
  Calendar as CalendarIcon,
  Sparkles,
  Award,
  BarChart3,
  BookOpen,
  CheckSquare,
  ChevronRight,
  Trophy,
  Play,
  Activity,
  Zap,
  ListTodo
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useTimer } from "../context/TimerContext";

export default function Dashboard() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { focusLoop, focusTime, focusInitialTime, isFocusRunning } = useTimer();

  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("User");
  const [streakCount, setStreakCount] = useState(1);
  const [activeTab, setActiveTab] = useState("thisWeek");
  const [hoveredDay, setHoveredDay] = useState(null);
  const [hoveredCell, setHoveredCell] = useState(null);

  const isLight = theme === "light";

  // ── Initial Setup & Skeleton Timer ──
  useEffect(() => {
    const storedName = localStorage.getItem("username") || "User";
    setUsername(storedName);

    const storedStreak = parseInt(localStorage.getItem("focusflow_streak") || "1", 10);
    setStreakCount(storedStreak);

    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  // ── Greeting Logic ──
  const greetingData = useMemo(() => {
    const hour = new Date().getHours();
    let text = "Good Morning";
    let icon = "🌅";
    if (hour >= 12 && hour < 17) {
      text = "Good Afternoon";
      icon = "☀️";
    } else if (hour >= 17 || hour < 5) {
      text = "Good Evening";
      icon = "🌙";
    }
    return { text, icon };
  }, []);

  // ── Curated Motivational Quotes ──
  const randomQuote = useMemo(() => {
    const quotes = [
      "“Focus is a muscle. The more you practice, the stronger it gets.”",
      "“Small daily improvements over time lead to stunning results.”",
      "“You don't have to be extreme, just consistent.”",
      "“Do something today that your future self will thank you for.”",
      "“Concentrate all your thoughts upon the work in hand.”"
    ];
    const dayIndex = new Date().getDate() % quotes.length;
    return quotes[dayIndex];
  }, []);

  // ── Today's Date Formatting ──
  const formattedDate = useMemo(() => {
    const now = new Date();
    return now.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }, []);

  // ── Calculated Real Focus Time Today ──
  const totalFocusSecondsToday = useMemo(() => {
    const loopSeconds = focusLoop * (50 * 60);
    const currentElapsed = isFocusRunning ? Math.max(0, focusInitialTime - focusTime) : 0;
    return loopSeconds + currentElapsed;
  }, [focusLoop, focusTime, focusInitialTime, isFocusRunning]);

  const formattedFocusTime = useMemo(() => {
    const totalMins = Math.floor(totalFocusSecondsToday / 60);
    const hrs = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    if (hrs === 0) return `${mins}m`;
    return `${hrs}h ${mins}m`;
  }, [totalFocusSecondsToday]);

  // Daily goal: 4 hours (14,400 seconds)
  const dailyGoalSeconds = 4 * 3600;
  const dailyGoalPercent = Math.min(100, Math.round((totalFocusSecondsToday / dailyGoalSeconds) * 100));

  // ── Mock Tasks Data & Progress ──
  const tasksSummary = useMemo(() => {
    return {
      completed: 12,
      pending: 4,
      highPriority: 2,
      total: 16,
      completionRate: 75,
    };
  }, []);

  // ── Weekly Focus Chart Data (Mon - Sun) ──
  const weeklyData = useMemo(() => {
    if (activeTab === "thisWeek") {
      return [
        { day: "Mon", hours: 3.5, date: "Jul 20" },
        { day: "Tue", hours: 4.2, date: "Jul 21" },
        { day: "Wed", hours: 2.8, date: "Jul 22" },
        { day: "Thu", hours: 5.0, date: "Jul 23" },
        { day: "Fri", hours: 4.5, date: "Jul 24" },
        { day: "Sat", hours: 3.0, date: "Jul 25" },
        { day: "Sun", hours: parseFloat((totalFocusSecondsToday / 3600).toFixed(1)), isToday: true, date: "Jul 26" },
      ];
    } else {
      return [
        { day: "Mon", hours: 2.5, date: "Jul 13" },
        { day: "Tue", hours: 3.8, date: "Jul 14" },
        { day: "Wed", hours: 4.0, date: "Jul 15" },
        { day: "Thu", hours: 3.2, date: "Jul 16" },
        { day: "Fri", hours: 4.8, date: "Jul 17" },
        { day: "Sat", hours: 2.0, date: "Jul 18" },
        { day: "Sun", hours: 3.5, date: "Jul 19" },
      ];
    }
  }, [activeTab, totalFocusSecondsToday]);

  const maxWeeklyHours = Math.max(...weeklyData.map((d) => parseFloat(d.hours) || 1), 6);

  // ── AUTHENTIC LEETCODE MONTHLY HEATMAP GENERATOR (12 MONTH BLOCKS) ──
  const leetcodeMonthlyData = useMemo(() => {
    const months = [];
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-11

    let totalActiveDays = 0;
    let totalHours = 0;

    // Generate 12 consecutive months ending with current month
    for (let i = 11; i >= 0; i--) {
      let m = currentMonth - i;
      let y = currentYear;
      if (m < 0) {
        m += 12;
        y -= 1;
      }

      const monthDate = new Date(y, m, 1);
      const monthName = monthDate.toLocaleDateString("en-US", { month: "short" });
      const daysInMonth = new Date(y, m + 1, 0).getDate();
      const firstDayOfWeek = monthDate.getDay(); // 0: Sun ... 6: Sat

      // Calculate cells in 7-row month grid
      const totalCells = Math.ceil((firstDayOfWeek + daysInMonth) / 7) * 7;
      const days = [];

      for (let c = 0; c < totalCells; c++) {
        const dayNum = c - firstDayOfWeek + 1;
        const isValidDay = dayNum >= 1 && dayNum <= daysInMonth;
        const cellDate = isValidDay ? new Date(y, m, dayNum) : null;
        const isToday = cellDate ? cellDate.toDateString() === now.toDateString() : false;
        const isFuture = cellDate ? cellDate > now : false;

        let hours = 0;
        let level = 0;

        if (isValidDay && !isFuture) {
          const dateHash = y * 1000 + m * 50 + dayNum;
          if (dateHash % 3 !== 0) {
            hours = parseFloat(((dateHash % 7) * 0.9).toFixed(1));
          }
          if (isToday) {
            hours = parseFloat((totalFocusSecondsToday / 3600).toFixed(1));
          }

          if (hours > 0) {
            totalActiveDays++;
            totalHours += hours;
            if (hours <= 1.5) level = 1;
            else if (hours <= 3.5) level = 2;
            else if (hours <= 5.5) level = 3;
            else level = 4;
          }
        }

        days.push({
          id: `${y}-${m}-${c}`,
          dayNum: isValidDay ? dayNum : null,
          dateStr: cellDate ? cellDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "",
          hours: hours.toFixed(1),
          level,
          isValidDay,
          isToday,
          isFuture,
        });
      }

      // Group days into columns of 7 days (Sun-Sat)
      const weeksInMonth = [];
      for (let w = 0; w < days.length; w += 7) {
        weeksInMonth.push(days.slice(w, w + 7));
      }

      months.push({
        monthName,
        year: y,
        weeks: weeksInMonth,
      });
    }

    return {
      months,
      totalActiveDays,
      totalHours: totalHours.toFixed(1),
      maxStreak: 18,
    };
  }, [totalFocusSecondsToday]);

  // Authentic LeetCode Green Palette Mapping
  const getLeetCodeTileColor = (level, isLightMode) => {
    if (level === 0) return isLightMode ? "#ebedf0" : "#262626";
    if (level === 1) return isLightMode ? "#9be9a8" : "#0e4429";
    if (level === 2) return isLightMode ? "#40c463" : "#006d32";
    if (level === 3) return isLightMode ? "#30a14e" : "#26a641";
    return "#2cbb5d"; // Bright LeetCode neon green
  };

  // ── Subject / Category Analytics ──
  const categories = [
    { name: "React & Frontend", hours: 14.5, percent: 85, color: "#3b82f6", icon: "⚛️" },
    { name: "Data Structures & Algorithms", hours: 12.0, percent: 70, color: "#10b981", icon: "🧩" },
    { name: "Database Management (SQL)", hours: 8.5, percent: 55, color: "#8b5cf6", icon: "🗄️" },
    { name: "Operating Systems & Networking", hours: 6.0, percent: 40, color: "#f59e0b", icon: "💻" },
  ];

  // ── Upcoming Schedule Items ──
  const upcomingSchedule = [
    { id: 1, title: "Review State Management PR", time: "02:30 PM", type: "task", priority: "High" },
    { id: 2, title: "Solve 2 LeetCode Medium Problems", time: "05:00 PM", type: "task", priority: "Med" },
    { id: 3, title: "DBMS Indexing Architecture Video", time: "07:30 PM", type: "event", priority: "Normal" },
    { id: 4, title: "Weekly Sprint Retrospective", time: "Tomorrow, 10:00 AM", type: "event", priority: "High" },
  ];

  // ── Achievements & Gamification Data ──
  const achievementBadges = [
    { id: 1, title: "7-Day Streak", desc: "Maintained 7 consecutive focus days", icon: "🔥", unlocked: true, color: "#f97316" },
    { id: 2, title: "Focus Champion", desc: "Completed 50+ pomodoro sessions", icon: "🏆", unlocked: true, color: "#eab308" },
    { id: 3, title: "Early Bird", desc: "Started a session before 7:00 AM", icon: "🌅", unlocked: true, color: "#06b6d4" },
    { id: 4, title: "Marathoner", desc: "4+ hours focused in a single day", icon: "⚡", unlocked: false, color: "#a855f7" },
  ];

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        .dashboard-container {
          animation: fadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          font-family: inherit;
        }

        .dash-card {
          transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease, border-color 0.2s ease;
        }
        .dash-card:hover {
          transform: translateY(-2px);
        }

        .leetcode-grid::-webkit-scrollbar {
          height: 6px;
        }
        .leetcode-grid::-webkit-scrollbar-track {
          background: transparent;
        }
        .leetcode-grid::-webkit-scrollbar-thumb {
          background: ${isLight ? "#cbd5e1" : "#333338"};
          border-radius: 4px;
        }

        .skeleton {
          background: ${isLight 
            ? "linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 37%, #f1f5f9 63%)" 
            : "linear-gradient(90deg, #18181b 25%, #27272a 37%, #18181b 63%)"};
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
        }
      `}</style>

      <div
        className="dashboard-container w-full min-h-screen flex flex-col gap-6"
        style={{
          color: isLight ? "#0f172a" : "#f8fafc",
          boxSizing: "border-box",
        }}
      >
        {/* ── 1. TOP ROW: Greeting & Header ── */}
        <div
          className="dash-card flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl"
          style={{
            background: isLight 
              ? "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)" 
              : "linear-gradient(135deg, #121215 0%, #0d0d10 100%)",
            border: isLight ? "1px solid #e2e8f0" : "1px solid #222228",
            boxShadow: isLight ? "0 4px 20px rgba(15,23,42,0.03)" : "0 10px 30px rgba(0,0,0,0.4)",
            borderRadius: 20,
          }}
        >
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{greetingData.icon}</span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: isLight ? "#0f172a" : "#ffffff" }}>
                {greetingData.text}, <span style={{ color: "#3b82f6" }}>{username}</span>!
              </h1>
            </div>
            <p className="text-xs sm:text-sm font-medium opacity-75 italic" style={{ color: isLight ? "#475569" : "#94a3b8" }}>
              {randomQuote}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl"
              style={{
                background: isLight ? "#f1f5f9" : "#1a1a20",
                border: isLight ? "1px solid #cbd5e1" : "1px solid #2a2a34",
              }}
            >
              <CalendarIcon size={16} className="text-blue-500" />
              <span className="text-xs sm:text-sm font-semibold opacity-90">{formattedDate}</span>
            </div>

            <button
              onClick={() => navigate("/focusbreak")}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white transition-all hover:scale-105 active:scale-95 shadow-md"
              style={{
                background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                boxShadow: "0 4px 14px rgba(59, 130, 246, 0.35)",
              }}
            >
              <Play size={15} fill="white" />
              Start Focus
            </button>
          </div>
        </div>

        {/* ── 2. STATISTICS CARDS (4 Cards Grid) ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Total Focus Time */}
          <div
            className="dash-card p-5 rounded-2xl flex flex-col justify-between"
            style={{
              background: isLight ? "#ffffff" : "#121215",
              border: isLight ? "1px solid #e2e8f0" : "1px solid #222228",
              borderRadius: 20,
              boxShadow: isLight ? "0 4px 16px rgba(15,23,42,0.02)" : "none",
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider opacity-60">Focus Time Today</span>
              <div className="p-2.5 rounded-xl" style={{ background: "rgba(59, 130, 246, 0.12)" }}>
                <Clock size={20} className="text-blue-500" />
              </div>
            </div>
            <div className="mt-3">
              {loading ? (
                <div className="h-8 w-28 skeleton rounded-lg mb-2" />
              ) : (
                <div className="text-2xl sm:text-3xl font-black tracking-tight">{formattedFocusTime}</div>
              )}
              <div className="flex items-center gap-1 mt-1 text-xs font-semibold text-emerald-500">
                <TrendingUp size={14} />
                <span>+14% vs yesterday</span>
              </div>
            </div>
          </div>

          {/* Card 2: Tasks Completed */}
          <div
            className="dash-card p-5 rounded-2xl flex flex-col justify-between"
            style={{
              background: isLight ? "#ffffff" : "#121215",
              border: isLight ? "1px solid #e2e8f0" : "1px solid #222228",
              borderRadius: 20,
              boxShadow: isLight ? "0 4px 16px rgba(15,23,42,0.02)" : "none",
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider opacity-60">Tasks Completed</span>
              <div className="p-2.5 rounded-xl" style={{ background: "rgba(16, 185, 129, 0.12)" }}>
                <CheckCircle2 size={20} className="text-emerald-500" />
              </div>
            </div>
            <div className="mt-3">
              {loading ? (
                <div className="h-8 w-24 skeleton rounded-lg mb-2" />
              ) : (
                <div className="text-2xl sm:text-3xl font-black tracking-tight">
                  {tasksSummary.completed} <span className="text-sm font-semibold opacity-50">/ {tasksSummary.total}</span>
                </div>
              )}
              <div className="flex items-center gap-1 mt-1 text-xs font-semibold text-emerald-500">
                <span>{tasksSummary.completionRate}% completion rate</span>
              </div>
            </div>
          </div>

          {/* Card 3: Current Streak */}
          <div
            className="dash-card p-5 rounded-2xl flex flex-col justify-between"
            style={{
              background: isLight ? "#ffffff" : "#121215",
              border: isLight ? "1px solid #e2e8f0" : "1px solid #222228",
              borderRadius: 20,
              boxShadow: isLight ? "0 4px 16px rgba(15,23,42,0.02)" : "none",
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider opacity-60">Current Streak</span>
              <div className="p-2.5 rounded-xl" style={{ background: "rgba(249, 115, 22, 0.12)" }}>
                <Flame size={20} className="text-orange-500" />
              </div>
            </div>
            <div className="mt-3">
              {loading ? (
                <div className="h-8 w-24 skeleton rounded-lg mb-2" />
              ) : (
                <div className="text-2xl sm:text-3xl font-black tracking-tight text-orange-500">
                  {streakCount} <span className="text-sm font-semibold text-orange-400">Days</span>
                </div>
              )}
              <div className="flex items-center gap-1 mt-1 text-xs font-semibold opacity-70">
                <span>Active daily momentum 🔥</span>
              </div>
            </div>
          </div>

          {/* Card 4: Daily Goal Progress */}
          <div
            className="dash-card p-5 rounded-2xl flex flex-col justify-between"
            style={{
              background: isLight ? "#ffffff" : "#121215",
              border: isLight ? "1px solid #e2e8f0" : "1px solid #222228",
              borderRadius: 20,
              boxShadow: isLight ? "0 4px 16px rgba(15,23,42,0.02)" : "none",
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider opacity-60">Daily Goal</span>
              <div className="p-2.5 rounded-xl" style={{ background: "rgba(168, 85, 247, 0.12)" }}>
                <Target size={20} className="text-purple-500" />
              </div>
            </div>
            <div className="mt-3">
              {loading ? (
                <div className="h-8 w-28 skeleton rounded-lg mb-2" />
              ) : (
                <div className="text-2xl sm:text-3xl font-black tracking-tight">
                  {dailyGoalPercent}%
                </div>
              )}
              {/* Progress bar */}
              <div className="w-full h-2 rounded-full mt-2 overflow-hidden" style={{ background: isLight ? "#e2e8f0" : "#22222c" }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${dailyGoalPercent}%`,
                    background: "linear-gradient(90deg, #a855f7, #6366f1)",
                  }}
                />
              </div>
            </div>
          </div>

        </div>

        {/* ── 3. AUTHENTIC LEETCODE 12-MONTH ACTIVITY HEATMAP ── */}
        <div
          className="dash-card p-6 rounded-2xl flex flex-col justify-between"
          style={{
            background: isLight ? "#ffffff" : "#121215",
            border: isLight ? "1px solid #e2e8f0" : "1px solid #222228",
            borderRadius: 20,
            boxShadow: isLight ? "0 4px 20px rgba(15,23,42,0.03)" : "none",
          }}
        >
          {/* Header Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-200 dark:border-zinc-800">
            <div>
              <h3 className="text-base font-extrabold flex items-center gap-2 tracking-tight">
                <Activity size={18} className="text-emerald-500" />
                LeetCode Activity Heatmap
              </h3>
              <p className="text-xs font-semibold opacity-60 mt-0.5">
                {leetcodeMonthlyData.totalActiveDays} active focus days in the last year • {leetcodeMonthlyData.totalHours} hrs total
              </p>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-1.5 text-[11px] font-semibold opacity-80">
              <span>Less</span>
              <span className="w-3 h-3 rounded-[2.5px]" style={{ background: getLeetCodeTileColor(0, isLight) }} />
              <span className="w-3 h-3 rounded-[2.5px]" style={{ background: getLeetCodeTileColor(1, isLight) }} />
              <span className="w-3 h-3 rounded-[2.5px]" style={{ background: getLeetCodeTileColor(2, isLight) }} />
              <span className="w-3 h-3 rounded-[2.5px]" style={{ background: getLeetCodeTileColor(3, isLight) }} />
              <span className="w-3 h-3 rounded-[2.5px]" style={{ background: getLeetCodeTileColor(4, isLight) }} />
              <span>More</span>
            </div>
          </div>

          {/* 12-Month LeetCode Blocks Grid View */}
          <div className="leetcode-grid w-full overflow-x-auto pb-2 pt-1">
            <div className="flex gap-3 justify-start min-w-max">
              {leetcodeMonthlyData.months.map((monthObj, mIdx) => (
                <div key={mIdx} className="flex flex-col items-center gap-2 flex-shrink-0">
                  {/* Month Matrix Grid (7 rows x N weeks) */}
                  <div className="flex gap-1">
                    {monthObj.weeks.map((week, wIdx) => (
                      <div key={wIdx} className="flex flex-col gap-1">
                        {week.map((cell) => {
                          if (!cell.isValidDay) {
                            return (
                              <div
                                key={cell.id}
                                className="w-3 h-3 rounded-[2.5px] opacity-0 pointer-events-none"
                              />
                            );
                          }

                          const tileBg = getLeetCodeTileColor(cell.level, isLight);
                          const isHovered = hoveredCell === cell.id;

                          return (
                            <div
                              key={cell.id}
                              className={`w-3 h-3 rounded-[2.5px] transition-all cursor-pointer relative ${
                                cell.isToday ? "ring-2 ring-emerald-400 ring-offset-1 dark:ring-offset-zinc-950" : ""
                              } ${cell.isFuture ? "opacity-25 pointer-events-none" : "hover:scale-125 hover:z-30"}`}
                              style={{ background: tileBg }}
                              onMouseEnter={() => setHoveredCell(cell.id)}
                              onMouseLeave={() => setHoveredCell(null)}
                            >
                              {/* Hover Tooltip */}
                              {isHovered && (
                                <div
                                  className="absolute -top-10 left-1/2 transform -translate-x-1/2 px-2.5 py-1 rounded-md text-[11px] font-extrabold shadow-2xl z-50 whitespace-nowrap pointer-events-none"
                                  style={{
                                    background: isLight ? "#0f172a" : "#f8fafc",
                                    color: isLight ? "#ffffff" : "#0f172a",
                                  }}
                                >
                                  {cell.dateStr}: <span className="text-emerald-500">{cell.hours}h focused</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>

                  {/* Month Label at Bottom */}
                  <span className="text-[11px] font-bold opacity-60">
                    {monthObj.monthName}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom LeetCode Summary Bar */}
          <div className="flex flex-wrap items-center justify-between pt-3 mt-3 border-t border-slate-200 dark:border-zinc-800 text-xs font-semibold opacity-80 gap-2">
            <div className="flex items-center gap-5">
              <span>🔥 Active Streak: <strong className="text-orange-500">{streakCount} Days</strong></span>
              <span>🏆 Max Streak: <strong className="text-emerald-500">{leetcodeMonthlyData.maxStreak} Days</strong></span>
              <span>⚡ Active Days: <strong className="text-blue-500">{leetcodeMonthlyData.totalActiveDays} Days</strong></span>
            </div>
            <span className="text-[11px] opacity-60">
              Synced with your focus sessions and daily logins
            </span>
          </div>

        </div>

        {/* ── 4. MIDDLE SECTION: Weekly Chart & Task Progress ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Weekly Focus Chart (2 Cols) */}
          <div
            className="dash-card lg:col-span-2 p-6 rounded-2xl flex flex-col justify-between"
            style={{
              background: isLight ? "#ffffff" : "#121215",
              border: isLight ? "1px solid #e2e8f0" : "1px solid #222228",
              borderRadius: 20,
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold flex items-center gap-2">
                  <BarChart3 size={18} className="text-blue-500" />
                  Weekly Focus Analytics
                </h3>
                <p className="text-xs opacity-60 font-medium">Hours focused per day</p>
              </div>

              <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: isLight ? "#f1f5f9" : "#1a1a20" }}>
                <button
                  onClick={() => setActiveTab("thisWeek")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    activeTab === "thisWeek"
                      ? "bg-blue-600 text-white shadow-sm"
                      : isLight ? "text-slate-600 hover:text-slate-900" : "text-slate-400 hover:text-white"
                  }`}
                >
                  This Week
                </button>
                <button
                  onClick={() => setActiveTab("lastWeek")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    activeTab === "lastWeek"
                      ? "bg-blue-600 text-white shadow-sm"
                      : isLight ? "text-slate-600 hover:text-slate-900" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Last Week
                </button>
              </div>
            </div>

            {/* Bar Chart Container */}
            <div className="h-52 w-full flex items-end justify-between gap-2 pt-6 px-2">
              {weeklyData.map((item, idx) => {
                const heightPercent = Math.max(12, Math.round((item.hours / maxWeeklyHours) * 100));
                const isHovered = hoveredDay === idx;

                return (
                  <div
                    key={idx}
                    className="flex-1 flex flex-col items-center gap-2 h-full justify-end relative group cursor-pointer"
                    onMouseEnter={() => setHoveredDay(idx)}
                    onMouseLeave={() => setHoveredDay(null)}
                  >
                    {/* Tooltip */}
                    {isHovered && (
                      <div
                        className="absolute -top-10 px-2.5 py-1 rounded-lg text-xs font-bold shadow-lg z-20 whitespace-nowrap animate-in fade-in zoom-in-95 duration-150"
                        style={{
                          background: isLight ? "#0f172a" : "#f8fafc",
                          color: isLight ? "#ffffff" : "#0f172a",
                        }}
                      >
                        {item.date}: <span className="text-blue-500">{item.hours}h</span>
                      </div>
                    )}

                    {/* Bar Pill */}
                    <div
                      className="w-full max-w-[42px] rounded-t-xl transition-all duration-300 relative overflow-hidden"
                      style={{
                        height: `${heightPercent}%`,
                        background: item.isToday
                          ? "linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%)"
                          : isLight ? (isHovered ? "#cbd5e1" : "#e2e8f0") : (isHovered ? "#3f3f46" : "#27272a"),
                        boxShadow: item.isToday ? "0 4px 14px rgba(59,130,246,0.3)" : "none",
                      }}
                    >
                      {item.isToday && (
                        <div className="absolute inset-0 bg-white/20 animate-pulse" />
                      )}
                    </div>

                    {/* Label */}
                    <span className={`text-xs font-bold ${item.isToday ? "text-blue-500 font-extrabold" : "opacity-60"}`}>
                      {item.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 5. Task Progress & Circular Widget (1 Col) */}
          <div
            className="dash-card p-6 rounded-2xl flex flex-col justify-between"
            style={{
              background: isLight ? "#ffffff" : "#121215",
              border: isLight ? "1px solid #e2e8f0" : "1px solid #222228",
              borderRadius: 20,
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold flex items-center gap-2">
                <CheckSquare size={18} className="text-emerald-500" />
                Task Overview
              </h3>
              <button
                onClick={() => navigate("/")}
                className="text-xs font-bold text-blue-500 hover:underline flex items-center gap-0.5"
              >
                View all <ChevronRight size={14} />
              </button>
            </div>

            {/* Circular Progress Ring */}
            <div className="flex flex-col items-center justify-center my-3 relative">
              <svg width="140" height="140" className="transform -rotate-90">
                <circle
                  cx="70"
                  cy="70"
                  r="56"
                  stroke={isLight ? "#e2e8f0" : "#27272a"}
                  strokeWidth="10"
                  fill="transparent"
                />
                <circle
                  cx="70"
                  cy="70"
                  r="56"
                  stroke="#10b981"
                  strokeWidth="10"
                  strokeDasharray={351.8}
                  strokeDashoffset={351.8 * (1 - tasksSummary.completionRate / 100)}
                  strokeLinecap="round"
                  fill="transparent"
                  style={{ transition: "stroke-dashoffset 0.8s ease" }}
                />
              </svg>

              <div className="absolute flex flex-col items-center">
                <span className="text-2xl font-black">{tasksSummary.completionRate}%</span>
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">Completed</span>
              </div>
            </div>

            {/* Task Stats Pills */}
            <div className="grid grid-cols-3 gap-2 text-center mt-1">
              <div className="p-2 rounded-xl" style={{ background: isLight ? "#f8fafc" : "#18181c" }}>
                <span className="block text-xs font-bold text-amber-500">{tasksSummary.pending}</span>
                <span className="text-[10px] font-semibold opacity-60">Pending</span>
              </div>
              <div className="p-2 rounded-xl" style={{ background: isLight ? "#f8fafc" : "#18181c" }}>
                <span className="block text-xs font-bold text-emerald-500">{tasksSummary.completed}</span>
                <span className="text-[10px] font-semibold opacity-60">Done</span>
              </div>
              <div className="p-2 rounded-xl" style={{ background: isLight ? "#f8fafc" : "#18181c" }}>
                <span className="block text-xs font-bold text-rose-500">{tasksSummary.highPriority}</span>
                <span className="text-[10px] font-semibold opacity-60">High Pri</span>
              </div>
            </div>
          </div>

        </div>

        {/* ── 5. BOTTOM SECTION: Schedule, AI Insights, Achievements, Subject Analytics ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* 7. Upcoming Schedule */}
          <div
            className="dash-card p-6 rounded-2xl flex flex-col justify-between"
            style={{
              background: isLight ? "#ffffff" : "#121215",
              border: isLight ? "1px solid #e2e8f0" : "1px solid #222228",
              borderRadius: 20,
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold flex items-center gap-2">
                <ListTodo size={18} className="text-blue-500" />
                Upcoming Schedule
              </h3>
              <span className="text-xs font-semibold text-blue-500">{upcomingSchedule.length} upcoming</span>
            </div>

            <div className="flex flex-col gap-2.5">
              {upcomingSchedule.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl flex items-center justify-between transition-colors"
                  style={{
                    background: isLight ? "#f8fafc" : "#18181c",
                    border: isLight ? "1px solid #f1f5f9" : "1px solid #22222a",
                  }}
                >
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-xs font-bold truncate">{item.title}</span>
                    <span className="text-[10px] font-semibold opacity-60">{item.time}</span>
                  </div>
                  <span
                    className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                    style={{
                      background: item.priority === "High" ? "rgba(239, 68, 68, 0.15)" : "rgba(59, 130, 246, 0.15)",
                      color: item.priority === "High" ? "#ef4444" : "#3b82f6",
                    }}
                  >
                    {item.priority}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 6. Subject Analytics */}
          <div
            className="dash-card p-6 rounded-2xl flex flex-col justify-between"
            style={{
              background: isLight ? "#ffffff" : "#121215",
              border: isLight ? "1px solid #e2e8f0" : "1px solid #222228",
              borderRadius: 20,
            }}
          >
            <h3 className="text-base font-bold flex items-center gap-2 mb-3">
              <BookOpen size={18} className="text-purple-500" />
              Subject Analytics
            </h3>

            <div className="flex flex-col gap-3.5">
              {categories.map((cat, i) => (
                <div key={i} className="flex flex-col gap-1">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="flex items-center gap-1.5">
                      <span>{cat.icon}</span> {cat.name}
                    </span>
                    <span className="opacity-70">{cat.hours}h ({cat.percent}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: isLight ? "#e2e8f0" : "#27272a" }}>
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${cat.percent}%`, background: cat.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 9. Achievements & Gamification Section */}
          <div
            className="dash-card p-6 rounded-2xl flex flex-col justify-between"
            style={{
              background: isLight ? "#ffffff" : "#121215",
              border: isLight ? "1px solid #e2e8f0" : "1px solid #222228",
              borderRadius: 20,
            }}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold flex items-center gap-2">
                  <Trophy size={18} className="text-yellow-500" />
                  Achievements
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-yellow-500/10 text-yellow-500">
                  Level 5
                </span>
              </div>

              {/* Level XP Bar */}
              <div className="p-3 rounded-xl mb-4" style={{ background: isLight ? "#f8fafc" : "#18181c" }}>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span>Deep Work Master</span>
                  <span className="text-yellow-500">2,450 / 3,000 XP</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-zinc-800 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full w-[81%]" />
                </div>
              </div>

              {/* Badges Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                {achievementBadges.map((badge) => (
                  <div
                    key={badge.id}
                    className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                      badge.unlocked ? "opacity-100" : "opacity-40 grayscale"
                    }`}
                    style={{
                      background: isLight ? "#ffffff" : "#18181c",
                      borderColor: isLight ? "#f1f5f9" : "#27272a",
                    }}
                  >
                    <span className="text-lg">{badge.icon}</span>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold truncate">{badge.title}</span>
                      <span className="text-[9px] font-semibold opacity-60 truncate">{badge.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 text-xs font-semibold opacity-70 border-t border-slate-200 dark:border-zinc-800">
              <span>Next Badge: Marathoner</span>
              <span className="text-purple-500 font-bold">3/5 Sessions</span>
            </div>
          </div>

        </div>

      </div>
    </>
  );
}