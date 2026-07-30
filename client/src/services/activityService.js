import axios from "../api/axiosInstance";

// ── Record today's login/visit in the DB ──
export const logLogin = async () => {
  try {
    await axios.post("/activity/login");
  } catch (err) {
    // Silently fail — non-critical
    console.warn("Activity login log failed:", err?.response?.data || err.message);
  }
};

// ── Log a completed focus session ──
// focusSeconds: total seconds completed, sessions: number of pomodoros
export const logFocusSession = async (focusSeconds, sessions = 1) => {
  try {
    await axios.post("/activity/log", { focusSeconds, sessions });
  } catch (err) {
    console.warn("Activity session log failed:", err?.response?.data || err.message);
  }
};

// ── Fetch full dashboard stats for the logged-in user ──
export const getDashboardStats = async () => {
  const res = await axios.get("/activity/stats");
  return res.data;
};
