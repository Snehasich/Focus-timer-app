import axios from "axios";

const instance = axios.create({
  baseURL: "https://focus-timer-app-1.onrender.com"
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