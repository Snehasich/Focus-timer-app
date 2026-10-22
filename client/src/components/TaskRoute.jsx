import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { NotebookPen, ArrowDownUp, SlidersHorizontal, Ellipsis, Sun, Moon, RotateCcw } from "lucide-react";
import { Dropdown } from "./Dropdown";
import geminiIcon from "../assets/gemini-icon.png";
import { useTheme } from "../context/ThemeContext";
import { useApp } from "../context/AppContext";

export const TaskRoute = memo(({ 
  currentFilter = "All Tasks", 
  onFilterChange, 
  currentSort = "Default", 
  onSortChange, 
  onBulkAction 
}) => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { tasks } = useApp();
  const isLight = theme === "light";

  const isFilteredOrSorted = currentFilter !== "All Tasks" || currentSort !== "Default";

  const handleResetFilters = () => {
    onFilterChange?.("All Tasks");
    onSortChange?.("Default");
  };

  return (
    <div className="flex flex-wrap justify-between items-center gap-2.5 w-full relative z-30">
      {/* LEFT HEADER BAR */}
      <div
        className={`min-h-[44px] px-3.5 sm:px-4.5 py-1.5 rounded-2xl sm:rounded-full flex flex-wrap items-center gap-2.5 sm:gap-3.5 relative z-30 max-w-full overflow-visible border transition-all duration-200 ${
          isLight 
            ? "bg-white border-slate-200 text-slate-600 shadow-sm" 
            : "bg-[#161616] border-[#2a2a2a] text-gray-400"
        }`}
      >
        {/* ALL MY TASKS (Interactive reset / toggle) */}
        <button
          type="button"
          onClick={handleResetFilters}
          className={`flex items-center gap-2 flex-shrink-0 cursor-pointer bg-transparent border-none outline-none p-0 transition-all duration-150 hover:opacity-80 active:scale-95 ${
            isLight ? "text-gray-900" : "text-white"
          }`}
          title="Click to reset filters and view all tasks"
        >
          <NotebookPen className="w-4 h-4 text-blue-500" />
          <span className="text-[13.5px] sm:text-[14px] font-bold tracking-wide whitespace-nowrap">
            All my tasks
          </span>
          {tasks && tasks.length > 0 && (
            <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${
              isLight ? "bg-slate-100 text-slate-600" : "bg-white/10 text-zinc-300"
            }`}>
              {tasks.length}
            </span>
          )}
          {isFilteredOrSorted && (
            <RotateCcw size={12} className="text-blue-500 animate-spin-once" title="Filters active - click to reset" />
          )}
        </button>

        <div className={`h-4.5 w-px mx-0.5 flex-shrink-0 ${isLight ? "bg-slate-300" : "bg-gray-700"}`} />

        {/* VIEW DROPDOWN */}
        <div className="flex-shrink-0">
          <Dropdown 
            items={["Default", "A-Z (Alphabetical)", "Z-A (Reverse)", "Completed First", "Active First"]}
            activeItem={currentSort}
            onItemClick={onSortChange}
            align="left"
          >
            <div className="flex items-center gap-1.5 cursor-pointer whitespace-nowrap hover:opacity-85 transition-opacity">
              <ArrowDownUp className="w-3.5 h-3.5 text-blue-400" />
              <span className={`text-[12.5px] sm:text-[13.5px] font-medium ${isLight ? "text-gray-900" : "text-white"}`}>
                View: {currentSort}
              </span>
            </div>
          </Dropdown>
        </div>

        <div className={`h-4.5 w-px mx-0.5 flex-shrink-0 ${isLight ? "bg-slate-300" : "bg-gray-700"}`} />

        {/* FILTER DROPDOWN */}
        <div className="flex-shrink-0">
          <Dropdown 
            items={["All Tasks", "Active Only", "Completed Only"]}
            activeItem={currentFilter}
            onItemClick={onFilterChange}
            align="left"
          >
            <div className="flex items-center gap-1.5 cursor-pointer whitespace-nowrap hover:opacity-85 transition-opacity">
              <SlidersHorizontal className="w-3.5 h-3.5 text-blue-400" />
              <span className={`text-[12.5px] sm:text-[13.5px] font-medium ${isLight ? "text-gray-900" : "text-white"}`}>
                Filter: {currentFilter}
              </span>
            </div>
          </Dropdown>
        </div>

        <div className={`h-4.5 w-px mx-0.5 flex-shrink-0 ${isLight ? "bg-slate-300" : "bg-gray-700"}`} />

        {/* DROPDOWN (Ellipsis / Bulk Actions) */}
        <div className="flex-shrink-0">
          <Dropdown 
            items={["Mark All Completed", "Mark All Active", "Clear Completed", "Delete All Tasks"]}
            onItemClick={onBulkAction}
            align="right"
          >
            <div className="cursor-pointer flex items-center p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors" title="Task actions">
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
          className={`flex items-center justify-center w-[40px] h-[40px] sm:w-[44px] sm:h-[44px] rounded-full border transition-all duration-200 hover:-translate-y-0.5 active:scale-95 cursor-pointer ${
            isLight 
              ? "bg-white border-slate-300 text-slate-600 hover:bg-slate-100 shadow-sm" 
              : "bg-[#161616] border-[#2a2a2a] text-gray-100 hover:bg-[#1e1e2e]"
          }`}
          title="Toggle Theme"
        >
          {isLight ? <Moon size={16} /> : <Sun size={16} />}
        </button>

        {/* Focus AI Button */}
        <div
          className={`h-[40px] sm:h-[44px] px-3 sm:px-3.5 rounded-full flex items-center border cursor-pointer transition-all duration-200 hover:-translate-y-0.5 active:scale-95 ${
            isLight 
              ? "bg-white border-slate-300 text-gray-900 hover:bg-slate-100 shadow-sm" 
              : "bg-[#161616] border-[#2a2a2a] text-white hover:bg-[#1e1e2e]"
          }`}
          onClick={() => navigate("/focus-ai")}
          title="Open Focus AI Assistant"
        >
          <img src={geminiIcon} alt="Gemini Logo" className="w-4 h-4 mr-1.5" />
          <span className="text-[13px] sm:text-[14px] font-bold tracking-wide">Focus AI</span>
        </div>
      </div>
    </div>
  );
});

export default TaskRoute;
