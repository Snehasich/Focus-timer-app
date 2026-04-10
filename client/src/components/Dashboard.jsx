import { useNavigate } from "react-router-dom";
import { logout } from "../services/authService";

function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-gray-900 rounded-4xl text-white">
      <h2>Dashboard COMING SOON</h2>
    </div>
  );
}

export default Dashboard;