import { createContext, useContext, useState, useEffect, useCallback } from "react";
import instance from "../api/axiosInstance";
import { getDashboardStats, logLogin } from "../services/activityService";

const AppContext = createContext();

const DEFAULT_INITIAL_TASKS = [
  { id: 101, text: "Complete 50-minute Pomodoro focus session", completed: false },
  { id: 102, text: "Review daily study & project goals", completed: true },
  { id: 103, text: "Organize notes and schedule events", completed: false }
];

export const AppProvider = ({ children }) => {
  // ── Global Tasks State ──
  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem("focusflow_tasks");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return DEFAULT_INITIAL_TASKS;
  });

  // ── Global Dashboard Stats State ──
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const saveTasks = (newTasks) => {
    setTasks(newTasks);
    try {
      localStorage.setItem("focusflow_tasks", JSON.stringify(newTasks));
    } catch (e) {}
  };

  // ── Fetch Dashboard Stats from API ──
  const refreshStats = useCallback(async () => {
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error("Stats refresh error:", err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // ── Fetch Tasks from API ──
  const fetchTasks = useCallback(async () => {
    try {
      const res = await instance.get("/tasks");
      if (Array.isArray(res.data) && res.data.length > 0) {
        saveTasks(res.data);
      } else {
        const localSaved = localStorage.getItem("focusflow_tasks");
        let localTasks = [];
        try {
          localTasks = localSaved ? JSON.parse(localSaved) : [];
        } catch (e) {}

        if (localTasks.length > 0) {
          setTasks(localTasks);
          localTasks.forEach((t) => {
            instance.post("/tasks", { text: t.text, completed: t.completed }).catch(() => {});
          });
        } else {
          saveTasks(DEFAULT_INITIAL_TASKS);
          DEFAULT_INITIAL_TASKS.forEach((t) => {
            instance.post("/tasks", { text: t.text, completed: t.completed }).catch(() => {});
          });
        }
      }
    } catch (err) {
      console.error("Task fetch error:", err);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
    refreshStats();
  }, [fetchTasks, refreshStats]);

  // ── Add Task ──
  const addTask = async (newTaskText) => {
    if (!newTaskText || newTaskText.trim() === "") return;
    const text = newTaskText.trim();
    const tempId = Date.now();
    const tempTask = { id: tempId, text, completed: false };
    const updated = [...tasks, tempTask];
    saveTasks(updated);
    logLogin().catch(() => {});
    refreshStats();

    try {
      const res = await instance.post("/tasks", { text, completed: false });
      if (res.data && res.data.id) {
        const synced = updated.map((t) => (t.id === tempId ? res.data : t));
        saveTasks(synced);
      }
      refreshStats();
    } catch (err) {
      console.error("Add task error:", err);
    }
  };

  // ── Toggle Task ──
  const toggleTask = async (task) => {
    const updated = tasks.map((t) => (t.id === task.id ? { ...t, completed: !t.completed } : t));
    saveTasks(updated);
    logLogin().catch(() => {});
    refreshStats();

    try {
      await instance.put(`/tasks/${task.id}`, { ...task, completed: !task.completed });
      refreshStats();
    } catch (err) {
      console.error("Toggle task error:", err);
    }
  };

  // ── Delete Task ──
  const deleteTask = async (id) => {
    const updated = tasks.filter((t) => t.id !== id);
    saveTasks(updated);
    logLogin().catch(() => {});
    refreshStats();

    try {
      await instance.delete(`/tasks/${id}`);
      refreshStats();
    } catch (err) {
      console.error("Delete task error:", err);
    }
  };

  // ── Execute Bulk Action ──
  const executeBulkAction = async (action) => {
    if (!action) return;

    if (action === "Reset All Tasks") {
      const deletePromises = tasks.map((task) => instance.delete(`/tasks/${task.id}`));
      saveTasks([]);
      refreshStats();
      try {
        await Promise.all(deletePromises);
        fetchTasks();
        refreshStats();
      } catch (err) {
        console.error("Bulk delete error:", err);
      }
    } else if (action === "Mark All Completed") {
      const updated = tasks.map((t) => ({ ...t, completed: true }));
      saveTasks(updated);
      refreshStats();
      const updatePromises = tasks
        .filter((t) => !t.completed)
        .map((t) => instance.put(`/tasks/${t.id}`, { ...t, completed: true }));
      try {
        await Promise.all(updatePromises);
        fetchTasks();
        refreshStats();
      } catch (err) {
        console.error("Bulk complete error:", err);
      }
    } else if (action === "Mark All Active") {
      const updated = tasks.map((t) => ({ ...t, completed: false }));
      saveTasks(updated);
      refreshStats();
      const updatePromises = tasks
        .filter((t) => t.completed)
        .map((t) => instance.put(`/tasks/${t.id}`, { ...t, completed: false }));
      try {
        await Promise.all(updatePromises);
        fetchTasks();
        refreshStats();
      } catch (err) {
        console.error("Bulk active error:", err);
      }
    }
  };

  return (
    <AppContext.Provider
      value={{
        tasks,
        saveTasks,
        fetchTasks,
        addTask,
        toggleTask,
        deleteTask,
        executeBulkAction,

        stats,
        statsLoading,
        refreshStats,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
