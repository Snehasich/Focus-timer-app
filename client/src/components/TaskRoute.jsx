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
    <>
      <style>{`
        .theme-btn {
          cursor: pointer;
          transition: background 0.2s ease, transform 0.15s ease, border-color 0.2s;
        }
        .theme-btn:hover {
          background: ${isLight ? "#e2e8f0" : "#1e1e2e"} !important;
          transform: translateY(-1px);
        }
        .theme-btn:active { transform: scale(0.95); }

        .ask-btn {
          cursor: pointer;
          transition: background 0.2s ease, transform 0.15s ease, border-color 0.2s;
        }
        .ask-btn:hover {
          background: ${isLight ? "#e2e8f0" : "#1e1e2e"} !important;
          transform: translateY(-1px);
        }
        .ask-btn:active { transform: scale(0.95); }
      `}</style>

      <div className="flex flex-wrap justify-between items-center gap-2.5 w-full relative z-30">

        {/* LEFT HEADER BAR */}
        <div
          className="min-h-[44px] px-3.5 sm:px-4.5 py-1.5 rounded-2xl sm:rounded-full flex flex-wrap items-center gap-2.5 sm:gap-3.5 relative z-30 max-w-full overflow-visible"
          style={{
            background: isLight ? "#ffffff" : "#161616",
            border: isLight ? "1px solid #e2e8f0" : "1px solid #2a2a2a",
            color: isLight ? "#4b5563" : "#9ca3af",
            boxShadow: isLight ? "0 4px 12px rgba(15,23,42,0.03)" : "none",
          }}
        >
          {/* LEFT */}
          <div className="flex items-center gap-2 flex-shrink-0" style={{ color: isLight ? "#111827" : "#fff" }}>
            <NotebookPen className="w-4 h-4 text-blue-500" />
            <span className="text-[13.5px] sm:text-[14px] font-bold tracking-wide whitespace-nowrap">
              All my tasks
            </span>
          </div>

          <div className="h-4.5 w-px mx-0.5 flex-shrink-0" style={{ background: isLight ? "#cbd5e1" : "#374151" }} />

          {/* VIEW */}
          <div className="flex-shrink-0">
            <Dropdown 
              items={["Default", "A-Z (Alphabetical)", "Z-A (Reverse)", "Completed First", "Active First"]}
              onItemClick={onSortChange}
            >
              <div className="flex items-center gap-1.5 cursor-pointer whitespace-nowrap">
                <ArrowDownUp className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-[12.5px] sm:text-[13.5px] font-medium" style={{ color: isLight ? "#111827" : "#fff" }}>View: {currentSort}</span>
              </div>
            </Dropdown>
          </div>

          <div className="h-4.5 w-px mx-0.5 flex-shrink-0" style={{ background: isLight ? "#cbd5e1" : "#374151" }} />

          {/* FILTER */}
          <div className="flex-shrink-0">
            <Dropdown 
              items={["All Tasks", "Active Only", "Completed Only"]}
              onItemClick={onFilterChange}
            >
              <div className="flex items-center gap-1.5 cursor-pointer whitespace-nowrap">
                <SlidersHorizontal className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-[12.5px] sm:text-[13.5px] font-medium" style={{ color: isLight ? "#111827" : "#fff" }}>Filter: {currentFilter}</span>
              </div>
            </Dropdown>
          </div>

          <div className="h-4.5 w-px mx-0.5 flex-shrink-0" style={{ background: isLight ? "#cbd5e1" : "#374151" }} />

          {/* DROPDOWN (Ellipsis) */}
          <div className="flex-shrink-0">
            <Dropdown 
              items={["Mark All Completed", "Mark All Active", "Reset All Tasks"]}
              onItemClick={onBulkAction}
            >
              <div className="cursor-pointer flex items-center p-1">
                <Ellipsis className="w-4 h-4 text-blue-400" style={{ color: isLight ? "#4b5563" : "#9ca3af" }} />
              </div>
            </Dropdown>
          </div>

        </div>

        {/* RIGHT CONTROLS */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="theme-btn flex items-center justify-center w-[40px] h-[40px] sm:w-[44px] sm:h-[44px] rounded-full"
            style={{
              background: isLight ? "#ffffff" : "#161616",
              border: isLight ? "1px solid #cbd5e1" : "1px solid #2a2a2a",
              color: isLight ? "#4b5563" : "#f3f4f6",
              boxShadow: isLight ? "0 4px 12px rgba(15,23,42,0.03)" : "none",
            }}
            title="Toggle Theme"
          >
            {isLight ? <Moon size={16} /> : <Sun size={16} />}
          </button>

          {/* Ask Me Button */}
          <div
            className="ask-btn h-[40px] sm:h-[44px] px-3 sm:px-3.5 rounded-full flex items-center"
            style={{
              background: isLight ? "#ffffff" : "#161616",
              border: isLight ? "1px solid #cbd5e1" : "1px solid #2a2a2a",
              color: isLight ? "#111827" : "#fff",
              boxShadow: isLight ? "0 4px 12px rgba(15,23,42,0.03)" : "none",
            }}
            onClick={() => alert("AI Assistant features integrated in Notes module!")}
          >
            <img src={geminiIcon} alt="Gemini Logo" className="w-4 h-4 mr-1.5" />
            <span className="text-[13px] sm:text-[14px] font-bold tracking-wide">Ask Me</span>
          </div>
        </div>

      </div>
    </>
  );
});

export default TaskRoute;