import axios from "axios";

const API = "https://focus-timer-app-2.onrender.com/";

// ✅ LOGIN
export const loginUser = async (user) => {
  const res = await axios.post(API + "login", user);

  if (res.data.token) {
    localStorage.setItem("token", res.data.token);
  }

  return res;
};

// ✅ REGISTER (THIS IS MISSING IN YOUR CODE ❌)
export const registerUser = (user) => {
  return axios.post(API + "register", user);
};