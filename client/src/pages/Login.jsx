import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../services/authService";

function Login() {
  const [user, setUser] = useState({
    username: "",
    password: ""
  });

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await loginUser(user);

      if (res.data.token) {
        navigate("/"); // ✅ go to home
      } else {
        alert("Login failed");
      }
    } catch (err) {
      alert("Invalid credentials or server waking up...");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-2xl w-80 text-white">
        <h2 className="text-2xl mb-6 text-center">Login</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            placeholder="Username"
            className="p-2 bg-gray-700"
            onChange={(e) =>
              setUser({ ...user, username: e.target.value })
            }
          />

          <input
            type="password"
            placeholder="Password"
            className="p-2 bg-gray-700"
            onChange={(e) =>
              setUser({ ...user, password: e.target.value })
            }
          />

          <button className="bg-blue-500 p-2">Login</button>
        </form>

        <p className="mt-4 text-center">
          No account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;