import { useState } from "react";
import { registerUser } from "../services/authService";
import { useNavigate } from "react-router-dom";

function Register() {
  const [user, setUser] = useState({
    username: "",
    password: ""
  });

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await registerUser(user);

      alert("Registered successfully");

      navigate("/login"); // ✅ FIXED
    } catch (err) {
      alert("Registration failed");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-2xl w-80 text-white">
        <h2 className="text-2xl mb-6 text-center">Register</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            required
            minLength={3}
            placeholder="Username"
            value={user.username}
            className="p-2 bg-gray-700"
            onChange={(e) =>
              setUser({ ...user, username: e.target.value })
            }
          />

          <input
            required
            minLength={3}
            type="password"
            placeholder="Password"
            value={user.password}
            className="p-2 bg-gray-700"
            onChange={(e) =>
              setUser({ ...user, password: e.target.value })
            }
          />

          <button className="bg-green-500 p-2">Register</button>
        </form>
      </div>
    </div>
  );
}

export default Register;