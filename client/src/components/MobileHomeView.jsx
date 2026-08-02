import { useState } from "react";
import { Flame, Sparkles, Target, Zap, Clock, CheckCircle2, Lightbulb, RefreshCw, Circle, CircleCheck, CircleX, Play, ArrowRight, Plus, ArrowUp } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import FocusBreak from "./Timer/FocusBreak";

export const MobileHomeView = ({ 
  tasks = [], 
  toggleTask, 
  deleteTask,
  input = "",
  setInput,
  handleAddTask,
  completedCount = 0, 
  progress = 0 
}) => {
  const { theme } = useTheme();
  const isLight = theme === "light";

  const [selectedTaskIndex, setSelectedTaskIndex] = useState(0);
  const [showAllTasksModal, setShowAllTasksModal] = useState(false);
  const activeTasks = tasks.filter((t) => !t.completed);
  const currentTask = activeTasks[selectedTaskIndex % (activeTasks.length || 1)] || tasks[0] || { text: "Complete Morning Focus Session", completed: false };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const username = localStorage.getItem("username") || "User";
  const streak = parseInt(localStorage.getItem("focusflow_streak") || "1", 10);

  const handleNextTask = () => {
    if (activeTasks.length > 1) {
      setSelectedTaskIndex((prev) => (prev + 1) % activeTasks.length);
    }
  };

  return (
    <div className="flex flex-col gap-[18px] sm:gap-[20px] w-full lg:hidden pb-10 transition-all duration-300">
      
      {/* ── (1) Greeting with streak ── */}
      <div 
        className="rounded-3xl p-5 flex flex-col gap-2.5 relative overflow-hidden transition-all duration-200"
        style={{
          background: isLight ? "#ffffff" : "#171717",
          border: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255, 255, 255, 0.08)",
          boxShadow: isLight ? "0 4px 20px rgba(15,23,42,0.03)" : "0 8px 30px rgba(0,0,0,0.5)",
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider" style={{ color: isLight ? "#2563eb" : "#60a5fa" }}>
            <Sparkles size={13} />
            <span>FocusFlow Workstation</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 font-bold text-xs shadow-xs">
            <Flame size={14} className="fill-orange-500/20 text-orange-500" />
            <span>{streak} Day Streak</span>
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-black tracking-tight" style={{ color: isLight ? "#0f172a" : "#f8fafc" }}>
            {getGreeting()}, {username} 👋
          </h1>
          <p className="text-xs font-medium opacity-75 mt-1" style={{ color: isLight ? "#64748b" : "#94a3b8" }}>
            Stay focused, keep pushing, and conquer your goals today.
          </p>
        </div>
      </div>

      {/* ── (2) Active Task card with Resume Focus button ── */}
      <div 
        className="rounded-3xl p-5 flex flex-col gap-3 relative overflow-hidden transition-all duration-200"
        style={{
          background: isLight ? "linear-gradient(135deg, #f0f7ff, #ffffff)" : "linear-gradient(135deg, #182030, #171717)",
          border: isLight ? "1px solid #bfdbfe" : "1px solid rgba(59, 130, 246, 0.2)",
          boxShadow: isLight ? "0 4px 16px rgba(59,130,246,0.06)" : "0 8px 24px rgba(0,0,0,0.5)",
        }}
      >
        <div className="flex items-center justify-between">
          <span style={{ color: isLight ? "#2563eb" : "#60a5fa" }} className="uppercase text-[10px] font-extrabold tracking-wider">
            🎯 Current Focus Task
          </span>

          <button
            onClick={handleNextTask}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <RefreshCw size={11} />
            <span>Change Task</span>
          </button>
        </div>

        <h3 className="text-base font-bold truncate" style={{ color: isLight ? "#0f172a" : "#f8fafc" }}>
          {currentTask.text}
        </h3>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-2.5 py-0.5 rounded-md bg-amber-500/10 text-amber-500 font-bold border border-amber-500/20">
            🔥 High Priority
          </span>
          <span className="px-2.5 py-0.5 rounded-md bg-blue-500/10 text-blue-400 font-semibold border border-blue-500/20 flex items-center gap-1">
            <Clock size={12} /> 25 mins focus
          </span>
        </div>

        <button 
          onClick={() => alert("Timer ready! Use controls below to start focus session.")}
          className="w-full mt-1 py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-500 active:scale-98 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-600/30 transition-all cursor-pointer"
        >
          <Play size={15} className="fill-current" />
          <span>Resume Focus</span>
        </button>
      </div>

      {/* ── (3) Large Focus Timer as the Main Hero ── */}
      <div 
        className="rounded-3xl p-4 sm:p-6 flex flex-col items-center justify-center relative overflow-hidden transition-all duration-200"
        style={{
          background: isLight ? "#ffffff" : "#171717",
          border: isLight ? "1px solid #e5e7eb" : "1px solid rgba(255, 255, 255, 0.08)",
          boxShadow: isLight ? "0 8px 24px rgba(15,23,42,0.03)" : "0 10px 40px rgba(0,0,0,0.5)",
        }}
      >
        <FocusBreak />
      </div>

      {/* ── (4) Compact Today's Tasks Section (Up to 3 tasks with checkboxes + Add Task + View All) ── */}
      <div 
        className="rounded-3xl p-5 flex flex-col gap-3.5"
        style={{
          background: isLight ? "#ffffff" : "#171717",
          border: isLight ? "1px solid #e5e7eb" : "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-blue-500" />
            <h3 className="text-xs font-extrabold uppercase tracking-wider" style={{ color: isLight ? "#475569" : "#94a3b8" }}>
              Today's Tasks ({tasks.length})
            </h3>
          </div>

          <button 
            onClick={() => setShowAllTasksModal(!showAllTasksModal)}
            className="text-xs font-bold text-blue-500 hover:text-blue-400 cursor-pointer"
          >
            {showAllTasksModal ? "Show Less" : "View All →"}
          </button>
        </div>

        {/* Task Item List */}
        <div className="flex flex-col gap-2">
          {tasks.length === 0 ? (
            <p className="text-xs text-center opacity-60 py-3">No tasks added for today yet.</p>
          ) : (
            (showAllTasksModal ? tasks : tasks.slice(0, 3)).map((task) => (
              <div
                key={task.id}
                onClick={() => toggleTask && toggleTask(task)}
                className="flex items-center gap-3 p-3 rounded-2xl border transition-all cursor-pointer hover:border-blue-500/40 active:scale-98"
                style={{
                  background: task.completed
                    ? (isLight ? "rgba(16,185,129,0.06)" : "rgba(74,222,128,0.04)")
                    : (isLight ? "#f8fafc" : "#1f1f22"),
                  borderColor: isLight ? "#e2e8f0" : "rgba(255, 255, 255, 0.06)",
                }}
              >
                {task.completed ? (
                  <CircleCheck size={18} className="text-emerald-500 flex-shrink-0" />
                ) : (
                  <Circle size={18} className="text-gray-400 flex-shrink-0" />
                )}
                <span className={`text-xs font-semibold truncate flex-1 ${task.completed ? "line-through opacity-60" : ""}`} style={{ color: isLight ? "#0f172a" : "#f1f5f9" }}>
                  {task.text}
                </span>
                
                {/* Delete Cross Icon Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (deleteTask) deleteTask(task.id);
                  }}
                  className="p-1 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-all cursor-pointer flex-shrink-0"
                  title="Delete Task"
                >
                  <CircleX size={17} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* + Add Task Input Field */}
        <div
          className="flex items-center px-3 py-2 rounded-xl border mt-1"
          style={{
            background: isLight ? "#f8fafc" : "#121214",
            borderColor: isLight ? "#cbd5e1" : "#2a2a30",
          }}
        >
          <Plus size={16} className="text-gray-400 mr-2 flex-shrink-0" />
          <input
            type="text"
            placeholder="Add a new task..."
            value={input}
            onChange={(e) => setInput && setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && handleAddTask) handleAddTask(); }}
            className="flex-1 bg-transparent border-none outline-none text-xs font-medium"
            style={{ color: isLight ? "#0f172a" : "#f1f5f9" }}
          />
          {input.trim().length > 0 && (
            <button
              onClick={() => handleAddTask && handleAddTask()}
              className="p-1 rounded-lg bg-blue-600 text-white hover:bg-blue-500 cursor-pointer flex-shrink-0"
            >
              <ArrowUp size={14} />
            </button>
          )}
        </div>
      </div>

      {/* ── (5) Progress Stats (2×2 Grid) ── */}
      <div className="grid grid-cols-2 gap-3">
        <div 
          className="rounded-2xl p-4 flex flex-col gap-1.5 transition-all duration-200 hover:translate-y-[-2px]"
          style={{
            background: isLight ? "#ffffff" : "#171717",
            border: isLight ? "1px solid #e5e7eb" : "1px solid rgba(255, 255, 255, 0.08)",
          }}
        >
          <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-blue-500">
            <Clock size={14} />
            <span>Focus Time</span>
          </div>
          <span className="text-xl font-black tracking-tight" style={{ color: isLight ? "#0f172a" : "#f8fafc" }}>
            {(completedCount * 0.8).toFixed(1)} <span className="text-xs font-semibold opacity-70">hrs</span>
          </span>
        </div>

        <div 
          className="rounded-2xl p-4 flex flex-col gap-1.5 transition-all duration-200 hover:translate-y-[-2px]"
          style={{
            background: isLight ? "#ffffff" : "#171717",
            border: isLight ? "1px solid #e5e7eb" : "1px solid rgba(255, 255, 255, 0.08)",
          }}
        >
          <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-emerald-500">
            <Zap size={14} />
            <span>Sessions</span>
          </div>
          <span className="text-xl font-black tracking-tight" style={{ color: isLight ? "#0f172a" : "#f8fafc" }}>
            {completedCount * 2} <span className="text-xs font-semibold opacity-70">Done</span>
          </span>
        </div>

        <div 
          className="rounded-2xl p-4 flex flex-col gap-1.5 transition-all duration-200 hover:translate-y-[-2px]"
          style={{
            background: isLight ? "#ffffff" : "#171717",
            border: isLight ? "1px solid #e5e7eb" : "1px solid rgba(255, 255, 255, 0.08)",
          }}
        >
          <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-purple-500">
            <CheckCircle2 size={14} />
            <span>Tasks Done</span>
          </div>
          <span className="text-xl font-black tracking-tight" style={{ color: isLight ? "#0f172a" : "#f8fafc" }}>
            {completedCount} <span className="text-xs font-semibold opacity-70">/ {tasks.length}</span>
          </span>
        </div>

        <div 
          className="rounded-2xl p-4 flex flex-col gap-1.5 transition-all duration-200 hover:translate-y-[-2px]"
          style={{
            background: isLight ? "#ffffff" : "#171717",
            border: isLight ? "1px solid #e5e7eb" : "1px solid rgba(255, 255, 255, 0.08)",
          }}
        >
          <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-amber-500">
            <Target size={14} />
            <span>Daily Goal</span>
          </div>
          <span className="text-xl font-black tracking-tight" style={{ color: isLight ? "#0f172a" : "#f8fafc" }}>
            {Math.round(progress)}%
          </span>
        </div>
      </div>

      {/* ── (6) AI Insight Card ── */}
      <div 
        className="rounded-3xl p-5 flex flex-col gap-2.5 relative overflow-hidden"
        style={{
          background: isLight ? "linear-gradient(135deg, #f5f3ff, #ffffff)" : "linear-gradient(135deg, #201735, #171717)",
          border: isLight ? "1px solid #ddd6fe" : "1px solid rgba(147, 51, 234, 0.25)",
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-extrabold text-purple-400">
            <Lightbulb size={16} className="text-amber-400 fill-amber-400/20" />
            <span>AI Productivity Tip</span>
          </div>

          <span 
            onClick={() => alert("AI Coach features integrated in Notes module!")}
            className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer"
          >
            <span>Open AI Coach</span>
            <ArrowRight size={12} />
          </span>
        </div>

        <p className="text-xs leading-relaxed opacity-90 font-medium" style={{ color: isLight ? "#334155" : "#cbd5e1" }}>
          Taking a 5-minute break after 50 minutes of deep focus restores mental stamina and boosts creativity by 35%.
        </p>
      </div>

    </div>
  );
};

export default MobileHomeView;
