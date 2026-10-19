import axios from "axios";

// Determine API Base URL
const hostname = typeof window !== "undefined" ? window.location.hostname : "";

const isLocalhost = Boolean(
  hostname === "localhost" ||
  hostname === "127.0.0.1" ||
  hostname === "[::1]"
);

const isLan = Boolean(
  hostname.endsWith(".local") ||
  /^192\.168\.\d{1,3}\.\d{1,3}$/.test(hostname) ||
  /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname) ||
  /^172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}$/.test(hostname)
);

// When running locally or on LAN (same Wi-Fi), use relative path ("")
// so Vite's proxy forwards requests to Spring Boot on localhost:8080 seamlessly.
// For production deployments (Vercel, Render), use the production backend URL.
let defaultApiUrl = "https://focus-timer-app-1.onrender.com";
if (isLocalhost || isLan) {
  defaultApiUrl = "";
}

const API_BASE_URL = import.meta.env.VITE_API_URL !== undefined 
  ? import.meta.env.VITE_API_URL 
  : defaultApiUrl;

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