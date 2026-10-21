import { createContext, useContext, useState, useEffect, useCallback } from "react";
import instance from "../api/axiosInstance";
import { getDashboardStats, logLogin } from "../services/activityService";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => localStorage.getItem("username") || "user");
  const tasksKey = `focusflow_tasks_${currentUser}`;

  // ── Global Tasks State (New users start with empty tasks) ──
  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem(`focusflow_tasks_${localStorage.getItem("username") || "user"}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return []; // Empty by default for new users!
  });

  // ── Global Dashboard Stats State ──
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const saveTasks = (newTasks) => {
    setTasks(newTasks);
    try {
      localStorage.setItem(`focusflow_tasks_${currentUser}`, JSON.stringify(newTasks));
    } catch (e) {}
  };

  // ── Fetch Dashboard Stats from API ──
  const refreshStats = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setStats(null);
        return;
      }
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
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await instance.get("/tasks");
      if (Array.isArray(res.data)) {
        setTasks(res.data);
        localStorage.setItem(`focusflow_tasks_${currentUser}`, JSON.stringify(res.data));
      }
    } catch (err) {
      console.error("Task fetch error:", err);
    }
  }, [currentUser]);

  // Sync state whenever user logs in or switches account
  useEffect(() => {
    fetchTasks();
    refreshStats();
  }, [currentUser, fetchTasks, refreshStats]);

  const switchUser = (newUsername) => {
    const user = newUsername || "user";
    setCurrentUser(user);
    try {
      const saved = localStorage.getItem(`focusflow_tasks_${user}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setTasks(parsed);
      } else {
        setTasks([]);
      }
    } catch (e) {
      setTasks([]);
    }
  };

  const clearSession = () => {
    setCurrentUser("user");
    setTasks([]);
    setStats(null);
  };

  // ── Add Task ──
  const addTask = async (newTaskText) => {
    if (!newTaskText || newTaskText.trim() === "") return;
    const text = newTaskText.trim();
    const tempId = Date.now();
    const tempTask = { id: tempId, text, completed: false };
    const updated = [...tasks, tempTask];
    saveTasks(updated);

    try {
      const res = await instance.post("/tasks", { text, completed: false });
      if (res.data && res.data.id) {
        setTasks((prev) =>
          prev.map((t) => (t.id === tempId ? { ...t, id: res.data.id } : t))
        );
      }
      logLogin().catch(() => {});
      refreshStats();
    } catch (err) {
      console.error("Error creating task:", err);
    }
  };

  // ── Toggle Task Completed ──
  const toggleTask = async (task) => {
    const nextCompleted = !task.completed;
    const updated = tasks.map((t) =>
      t.id === task.id ? { ...t, completed: nextCompleted } : t
    );
    saveTasks(updated);

    try {
      await instance.put(`/tasks/${task.id}`, {
        text: task.text,
        completed: nextCompleted,
      });
      logLogin().catch(() => {});
      refreshStats();
    } catch (err) {
      console.error("Error toggling task:", err);
    }
  };

  // ── Delete Task ──
  const deleteTask = async (taskId) => {
    const updated = tasks.filter((t) => t.id !== taskId);
    saveTasks(updated);

    try {
      await instance.delete(`/tasks/${taskId}`);
      refreshStats();
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  };

  // ── Bulk Actions ──
  const executeBulkAction = async (action) => {
    if (!action) return;

    if (action === "mark-all-completed") {
      const updated = tasks.map((t) => ({ ...t, completed: true }));
      saveTasks(updated);
      try {
        await instance.post("/tasks/bulk", { action: "mark-all-completed" });
        refreshStats();
      } catch (e) {
        console.error("Bulk action failed:", e);
      }
    } else if (action === "clear-completed") {
      const updated = tasks.filter((t) => !t.completed);
      saveTasks(updated);
      try {
        await instance.post("/tasks/bulk", { action: "clear-completed" });
        refreshStats();
      } catch (e) {
        console.error("Bulk action failed:", e);
      }
    } else if (action === "delete-all") {
      saveTasks([]);
      try {
        await instance.post("/tasks/bulk", { action: "delete-all" });
        refreshStats();
      } catch (e) {
        console.error("Bulk action failed:", e);
      }
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        switchUser,
        clearSession,
        tasks,
        stats,
        statsLoading,
        refreshStats,
        fetchTasks,
        addTask,
        toggleTask,
        deleteTask,
        executeBulkAction,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
