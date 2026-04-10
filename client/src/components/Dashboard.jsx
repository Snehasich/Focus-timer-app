import { useNavigate } from "react-router-dom";
import { logout } from "../services/authService";

function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="w-full h-[99%] bg-gray-900 flex flex-col items-center justify-center rounded-4xl text-white">
      <h2>Dashboard COMING SOON</h2>
    </div>
  );
}

export default Dashboard;