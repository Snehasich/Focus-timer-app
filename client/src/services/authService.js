import instance from "../api/axiosInstance";

// ✅ LOGIN
export const loginUser = async (user) => {
  const res = await instance.post("/login", user, {
    headers: {
      "Content-Type": "application/json"
    }
  });

  if (res.data.token) {
    localStorage.setItem("token", res.data.token);
    // Save username for sidebar greeting
    localStorage.setItem("username", res.data.username || user.username);
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
};