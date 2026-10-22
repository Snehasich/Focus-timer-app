import instance from "../api/axiosInstance";

// ✅ LOGIN
export const loginUser = async (credentials) => {
  const res = await instance.post("/login", credentials, {
    headers: {
      "Content-Type": "application/json"
    }
  });

  if (res.data?.token) {
    localStorage.setItem("token", res.data.token);
    if (res.data.email) localStorage.setItem("email", res.data.email);
    if (res.data.name) localStorage.setItem("name", res.data.name);
    if (res.data.username) localStorage.setItem("username", res.data.username);
    if (res.data.userId) localStorage.setItem("userId", String(res.data.userId));
  }

  return res;
};

// ✅ REGISTER
export const registerUser = async (user) => {
  return instance.post("/register", user, {
    headers: {
      "Content-Type": "application/json"
    }
  });
};

// ✅ LOGOUT
export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("email");
  localStorage.removeItem("name");
  localStorage.removeItem("username");
  localStorage.removeItem("userId");
};
