import { memo } from 'react';
import { Circle, CircleCheck, CircleX } from "lucide-react";

export const InsideTask = memo(({ tasks, toggleTask, deleteTask }) => {
  return (
    <div className="text-white flex flex-col gap-2">

      {tasks.length === 0 && (
        <p className="text-gray-500 text-sm text-center mt-4">
          No tasks yet
        </p>
      )}

      {tasks.map((task) => (
        <div
          key={task.id}   // ✅ use id (important)
          className="p-2 rounded-lg bg-[#2b2a2a] border border-gray-700 flex items-center gap-3 hover:border-blue-400 transition-all"
        >

          {/* Toggle */}
          <div
            className="flex items-center gap-2 flex-1 cursor-pointer hover:scale-105 transition"
            onClick={() => toggleTask(task)}   // ✅ pass full task
          >
            {task.completed ? <CircleCheck /> : <Circle />}

            <span
              className={`${
                task.completed
                  ? "line-through text-gray-500"
                  : "text-white"
              }`}
            >
              {task.text}
            </span>
          </div>

          {/* Delete */}
          <CircleX
            className="cursor-pointer text-red-400 hover:scale-110 transition"
            onClick={() => deleteTask(task.id)}   // ✅ use id
          />

        </div>
      ))}

    </div>
  );
});