import { createContext, useContext, useState, useEffect, useCallback } from "react";
import instance from "../api/axiosInstance";
import { getDashboardStats, logLogin } from "../services/activityService";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => 
    localStorage.getItem("email") || localStorage.getItem("username") || "user"
  );
  const [currentName, setCurrentName] = useState(() => 
    localStorage.getItem("name") || localStorage.getItem("username") || "User"
  );

  // ── Global Tasks State (User isolated) ──
  const [tasks, setTasks] = useState(() => {
    try {
      const activeUser = localStorage.getItem("email") || localStorage.getItem("username") || "user";
      const saved = localStorage.getItem(`focusflow_tasks_${activeUser}`);
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

  const switchUser = (newUserEmail, newUserName) => {
    const userEmail = newUserEmail || "user";
    const userName = newUserName || userEmail.split("@")[0] || "User";
    setCurrentUser(userEmail);
    setCurrentName(userName);
    try {
      const saved = localStorage.getItem(`focusflow_tasks_${userEmail}`);
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
    setCurrentName("User");
    setTasks([]);
    setStats(null);
  };

  // ── Add Task (Instant optimistic UI) ──
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
      refreshStats();
    } catch (err) {
      console.error("Error creating task:", err);
    }
  };

  // ── Toggle Task Completed (Instant optimistic UI) ──
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
      refreshStats();
    } catch (err) {
      console.error("Error toggling task:", err);
    }
  };

  // ── Delete Task (Instant optimistic UI) ──
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

  // ── Bulk Actions (Instant optimistic UI + fast backend sync) ──
  const executeBulkAction = async (rawAction) => {
    if (!rawAction) return;
    const action = String(rawAction).trim().toLowerCase().replace(/\s+/g, "-").replace(/_/g, "-");

    if (action === "mark-all-completed") {
      const updated = tasks.map((t) => ({ ...t, completed: true }));
      saveTasks(updated);
      try {
        await instance.post("/tasks/bulk", { action: "mark-all-completed" });
        refreshStats();
      } catch (e) {
        console.error("Bulk action failed:", e);
      }
    } else if (action === "mark-all-active") {
      const updated = tasks.map((t) => ({ ...t, completed: false }));
      saveTasks(updated);
      try {
        await instance.post("/tasks/bulk", { action: "mark-all-active" });
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
    } else if (action === "delete-all" || action === "reset-all-tasks") {
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
        currentName,
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
