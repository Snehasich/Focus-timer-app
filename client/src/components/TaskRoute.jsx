import { memo } from 'react';
import { NotebookPen, ArrowDownUp, SlidersHorizontal, Ellipsis, Sun, Moon } from "lucide-react";
import { Dropdown } from "./Dropdown";
import geminiIcon from "../assets/gemini-icon.png";
import { useTheme } from "../context/ThemeContext";

export const TaskRoute = memo(({ 
  currentFilter = "All Tasks", 
  onFilterChange, 
  currentSort = "Default", 
  onSortChange, 
  onBulkAction 
}) => {
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === "light";

  return (
    <div className="flex flex-wrap justify-between items-center gap-2.5 w-full relative z-30">
      {/* LEFT HEADER BAR */}
      <div
        className={`min-h-[44px] px-3.5 sm:px-4.5 py-1.5 rounded-2xl sm:rounded-full flex flex-wrap items-center gap-2.5 sm:gap-3.5 relative z-30 max-w-full overflow-visible border ${
          isLight 
            ? "bg-white border-slate-200 text-slate-600 shadow-sm" 
            : "bg-[#161616] border-[#2a2a2a] text-gray-400"
        }`}
      >
        {/* LEFT */}
        <div className={`flex items-center gap-2 flex-shrink-0 ${isLight ? "text-gray-900" : "text-white"}`}>
          <NotebookPen className="w-4 h-4 text-blue-500" />
          <span className="text-[13.5px] sm:text-[14px] font-bold tracking-wide whitespace-nowrap">
            All my tasks
          </span>
        </div>

        <div className={`h-4.5 w-px mx-0.5 flex-shrink-0 ${isLight ? "bg-slate-300" : "bg-gray-700"}`} />

        {/* VIEW */}
        <div className="flex-shrink-0">
          <Dropdown 
            items={["Default", "A-Z (Alphabetical)", "Z-A (Reverse)", "Completed First", "Active First"]}
            onItemClick={onSortChange}
          >
            <div className="flex items-center gap-1.5 cursor-pointer whitespace-nowrap">
              <ArrowDownUp className="w-3.5 h-3.5 text-blue-400" />
              <span className={`text-[12.5px] sm:text-[13.5px] font-medium ${isLight ? "text-gray-900" : "text-white"}`}>
                View: {currentSort}
              </span>
            </div>
          </Dropdown>
        </div>

        <div className={`h-4.5 w-px mx-0.5 flex-shrink-0 ${isLight ? "bg-slate-300" : "bg-gray-700"}`} />

        {/* FILTER */}
        <div className="flex-shrink-0">
          <Dropdown 
            items={["All Tasks", "Active Only", "Completed Only"]}
            onItemClick={onFilterChange}
          >
            <div className="flex items-center gap-1.5 cursor-pointer whitespace-nowrap">
              <SlidersHorizontal className="w-3.5 h-3.5 text-blue-400" />
              <span className={`text-[12.5px] sm:text-[13.5px] font-medium ${isLight ? "text-gray-900" : "text-white"}`}>
                Filter: {currentFilter}
              </span>
            </div>
          </Dropdown>
        </div>

        <div className={`h-4.5 w-px mx-0.5 flex-shrink-0 ${isLight ? "bg-slate-300" : "bg-gray-700"}`} />

        {/* DROPDOWN (Ellipsis) */}
        <div className="flex-shrink-0">
          <Dropdown 
            items={["Mark All Completed", "Mark All Active", "Reset All Tasks"]}
            onItemClick={onBulkAction}
          >
            <div className="cursor-pointer flex items-center p-1">
              <Ellipsis className={`w-4 h-4 ${isLight ? "text-slate-600" : "text-gray-400"}`} />
            </div>
          </Dropdown>
        </div>
      </div>

      {/* RIGHT CONTROLS */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className={`flex items-center justify-center w-[40px] h-[40px] sm:w-[44px] sm:h-[44px] rounded-full border transition-all duration-200 hover:-translate-y-0.5 active:scale-95 ${
            isLight 
              ? "bg-white border-slate-300 text-slate-600 hover:bg-slate-100 shadow-sm" 
              : "bg-[#161616] border-[#2a2a2a] text-gray-100 hover:bg-[#1e1e2e]"
          }`}
          title="Toggle Theme"
        >
          {isLight ? <Moon size={16} /> : <Sun size={16} />}
        </button>

        {/* Ask Me Button */}
        <div
          className={`h-[40px] sm:h-[44px] px-3 sm:px-3.5 rounded-full flex items-center border cursor-pointer transition-all duration-200 hover:-translate-y-0.5 active:scale-95 ${
            isLight 
              ? "bg-white border-slate-300 text-gray-900 hover:bg-slate-100 shadow-sm" 
              : "bg-[#161616] border-[#2a2a2a] text-white hover:bg-[#1e1e2e]"
          }`}
          onClick={() => alert("AI Assistant features integrated in Notes module!")}
        >
          <img src={geminiIcon} alt="Gemini Logo" className="w-4 h-4 mr-1.5" />
          <span className="text-[13px] sm:text-[14px] font-bold tracking-wide">Ask Me</span>
        </div>
      </div>
    </div>
  );
});

export default TaskRoute;