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
      navigate("/");
    } catch (err) {
      alert("Registration failed");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      
      <div className="bg-gray-800 p-8 rounded-2xl shadow-lg w-80">
        
        <h2 className="text-white text-2xl font-semibold mb-6 text-center">
          Create Account
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          <input
            className="p-2 rounded bg-gray-700 text-white outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Username"
            onChange={(e) =>
              setUser({ ...user, username: e.target.value })
            }
          />

          <input
            className="p-2 rounded bg-gray-700 text-white outline-none focus:ring-2 focus:ring-blue-500"
            type="password"
            placeholder="Password"
            onChange={(e) =>
              setUser({ ...user, password: e.target.value })
            }
          />

          <button
            className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded transition duration-200"
          >
            Register
          </button>

        </form>

        <p className="text-gray-400 mt-4 text-sm text-center">
          Already have an account?{" "}
          <a href="/login" className="text-blue-400 hover:underline">
            Login
          </a>
        </p>

      </div>
    </div>
  );
}

export default Register;