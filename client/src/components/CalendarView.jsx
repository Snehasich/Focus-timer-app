import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";

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
    <div className="min-h-screen lg:h-screen w-full box-border flex flex-col p-2 sm:p-5 md:p-6 gap-3 pb-24 lg:pb-6">
      <div
        className={`w-full flex-1 flex flex-col gap-4 rounded-3xl p-4 sm:p-6 overflow-y-auto min-h-0 border shadow-2xl ${
          isLight 
            ? "bg-white border-slate-200 shadow-slate-200/50" 
            : "bg-[#111111] border-[#222222] shadow-black/60"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9.5 h-9.5 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <CalendarIcon size={20} />
            </div>
            <div>
              <h2 className={`text-lg sm:text-xl font-bold tracking-tight ${isLight ? "text-gray-900" : "text-gray-100"}`}>
                {monthNames[month]} {year}
              </h2>
              <p className={`text-xs mt-0.5 ${isLight ? "text-gray-500" : "text-gray-400"}`}>
                Schedule & Focus History
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={prevMonth}
              className={`p-2 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                isLight 
                  ? "bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200" 
                  : "bg-[#1a1a1a] border-[#2a2a2a] text-slate-200 hover:bg-[#252525]"
              }`}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className={`px-3.5 py-1.5 rounded-xl border font-semibold text-xs transition-all cursor-pointer ${
                isLight 
                  ? "bg-slate-100 border-slate-300 text-gray-900 hover:bg-slate-200" 
                  : "bg-[#1a1a1a] border-[#2a2a2a] text-gray-100 hover:bg-[#252525]"
              }`}
            >
              Today
            </button>
            <button
              onClick={nextMonth}
              className={`p-2 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                isLight 
                  ? "bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200" 
                  : "bg-[#1a1a1a] border-[#2a2a2a] text-slate-200 hover:bg-[#252525]"
              }`}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Days of Week */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center">
          {daysOfWeek.map((day) => (
            <div
              key={day}
              className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider py-1 sm:py-2 ${
                isLight ? "text-slate-400" : "text-zinc-500"
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2 flex-1">
          {[...Array(startDay)].map((_, i) => (
            <div key={`empty-${i}`} className="rounded-xl opacity-20" />
          ))}

          {[...Array(totalDays)].map((_, i) => {
            const dayNum = i + 1;
            const activeToday = isToday(dayNum);
            return (
              <div
                key={dayNum}
                className={`rounded-xl p-1.5 sm:p-2.5 min-h-[44px] sm:min-h-[64px] flex flex-col justify-between transition-all duration-150 cursor-pointer overflow-hidden ${
                  activeToday
                    ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30 font-black"
                    : isLight
                      ? "bg-slate-50 border border-slate-200 text-slate-900 hover:bg-slate-100"
                      : "bg-[#161616] border border-[#222222] text-slate-200 hover:bg-[#1f1f1f]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs sm:text-sm ${activeToday ? "font-black" : "font-semibold"}`}>
                    {dayNum}
                  </span>
                  {activeToday && (
                    <span className="text-[9px] font-extrabold bg-white/20 px-1.5 py-0.5 rounded-md text-white">
                      Today
                    </span>
                  )}
                </div>

                {dayNum % 3 === 0 && (
                  <div className="flex items-center gap-1">
                    <div
                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        activeToday ? "bg-white" : "bg-emerald-500"
                      }`}
                    />
                    <span
                      className={`text-[9px] font-medium truncate ${
                        activeToday ? "text-white/90" : "opacity-60"
                      }`}
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
