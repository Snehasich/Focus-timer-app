import { memo } from 'react';
import { Circle, CircleCheck, CircleX } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export const InsideTask = memo(({ tasks, toggleTask, deleteTask }) => {
  const { theme } = useTheme();
  const isLight = theme === "light";

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {tasks.length === 0 && (
        <p className={`text-xs text-center mt-4 ${isLight ? "text-slate-400" : "text-zinc-600"}`}>
          No tasks yet
        </p>
      )}

      {tasks.map((task) => (
        <div
          key={task.id}
          className={`group px-3 py-2.2 rounded-xl flex items-center gap-2.5 transition-all duration-150 border hover:border-blue-500 hover:translate-x-0.5 ${
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
            className="flex items-center gap-2.5 flex-1 cursor-pointer transition-all duration-150 group-hover:opacity-100"
            onClick={() => toggleTask(task)}
          >
            {task.completed ? (
              <CircleCheck size={16} className={isLight ? "text-emerald-500" : "text-emerald-400"} />
            ) : (
              <Circle size={16} className={isLight ? "text-slate-400" : "text-zinc-600"} />
            )}

            <span
              className={`text-[13.5px] transition-colors duration-200 ${
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
          <CircleX
            size={15}
            className={`cursor-pointer opacity-0 group-hover:opacity-100 hover:scale-125 transition-all duration-150 ${
              isLight ? "text-slate-400 hover:text-red-500" : "text-zinc-600 hover:text-red-400"
            }`}
            onClick={() => deleteTask(task.id)}
          />
        </div>
      ))}
    </div>
  );
});