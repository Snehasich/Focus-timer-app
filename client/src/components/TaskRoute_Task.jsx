import { memo, useState, useEffect, useRef } from "react";
import instance from "../api/axiosInstance";
import { Plus, ArrowUp, CheckCheck } from "lucide-react";
import { InsideTask } from "./InsideTask";
import FocusBreak from "./Timer/FocusBreak";
import { useTheme } from "../context/ThemeContext";

export const TaskRouteTask = memo(({ 
  filter = "All Tasks", 
  sortBy = "Default", 
  bulkAction = null, 
  onBulkActionProcessed 
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [input, setInput] = useState("");
  const [tasks, setTasks] = useState([]);
  const [leftVisible, setLeftVisible]   = useState(false);
  const [rightVisible, setRightVisible] = useState(false);
  const inputRef = useRef(null);
  const { theme } = useTheme();

  const fetchTasks = () => {
    instance.get("/tasks")
      .then((res) => setTasks(res.data))
      .catch((err) => console.error("Fetch error:", err));
  };

  useEffect(() => {
    fetchTasks();
    setTimeout(() => setLeftVisible(true),  150);
    setTimeout(() => setRightVisible(true), 280);
  }, []);

  // ── Execute Bulk Actions ──
  useEffect(() => {
    if (!bulkAction) return;

    if (bulkAction === "Reset All Tasks") {
      const deletePromises = tasks.map((task) => instance.delete(`/tasks/${task.id}`));
      Promise.all(deletePromises)
        .then(() => {
          fetchTasks();
          onBulkActionProcessed();
        })
        .catch((err) => console.error("Bulk delete error:", err));
    } else if (bulkAction === "Mark All Completed") {
      const updatePromises = tasks
        .filter((t) => !t.completed)
        .map((t) => instance.put(`/tasks/${t.id}`, { ...t, completed: true }));
      Promise.all(updatePromises)
        .then(() => {
          fetchTasks();
          onBulkActionProcessed();
        })
        .catch((err) => console.error("Bulk complete error:", err));
    } else if (bulkAction === "Mark All Active") {
      const updatePromises = tasks
        .filter((t) => t.completed)
        .map((t) => instance.put(`/tasks/${t.id}`, { ...t, completed: false }));
      Promise.all(updatePromises)
        .then(() => {
          fetchTasks();
          onBulkActionProcessed();
        })
        .catch((err) => console.error("Bulk active error:", err));
    }
  }, [bulkAction, tasks]);

  const handleAddTask = () => {
    if (input.trim() === "") return;
    const newTaskText = input.trim();
    setInput("");

    // Optimistic UI addition: display task instantly
    const tempId = Date.now();
    const tempTask = { id: tempId, text: newTaskText, completed: false };
    setTasks((prev) => [...prev, tempTask]);

    instance.post("/tasks", { text: newTaskText, completed: false })
      .then((res) => {
        if (res.data && res.data.id) {
          setTasks((prev) => prev.map((t) => (t.id === tempId ? res.data : t)));
        } else {
          fetchTasks();
        }
      })
      .catch((err) => {
        console.error("Add error:", err);
        fetchTasks();
      });
  };

  const toggleTask = (task) => {
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, completed: !t.completed } : t)));
    instance.put(`/tasks/${task.id}`, { ...task, completed: !task.completed })
      .catch((err) => {
        console.error("Toggle error:", err);
        fetchTasks();
      });
  };

  const deleteTask = (id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    instance.delete(`/tasks/${id}`)
      .catch((err) => {
        console.error("Delete error:", err);
        fetchTasks();
      });
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const progress = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;
  const isLight = theme === "light";

  // ── FILTER TASKS ──
  const filteredTasks = tasks.filter((task) => {
    if (filter === "Active Only") return !task.completed;
    if (filter === "Completed Only") return task.completed;
    return true; // "All Tasks"
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
    return 0; // "Default"
  });

  return (
    <>
      <style>{`
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .card-left-normal {
          animation: cardIn 0.5s cubic-bezier(0.22,1,0.36,1) forwards;
          box-shadow: ${isLight 
            ? "0 10px 30px rgba(0,0,0,0.04), 0 2px 8px rgba(0,0,0,0.02)" 
            : "inset 0 1px 0 rgba(255, 255, 255, 0.12), 0 0 0 1px rgba(255, 255, 255, 0.03), 0 16px 48px rgba(0, 0, 0, 0.8)"};
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
        }
        .card-right-normal {
          animation: cardIn 0.5s cubic-bezier(0.22,1,0.36,1) forwards;
          box-shadow: ${isLight 
            ? "0 10px 30px rgba(0,0,0,0.04), 0 2px 8px rgba(0,0,0,0.02)" 
            : "inset 0 1px 0 rgba(255, 255, 255, 0.12), 0 0 0 1px rgba(255, 255, 255, 0.03), 0 16px 48px rgba(0, 0, 0, 0.8)"};
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
        }
        .add-input-wrap {
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .add-input-wrap:hover {
          border-color: #3b82f6 !important;
        }
        .add-input-wrap.focused {
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
        }
        .add-input-wrap input::placeholder {
          color: ${isLight ? "#9ca3af" : "#4b5563"};
        }
        .submit-arrow {
          transition: transform 0.15s ease, color 0.15s ease;
        }
        .submit-arrow:hover { transform: scale(1.15); color: #60a5fa; }
        .progress-bar { transition: width 0.6s cubic-bezier(0.22,1,0.36,1); }
      `}</style>

      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 w-full flex-1 min-h-0">

        {/* ── LEFT CARD — Tasks ── */}
        <div
          className="card-left-normal w-full lg:max-w-[380px] lg:min-w-[320px] min-h-[350px] lg:h-full flex flex-col flex-shrink-0"
          style={{
            opacity: leftVisible ? undefined : 0,
            borderRadius: 20,
            border: isLight ? "1px solid #e2e8f0" : "1px solid rgba(0,0,0,0.8)",
            background: isLight ? "#ffffff" : "#111",
            padding: 20,
            gap: 12,
            boxSizing: "border-box",
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <h2 style={{ color: isLight ? "#111827" : "#f0f0f0", fontWeight: 700, fontSize: "1.1rem", margin: 0, letterSpacing: "-0.3px" }}>
                Today
              </h2>
              <p style={{ color: isLight ? "#6B7280" : "#8e9196", fontSize: "0.75rem", margin: "2px 0 0" }}>
                {completedCount} of {tasks.length} completed
              </p>
            </div>
            {tasks.length > 0 && (
              <div style={{
                display: "flex", alignItems: "center", gap: 5,
                background: isLight ? "#f1f5f9" : "#1a1a1a",
                border: isLight ? "1px solid #e2e8f0" : "1px solid #2a2a2a",
                borderRadius: 20, padding: "3px 10px",
              }}>
                <CheckCheck size={12} color={isLight ? "#2563eb" : "#4ade80"} />
                <span style={{ color: isLight ? "#2563eb" : "#4ade80", fontSize: "0.72rem", fontWeight: 600 }}>
                  {Math.round(progress)}%
                </span>
              </div>
            )}
          </div>

          {/* Progress bar */}
          {tasks.length > 0 && (
            <div style={{ height: 3, background: isLight ? "#e5e7eb" : "#1e1e1e", borderRadius: 3, overflow: "hidden" }}>
              <div
                className="progress-bar"
                style={{
                  height: "100%",
                  width: `${progress}%`,
                  background: progress === 100
                    ? (isLight ? "#10b981" : "#4ade80")
                    : "linear-gradient(90deg, #3b82f6, #8b5cf6)",
                  borderRadius: 3,
                }}
              />
            </div>
          )}

          {/* Task list */}
          <div style={{ flex: 1, overflowY: "auto" }} className="min-h-[160px]">
            <InsideTask tasks={sortedTasks} toggleTask={toggleTask} deleteTask={deleteTask} />
          </div>

          {/* Add task input */}
          <div
            className={`add-input-wrap${isFocused ? " focused" : ""}`}
            style={{
              display: "flex",
              alignItems: "center",
              background: isLight ? "#f8fafc" : "#0e0e0e",
              border: isLight ? "1px solid #e2e8f0" : "1px solid #252525",
              borderRadius: 12,
            }}
          >
            {!isFocused && (
              <Plus size={16} style={{ marginLeft: 12, color: isLight ? "#9ca3af" : "#444", flexShrink: 0 }} />
            )}
            <input
              ref={inputRef}
              type="text"
              placeholder="Add a task..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onKeyDown={(e) => { if (e.key === "Enter") handleAddTask(); }}
              style={{
                flex: 1,
                padding: "11px 12px",
                background: "transparent",
                border: "none",
                outline: "none",
                color: isLight ? "#111827" : "#e0e0e0",
                fontSize: "0.85rem",
              }}
            />
            {isFocused && (
              <ArrowUp
                className="submit-arrow"
                style={{ marginRight: 12, color: isLight ? "#9ca3af" : "#555", cursor: "pointer", flexShrink: 0 }}
                onMouseDown={(e) => { e.preventDefault(); handleAddTask(); }}
                size={16}
              />
            )}
          </div>
        </div>

        {/* ── RIGHT CARD — Timer ── */}
        <div
          className="card-right-normal w-full lg:flex-1 min-h-[420px] lg:h-full flex flex-col items-center justify-center relative overflow-hidden"
          style={{
            opacity: rightVisible ? undefined : 0,
            borderRadius: 20,
            border: isLight ? "1px solid #e2e8f0" : "1px solid rgba(0,0,0,0.8)",
            background: isLight ? "#ffffff" : "#111",
            padding: "clamp(16px, 4vw, 24px)",
            boxSizing: "border-box",
          }}
        >
          <FocusBreak />
        </div>

      </div>
    </>
  );
});

export default TaskRouteTask;