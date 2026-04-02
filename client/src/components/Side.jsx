import { memo } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import { Timer, House, TimerReset } from "lucide-react";
import { StopWatch } from './Timer/StopWatch';

export const Side = memo(() => {
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ ONE PLACE for styling logic
  const getClass = (path) =>
    `text-white p-2 rounded-4xl flex items-center gap-2 transition 
    ${location.pathname === path ? "bg-blue-600" : "hover:bg-blue-400"}`;

  return (
    <div className="bg-[#0f0f0f] h-screen w-[241px]">
      <div className="flex flex-col gap-4 p-6 w-full">
        
        <button onClick={() => navigate("/")} className={getClass("/")}>
          <House />
          Home
        </button>
        <button onClick={() => navigate("/timer")} className={getClass("/timer")}>
          <Timer />
          Timer
        </button>
        <button onClick={() => navigate("/stopwatch")} className={getClass("/stopwatch")}>
          <TimerReset />
          StopWatch
        </button>
      </div>
    </div>
  );
});