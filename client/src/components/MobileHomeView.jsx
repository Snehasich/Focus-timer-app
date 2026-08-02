import { useState } from "react";
import { Flame, Sparkles, Target, Zap, Clock, CheckCircle2, RefreshCw, Circle, CircleCheck, CircleX, Play, Plus, ArrowUp } from "lucide-react";
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
        className={`rounded-3xl p-5 flex flex-col gap-2.5 relative overflow-hidden transition-all duration-200 border ${
          isLight 
            ? "bg-white border-slate-200 shadow-slate-200/50 shadow-sm text-slate-900" 
            : "bg-[#171717] border-white/10 shadow-2xl shadow-black/50 text-slate-100"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className={`flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider ${
            isLight ? "text-blue-600" : "text-blue-400"
          }`}>
            <Sparkles size={13} />
            <span>FocusFlow Workstation</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 font-bold text-xs shadow-xs">
            <Flame size={14} className="fill-orange-500/20 text-orange-500" />
            <span>{streak} Day Streak</span>
          </div>
        </div>

        <div>
          <h1 className={`text-2xl font-black tracking-tight ${isLight ? "text-slate-900" : "text-slate-50"}`}>
            {getGreeting()}, {username} 👋
          </h1>
          <p className={`text-xs font-medium mt-1 ${isLight ? "text-slate-500" : "text-slate-400"}`}>
            Stay focused, keep pushing, and conquer your goals today.
          </p>
        </div>
      </div>

      {/* ── (2) Active Task card with Resume Focus button ── */}
      <div 
        className={`rounded-3xl p-5 flex flex-col gap-3 relative overflow-hidden transition-all duration-200 border ${
          isLight 
            ? "bg-gradient-to-br from-blue-50 to-white border-blue-200 shadow-blue-500/5 shadow-md" 
            : "bg-gradient-to-br from-[#182030] to-[#171717] border-blue-500/20 shadow-2xl shadow-black/50"
        }`}
      >
        <div className="flex items-center justify-between">
          <span className={`uppercase text-[10px] font-extrabold tracking-wider ${
            isLight ? "text-blue-600" : "text-blue-400"
          }`}>
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

        <h3 className={`text-base font-bold truncate ${isLight ? "text-slate-900" : "text-slate-100"}`}>
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
        className={`rounded-3xl p-4 sm:p-6 flex flex-col items-center justify-center relative overflow-hidden transition-all duration-200 border ${
          isLight 
            ? "bg-white border-slate-200 shadow-slate-200/50 shadow-sm" 
            : "bg-[#171717] border-white/10 shadow-2xl shadow-black/50"
        }`}
      >
        <FocusBreak />
      </div>

      {/* ── (4) Compact Today's Tasks Section ── */}
      <div 
        className={`rounded-3xl p-5 flex flex-col gap-3.5 border ${
          isLight 
            ? "bg-white border-slate-200 shadow-slate-200/50 shadow-sm" 
            : "bg-[#171717] border-white/10 shadow-2xl shadow-black/50"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-blue-500" />
            <h3 className={`text-xs font-extrabold uppercase tracking-wider ${
              isLight ? "text-slate-500" : "text-slate-400"
            }`}>
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
            <p className={`text-xs text-center py-3 ${isLight ? "text-slate-400" : "text-zinc-500"}`}>
              No tasks added for today yet.
            </p>
          ) : (
            (showAllTasksModal ? tasks : tasks.slice(0, 3)).map((task) => (
              <div
                key={task.id}
                onClick={() => toggleTask && toggleTask(task)}
                className={`flex items-center gap-3 p-3 rounded-2xl border transition-all cursor-pointer hover:border-blue-500/40 active:scale-98 ${
                  task.completed
                    ? isLight
                      ? "bg-emerald-500/5 border-emerald-500/20"
                      : "bg-emerald-400/5 border-emerald-400/15"
                    : isLight
                      ? "bg-slate-50 border-slate-200"
                      : "bg-[#1f1f22] border-white/5"
                }`}
              >
                {task.completed ? (
                  <CircleCheck size={18} className="text-emerald-500 shrink-0" />
                ) : (
                  <Circle size={18} className="text-gray-400 shrink-0" />
                )}
                <span className={`text-xs font-semibold truncate flex-1 ${
                  task.completed ? "line-through opacity-60" : ""
                } ${isLight ? "text-slate-900" : "text-slate-100"}`}>
                  {task.text}
                </span>
                
                {/* Delete Cross Icon Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (deleteTask) deleteTask(task.id);
                  }}
                  className="p-1 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-all cursor-pointer shrink-0"
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
          className={`flex items-center px-3 py-2 rounded-xl border mt-1 ${
            isLight ? "bg-slate-50 border-slate-300" : "bg-[#121214] border-[#2a2a30]"
          }`}
        >
          <Plus size={16} className="text-gray-400 mr-2 shrink-0" />
          <input
            type="text"
            placeholder="Add a new task..."
            value={input}
            onChange={(e) => setInput && setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && handleAddTask) handleAddTask(); }}
            className={`flex-1 bg-transparent border-none outline-none text-xs font-medium ${
              isLight ? "text-slate-900 placeholder:text-slate-400" : "text-slate-100 placeholder:text-zinc-500"
            }`}
          />
          {input.trim().length > 0 && (
            <button
              onClick={() => handleAddTask && handleAddTask()}
              className="p-1 rounded-lg bg-blue-600 text-white hover:bg-blue-500 cursor-pointer shrink-0"
            >
              <ArrowUp size={14} />
            </button>
          )}
        </div>
      </div>

      {/* ── (5) Progress Stats (2×2 Grid) ── */}
      <div className="grid grid-cols-2 gap-3">
        <div 
          className={`rounded-2xl p-4 flex flex-col gap-1.5 transition-all duration-200 hover:-translate-y-0.5 border ${
            isLight 
              ? "bg-white border-slate-200 shadow-slate-200/50 shadow-sm text-slate-900" 
              : "bg-[#171717] border-white/10 shadow-2xl shadow-black/50 text-slate-100"
          }`}
        >
          <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-blue-500">
            <Clock size={14} />
            <span>Focus Time</span>
          </div>
          <span className={`text-xl font-black tracking-tight ${isLight ? "text-slate-900" : "text-slate-100"}`}>
            {(completedCount * 0.8).toFixed(1)} <span className="text-xs font-semibold opacity-70">hrs</span>
          </span>
        </div>

        <div 
          className={`rounded-2xl p-4 flex flex-col gap-1.5 transition-all duration-200 hover:-translate-y-0.5 border ${
            isLight 
              ? "bg-white border-slate-200 shadow-slate-200/50 shadow-sm text-slate-900" 
              : "bg-[#171717] border-white/10 shadow-2xl shadow-black/50 text-slate-100"
          }`}
        >
          <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-emerald-500">
            <Zap size={14} />
            <span>Sessions</span>
          </div>
          <span className={`text-xl font-black tracking-tight ${isLight ? "text-slate-900" : "text-slate-100"}`}>
            {completedCount * 2} <span className="text-xs font-semibold opacity-70">Done</span>
          </span>
        </div>

        <div 
          className={`rounded-2xl p-4 flex flex-col gap-1.5 transition-all duration-200 hover:-translate-y-0.5 border ${
            isLight 
              ? "bg-white border-slate-200 shadow-slate-200/50 shadow-sm text-slate-900" 
              : "bg-[#171717] border-white/10 shadow-2xl shadow-black/50 text-slate-100"
          }`}
        >
          <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-purple-500">
            <CheckCircle2 size={14} />
            <span>Tasks Done</span>
          </div>
          <span className={`text-xl font-black tracking-tight ${isLight ? "text-slate-900" : "text-slate-100"}`}>
            {completedCount} <span className="text-xs font-semibold opacity-70">/ {tasks.length}</span>
          </span>
        </div>

        <div 
          className={`rounded-2xl p-4 flex flex-col gap-1.5 transition-all duration-200 hover:-translate-y-0.5 border ${
            isLight 
              ? "bg-white border-slate-200 shadow-slate-200/50 shadow-sm text-slate-900" 
              : "bg-[#171717] border-white/10 shadow-2xl shadow-black/50 text-slate-100"
          }`}
        >
          <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-amber-500">
            <Target size={14} />
            <span>Daily Goal</span>
          </div>
          <span className={`text-xl font-black tracking-tight ${isLight ? "text-slate-900" : "text-slate-100"}`}>
            {Math.round(progress)}%
          </span>
        </div>
      </div>

    </div>
  );
};

export default MobileHomeView;
