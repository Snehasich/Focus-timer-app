import axios from "axios";

const isLocalhost = Boolean(
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
   window.location.hostname === "127.0.0.1" ||
   window.location.hostname === "[::1]")
);

const API_BASE_URL = import.meta.env.VITE_API_URL || (isLocalhost ? "http://localhost:8080" : "https://focus-timer-app-1.onrender.com");

const instance = axios.create({
  baseURL: API_BASE_URL
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  // ❌ DO NOT attach token for login/register
  if (
    token &&
    !config.url.includes("/login") &&
    !config.url.includes("/register")
  ) {
    config.headers.Authorization = "Bearer " + token;
  }

  return config;
});

export default instance;