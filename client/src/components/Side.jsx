import { useLocation, useNavigate } from "react-router-dom";
import { Timer, House, TimerReset, LayoutDashboard } from "lucide-react";

export const Side = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const getClass = (path) => {
    return `text-white p-2 rounded-2xl flex items-center gap-2 transition-colors
    ${location.pathname === path ? "bg-blue-600" : "hover:bg-blue-400"}`;
  };

  return (
    <div className="bg-[#0f0f0f] h-screen w-[241px] flex flex-col py-6">
      <div className="flex flex-col gap-4 p-6">

        <button onClick={() => navigate("/")} className={getClass("/")}>
          <House /> Home
        </button>

        <button onClick={() => navigate("/focusbreak")} className={getClass("/focusbreak")}>
          <Timer /> Timer
        </button>

        <button onClick={() => navigate("/stopwatch")} className={getClass("/stopwatch")}>
          <TimerReset /> StopWatch
        </button>

        <button onClick={() => navigate("/dashboard")} className={getClass("/dashboard")}>
          <LayoutDashboard /> Dashboard
        </button>

      </div>
    </div>
  );
};