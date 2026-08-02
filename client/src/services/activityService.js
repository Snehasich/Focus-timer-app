import axios from "../api/axiosInstance";

// ── Record today's login/visit in the DB with streak sync ──
export const logLogin = async () => {
  try {
    const streak = parseInt(localStorage.getItem("focusflow_streak") || "4", 10);
    await axios.post(`/activity/login?streak=${streak}`);
  } catch (err) {
    console.warn("Activity login log failed:", err?.response?.data || err.message);
  }
};

// ── Log a completed focus session ──
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
