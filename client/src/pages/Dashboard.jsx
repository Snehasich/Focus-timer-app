import { useNavigate } from "react-router-dom";
import { logout } from "../services/authService";

function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div>
      <h2>Dashboard (Protected)</h2>

      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default Dashboard;