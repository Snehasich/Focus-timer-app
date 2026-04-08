import instance from "../api/axiosInstance";

// ✅ LOGIN
export const loginUser = async (user) => {
  const res = await instance.post("/login", user);

  if (res.data.token) {
    localStorage.setItem("token", res.data.token); // ✅ IMPORTANT
  }

  return res;
};

// ✅ REGISTER
export const registerUser = (user) => {
  return instance.post("/register", user);
};

// ✅ LOGOUT
export const logout = () => {
  localStorage.removeItem("token");
};