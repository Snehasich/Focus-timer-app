import { memo } from 'react';
import { Circle, CircleCheck, CircleX } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export const InsideTask = memo(({ tasks, toggleTask, deleteTask }) => {
  const { theme } = useTheme();
  const isLight = theme === "light";

  return (
    <>
      <style>{`
        @keyframes taskSlideIn {
          from { opacity: 0; transform: translateX(-14px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .task-item {
          animation: taskSlideIn 0.3s cubic-bezier(0.22,1,0.36,1) both;
          transition: background 0.18s ease, border-color 0.18s ease, transform 0.15s ease;
        }
        .task-item:hover {
          border-color: #3b82f6 !important;
          background: ${isLight ? "#f8fafc" : "#161622"} !important;
          transform: translateX(2px);
        }
        .toggle-btn {
          transition: transform 0.15s ease, opacity 0.15s ease;
        }
        .toggle-btn:hover { transform: scale(1.12); opacity: 0.85; }
        .delete-btn {
          opacity: 0;
          transition: opacity 0.15s ease, transform 0.15s ease, color 0.15s ease;
        }
        .task-item:hover .delete-btn {
          opacity: 1;
        }
        .delete-btn:hover {
          transform: scale(1.2);
          color: #f87171 !important;
        }
      `}</style>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>

        {tasks.length === 0 && (
          <p style={{ color: isLight ? "#9ca3af" : "#555", fontSize: "0.82rem", textAlign: "center", marginTop: 16 }}>
            No tasks yet
          </p>
        )}

        {tasks.map((task) => (
          <div
            key={task.id}
            className="task-item"
            style={{
              padding: "9px 12px",
              borderRadius: 10,
              background: task.completed 
                ? (isLight ? "rgba(16,185,129,0.05)" : "rgba(74,222,128,0.03)") 
                : (isLight ? "#ffffff" : "#0e0e0e"),
              border: task.completed 
                ? (isLight ? "1px solid rgba(16,185,129,0.2)" : "1px solid rgba(74,222,128,0.15)") 
                : (isLight ? "1px solid #e2e8f0" : "1px solid rgba(0,0,0,0.5)"),
              boxShadow: isLight
                ? "none"
                : "inset 0 1px 0 rgba(255,255,255,0.04), 0 2px 6px rgba(0,0,0,0.3)",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            {/* Toggle */}
            <div
              className="toggle-btn"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                flex: 1,
                cursor: "pointer",
              }}
              onClick={() => toggleTask(task)}
            >
              {task.completed ? (
                <CircleCheck size={16} color={isLight ? "#10b981" : "#4ade80"} />
              ) : (
                <Circle size={16} color={isLight ? "#94a3b8" : "#444455"} />
              )}

              <span
                style={{
                  fontSize: "0.86rem",
                  textDecoration: task.completed ? "line-through" : "none",
                  color: task.completed
                    ? (isLight ? "#94a3b8" : "#555566")
                    : (isLight ? "#111827" : "#e0e0e8"),
                  transition: "color 0.2s ease",
                }}
              >
                {task.text}
              </span>
            </div>

            {/* Delete */}
            <CircleX
              className="delete-btn"
              size={15}
              style={{
                cursor: "pointer",
                color: isLight ? "#94a3b8" : "#444455",
              }}
              onClick={() => deleteTask(task.id)}
            />

          </div>
        ))}

      </div>
    </>
  );
});