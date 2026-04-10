import { useState, useEffect, useRef, memo } from "react";
import { RotateCcw, Play, Pause } from "lucide-react";

export const StopWatch = memo(() => {
  const [time, setTime] = useState(0); // in seconds
  const [isRunning, setIsRunning] = useState(false);

  const intervalRef = useRef(null);

  // Format time → mm:ss
  const formatTime = (time) => {
    const hours = String(Math.floor(time / 3600)).padStart(2, "0");
    const mins = String(Math.floor((time % 3600) / 60)).padStart(2, "0");
    const secs = String(time % 60).padStart(2, "0");

    return `${hours}:${mins}:${secs}`;
  };
  
  useEffect(() => {

    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTime((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  const handleStartPause = () => {
    setIsRunning((prev) => !prev);
  };

  const handleReset = () => {
    clearInterval(intervalRef.current);
    setTime(0);
    setIsRunning(false);
  };

  return (
    <div className="flex flex-col items-center justify-center gap-2 text-center">
      <div className="w-[250px] h-[250px] rounded-full border-4 border-green-500 flex items-center justify-center text-white text-5xl font-extrabold tracking-wider">
        {formatTime(time)}
      </div>

      <h2 className="text-gray-400 mt-4 text-lg">
        StopWatch
      </h2>

      <div className="flex gap-6 mt-6 text-lg font-semibold">
        
        <button 
          onClick={handleStartPause}
          className="bg-green-600 px-6 py-2 rounded-full flex items-center gap-2 hover:scale-95 transition-transform"
        >
          {isRunning ? <Pause /> : <Play />}
          {isRunning ? "Pause" : "Start"}
        </button>

        <button 
          onClick={handleReset}
          className="bg-red-600 px-6 py-2 rounded-full flex items-center gap-2 hover:scale-95 transition-transform"
        >
          <RotateCcw className="h-5" />
          Reset
        </button>

      </div>
    </div>
  );
});

