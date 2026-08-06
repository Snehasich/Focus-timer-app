import { memo, useState, useEffect } from "react";
import { Plus, ArrowUp, CheckCheck } from "lucide-react";
import { InsideTask } from "./InsideTask";
import FocusBreak from "./Timer/FocusBreak";
import { MobileHomeView } from "./MobileHomeView";
import { useTheme } from "../context/ThemeContext";
import { useApp } from "../context/AppContext";

export const TaskRouteTask = memo(({ 
  filter = "All Tasks", 
  sortBy = "Default", 
  bulkAction = null, 
  onBulkActionProcessed 
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [input, setInput] = useState("");
  const { tasks, addTask, toggleTask, deleteTask, executeBulkAction } = useApp();

  // ── Execute Bulk Actions ──
  useEffect(() => {
    if (!bulkAction) return;
    executeBulkAction(bulkAction).then(() => {
      if (onBulkActionProcessed) onBulkActionProcessed();
    });
  }, [bulkAction]);

  const handleAddTask = () => {
    if (!input || input.trim() === "") return;
    addTask(input.trim());
    setInput("");
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const progress = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;
  const { theme } = useTheme();
  const isLight = theme === "light";

  // ── FILTER TASKS ──
  const filteredTasks = tasks.filter((task) => {
    if (filter === "Active Only") return !task.completed;
    if (filter === "Completed Only") return task.completed;
    return true;
  });

  // ── SORT TASKS ──
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === "A-Z (Alphabetical)") {
      return a.text.localeCompare(b.text);
    }
    if (sortBy === "Z-A (Reverse)") {
      return b.text.localeCompare(a.text);
    }
    if (sortBy === "Completed First") {
      if (a.completed && !b.completed) return -1;
      if (!a.completed && b.completed) return 1;
      return 0;
    }
    if (sortBy === "Active First") {
      if (!a.completed && b.completed) return -1;
      if (a.completed && !b.completed) return 1;
      return 0;
    }
    return 0;
  });

  return (
    <>
      {/* ── MOBILE HOME VIEW (< 1024px) ── */}
      <MobileHomeView 
        tasks={sortedTasks} 
        toggleTask={toggleTask} 
        deleteTask={deleteTask}
        input={input}
        setInput={setInput}
        handleAddTask={handleAddTask}
        completedCount={completedCount} 
        progress={progress} 
      />

      {/* ── DESKTOP HOME VIEW (≥ 1024px) ── */}
      <div className="hidden lg:flex flex-col lg:flex-row gap-4 sm:gap-6 w-full flex-1 min-h-0">

        {/* ── LEFT CARD — Tasks ── */}
        <div className={`w-full lg:max-w-[380px] lg:min-w-[320px] min-h-[350px] lg:h-full flex flex-col flex-shrink-0 rounded-2xl p-5 gap-3 border transition-all duration-300 ${
          isLight 
            ? "bg-white border-slate-200 shadow-slate-200/40 shadow-sm" 
            : "bg-[#111] border-black/80 shadow-2xl shadow-black/80"
        }`}>
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className={`font-bold text-lg tracking-tight ${isLight ? "text-gray-900" : "text-gray-100"}`}>
                Today
              </h2>
              <p className={`text-xs mt-0.5 ${isLight ? "text-gray-500" : "text-gray-400"}`}>
                {completedCount} of {tasks.length} completed
              </p>
            </div>
            {tasks.length > 0 && (
              <div className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 border text-xs font-semibold ${
                isLight ? "bg-slate-100 border-slate-200 text-blue-600" : "bg-[#1a1a1a] border-[#2a2a2a] text-emerald-400"
              }`}>
                <CheckCheck size={12} className={isLight ? "text-blue-600" : "text-emerald-400"} />
                <span>{Math.round(progress)}%</span>
              </div>
            )}
          </div>

          {/* Progress bar */}
          {tasks.length > 0 && (
            <div className={`h-1 rounded-full overflow-hidden ${isLight ? "bg-slate-200" : "bg-[#1e1e1e]"}`}>
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  progress === 100
                    ? isLight ? "bg-emerald-500" : "bg-emerald-400"
                    : "bg-gradient-to-r from-blue-500 to-purple-500"
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {/* Task list */}
          <div className="flex-1 overflow-y-auto min-h-[160px] pr-0.5">
            <InsideTask tasks={sortedTasks} toggleTask={toggleTask} deleteTask={deleteTask} />
          </div>

          {/* Add task input */}
          <div
            className={`flex items-center rounded-xl border transition-all duration-200 ${
              isFocused 
                ? "border-blue-500 ring-2 ring-blue-500/20" 
                : isLight ? "border-slate-200 hover:border-blue-400" : "border-[#252525] hover:border-blue-500/50"
            } ${
              isLight ? "bg-slate-50" : "bg-[#0e0e0e]"
            }`}
          >
            <Plus size={16} className={`ml-3 shrink-0 ${isLight ? "text-slate-400" : "text-zinc-600"}`} />
            <input
              type="text"
              placeholder="Add a task..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onKeyDown={(e) => { 
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddTask();
                }
              }}
              className={`flex-1 py-2.5 px-2.5 bg-transparent border-none outline-none text-sm ${
                isLight ? "text-gray-900 placeholder:text-slate-400" : "text-gray-200 placeholder:text-gray-500"
              }`}
            />
            {input.trim().length > 0 && (
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); handleAddTask(); }}
                onClick={handleAddTask}
                className="mr-2 p-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-500 cursor-pointer shrink-0 transition-all hover:scale-105 active:scale-95"
                title="Add Task"
              >
                <ArrowUp size={14} />
              </button>
            )}
          </div>
        </div>

        {/* ── RIGHT CARD — Timer ── */}
        <div className={`w-full lg:flex-1 min-h-[420px] lg:h-full flex flex-col items-center justify-center relative overflow-hidden rounded-2xl p-4 sm:p-6 border transition-all duration-300 ${
          isLight 
            ? "bg-white border-slate-200 shadow-slate-200/40 shadow-sm" 
            : "bg-[#111] border-black/80 shadow-2xl shadow-black/80"
        }`}>
          <FocusBreak />
        </div>

      </div>
    </>
  );
});

export default TaskRouteTask;