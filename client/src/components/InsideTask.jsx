import { memo } from 'react';
import { Circle, CircleCheck, CircleX } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export const InsideTask = memo(({ tasks = [], toggleTask, deleteTask }) => {
  const { theme } = useTheme();
  const isLight = theme === "light";

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {(!tasks || tasks.length === 0) && (
        <div className={`flex flex-col items-center justify-center py-8 text-center ${
          isLight ? "text-slate-400" : "text-zinc-600"
        }`}>
          <p className="text-xs font-semibold">No tasks found</p>
          <p className="text-[11px] mt-0.5 opacity-75">Add a new task below to get started</p>
        </div>
      )}

      {tasks.map((task) => (
        <div
          key={task.id}
          className={`group px-3 py-2.5 rounded-xl flex items-center gap-2.5 transition-all duration-150 border hover:border-blue-500 ${
            task.completed
              ? isLight
                ? "bg-emerald-500/5 border-emerald-500/20"
                : "bg-emerald-400/5 border-emerald-400/15"
              : isLight
                ? "bg-white border-slate-200 shadow-xs hover:bg-slate-50"
                : "bg-[#0e0e0e] border-black/50 shadow-inner hover:bg-[#161622]"
          }`}
        >
          {/* Toggle Button & Text */}
          <div
            className="flex items-center gap-2.5 flex-1 cursor-pointer min-w-0"
            onClick={() => toggleTask && toggleTask(task)}
          >
            {task.completed ? (
              <CircleCheck size={17} className={`shrink-0 ${isLight ? "text-emerald-500" : "text-emerald-400"}`} />
            ) : (
              <Circle size={17} className={`shrink-0 ${isLight ? "text-slate-400" : "text-zinc-600"}`} />
            )}

            <span
              className={`text-xs sm:text-[13.5px] font-medium truncate transition-colors duration-200 ${
                task.completed
                  ? isLight
                    ? "line-through text-slate-400"
                    : "line-through text-zinc-600"
                  : isLight
                    ? "text-gray-900"
                    : "text-zinc-200"
              }`}
            >
              {task.text}
            </span>
          </div>

          {/* Delete Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (deleteTask) deleteTask(task.id);
            }}
            className={`p-1 rounded-lg transition-all cursor-pointer shrink-0 opacity-70 group-hover:opacity-100 hover:scale-110 ${
              isLight ? "text-slate-400 hover:text-red-500 hover:bg-red-50" : "text-zinc-500 hover:text-red-400 hover:bg-red-500/10"
            }`}
            title="Delete task"
          >
            <CircleX size={16} />
          </button>
        </div>
      ))}
    </div>
  );
});