import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, CheckCircle2 } from "lucide-react";

export const CalendarView = () => {
  const { theme } = useTheme();
  const isLight = theme === "light";

  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const today = new Date();
  const isToday = (d) =>
    d === today.getDate() &&
    month === today.getMonth() &&
    year === today.getFullYear();

  const totalDays = daysInMonth(year, month);
  const startDay = firstDayOfMonth(year, month);

  return (
    <div
      style={{
        height: "100vh",
        padding: "clamp(12px, 3vw, 24px)",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <div
        style={{
          background: isLight ? "#ffffff" : "#111111",
          border: isLight ? "1px solid #e5e7eb" : "1px solid #222222",
          borderRadius: 24,
          padding: 24,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 20,
          boxShadow: isLight ? "0 8px 24px rgba(15,23,42,0.03)" : "0 10px 40px rgba(0,0,0,0.4)",
          overflowY: "auto",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
              }}
            >
              <CalendarIcon size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0, color: isLight ? "#111827" : "#f3f4f6" }}>
                {monthNames[month]} {year}
              </h2>
              <p style={{ fontSize: "0.78rem", color: isLight ? "#6b7280" : "#9ca3af", margin: "2px 0 0" }}>
                Schedule & Focus History
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              onClick={prevMonth}
              style={{
                background: isLight ? "#f1f5f9" : "#1a1a1a",
                border: isLight ? "1px solid #cbd5e1" : "1px solid #2a2a2a",
                borderRadius: 10,
                padding: "8px 12px",
                color: isLight ? "#4b5563" : "#e5e7eb",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
              }}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              style={{
                background: isLight ? "#f1f5f9" : "#1a1a1a",
                border: isLight ? "1px solid #cbd5e1" : "1px solid #2a2a2a",
                borderRadius: 10,
                padding: "6px 14px",
                color: isLight ? "#111827" : "#f3f4f6",
                fontWeight: 600,
                fontSize: "0.82rem",
                cursor: "pointer",
              }}
            >
              Today
            </button>
            <button
              onClick={nextMonth}
              style={{
                background: isLight ? "#f1f5f9" : "#1a1a1a",
                border: isLight ? "1px solid #cbd5e1" : "1px solid #2a2a2a",
                borderRadius: 10,
                padding: "8px 12px",
                color: isLight ? "#4b5563" : "#e5e7eb",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
              }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Days of Week */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "clamp(3px, 1.5vw, 8px)", textAlign: "center" }}>
          {daysOfWeek.map((day) => (
            <div
              key={day}
              style={{
                fontSize: "clamp(0.6rem, 1.5vw, 0.78rem)",
                fontWeight: 700,
                color: isLight ? "#94a3b8" : "#6b7280",
                textTransform: "uppercase",
                letterSpacing: "0.03em",
                padding: "clamp(4px, 1vw, 8px) 0",
              }}
            >
              {day.slice(0, window.innerWidth < 480 ? 1 : 3)}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "clamp(3px, 1.5vw, 8px)", flex: 1 }}>
          {[...Array(startDay)].map((_, i) => (
            <div key={`empty-${i}`} style={{ borderRadius: 10, opacity: 0.2 }} />
          ))}

          {[...Array(totalDays)].map((_, i) => {
            const dayNum = i + 1;
            const activeToday = isToday(dayNum);
            return (
              <div
                key={dayNum}
                style={{
                  borderRadius: "clamp(8px, 2vw, 14px)",
                  padding: "clamp(4px, 1.5vw, 10px)",
                  minHeight: "clamp(44px, 10vw, 70px)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  background: activeToday
                    ? "linear-gradient(135deg, #3b82f6, #2563eb)"
                    : isLight
                    ? "#f8fafc"
                    : "#161616",
                  border: activeToday
                    ? "none"
                    : isLight
                    ? "1px solid #e2e8f0"
                    : "1px solid #222222",
                  color: activeToday ? "#ffffff" : isLight ? "#111827" : "#e5e7eb",
                  boxShadow: activeToday ? "0 4px 14px rgba(59,130,246,0.3)" : "none",
                  transition: "transform 0.15s ease",
                  cursor: "pointer",
                  overflow: "hidden",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: activeToday ? 800 : 600, fontSize: "clamp(0.65rem, 2vw, 0.9rem)" }}>{dayNum}</span>
                  {activeToday && (
                    <span style={{ fontSize: "0.55rem", fontWeight: 700, background: "rgba(255,255,255,0.2)", padding: "1px 4px", borderRadius: 8, display: window.innerWidth < 400 ? "none" : "inline" }}>
                      Today
                    </span>
                  )}
                </div>

                {dayNum % 3 === 0 && window.innerWidth > 380 && (
                  <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                    <div
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: "50%",
                        background: activeToday ? "#ffffff" : "#10b981",
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        fontSize: "0.6rem",
                        opacity: activeToday ? 0.9 : 0.6,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                      }}
                    >
                      Focus
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
