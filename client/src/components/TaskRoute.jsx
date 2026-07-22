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

      <div className="flex flex-wrap md:flex-nowrap justify-between items-center gap-3 w-full md:w-[98%] mt-3">

        {/* LEFT HEADER BAR */}
        <div
          className="h-[42px] px-4 rounded-full flex items-center gap-3 sm:gap-4 w-full sm:w-fit overflow-visible max-w-full sidebar-nav"
          style={{
            background: isLight ? "#ffffff" : "#161616",
            border: isLight ? "1px solid #e2e8f0" : "1px solid #2a2a2a",
            color: isLight ? "#4b5563" : "#9ca3af",
            boxShadow: isLight ? "0 4px 12px rgba(15,23,42,0.03)" : "none",
          }}
        >
          {/* LEFT */}
          <div className="flex items-center gap-2" style={{ color: isLight ? "#111827" : "#fff" }}>
            <NotebookPen className="w-4 h-4" />
            <span className="lg:text-sm whitespace-nowrap font-semibold tracking-wide">
              All my tasks
            </span>
          </div>

          <div className="h-4 w-px" style={{ background: isLight ? "#cbd5e1" : "#374151" }} />

          {/* VIEW */}
          <Dropdown 
            items={["Default", "A-Z (Alphabetical)", "Z-A (Reverse)", "Completed First", "Active First"]}
            onItemClick={onSortChange}
          >
            <div className="flex items-center gap-1 cursor-pointer">
              <ArrowDownUp className="w-3.5 h-3.5" />
              <span className="text-sm" style={{ color: isLight ? "#111827" : "#fff" }}>View: {currentSort}</span>
            </div>
          </Dropdown>

          <div className="h-4 w-px" style={{ background: isLight ? "#cbd5e1" : "#374151" }} />

          {/* FILTER */}
          <Dropdown 
            items={["All Tasks", "Active Only", "Completed Only"]}
            onItemClick={onFilterChange}
          >
            <div className="flex items-center gap-1 cursor-pointer">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="text-sm" style={{ color: isLight ? "#111827" : "#fff" }}>Filter: {currentFilter}</span>
            </div>
          </Dropdown>

          <div className="h-4 w-px" style={{ background: isLight ? "#cbd5e1" : "#374151" }} />

          {/* DROPDOWN (Ellipsis) */}
          <Dropdown 
            items={["Mark All Completed", "Mark All Active", "Reset All Tasks"]}
            onItemClick={onBulkAction}
          >
            <div className="cursor-pointer flex items-center">
              <Ellipsis className="w-4 h-4" style={{ color: isLight ? "#4b5563" : "#9ca3af" }} />
            </div>
          </Dropdown>

        </div>

        {/* RIGHT CONTROLS */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="theme-btn flex items-center justify-center w-[42px] h-[42px] rounded-full"
            style={{
              background: isLight ? "#ffffff" : "#161616",
              border: isLight ? "1px solid #cbd5e1" : "1px solid #2a2a2a",
              color: isLight ? "#4b5563" : "#f3f4f6",
              boxShadow: isLight ? "0 4px 12px rgba(15,23,42,0.03)" : "none",
            }}
          >
            {isLight ? <Moon size={16} /> : <Sun size={16} />}
          </button>

          {/* Ask Me Button */}
          <div
            className="ask-btn h-[42px] px-4 rounded-full flex items-center"
            style={{
              background: isLight ? "#ffffff" : "#161616",
              border: isLight ? "1px solid #cbd5e1" : "1px solid #2a2a2a",
              color: isLight ? "#111827" : "#fff",
              boxShadow: isLight ? "0 4px 12px rgba(15,23,42,0.03)" : "none",
            }}
            onClick={() => alert("Under Process")}
          >
            <img src={geminiIcon} alt="Gemini Logo" className="w-4 h-4 mr-2" />
            <span className="text-sm font-semibold tracking-wide">Ask Me</span>
          </div>
        </div>

      </div>
    </>
  );
});