import { useState, useRef, useEffect } from "react";
import { RotateCcw, Play, Pause } from "lucide-react";

export const Timer = ({ initialTime = 50 * 60 }) => {
  const [time, setTime] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState("work"); // "work" | "break"

  const intervalRef = useRef(null);
  const alarmRef = useRef(new Audio("/alarm.mp3"));

  // ⏱ 1. Interval (ONLY decrease time)
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTime((prev) => prev - 1);
      }, 1000);
    }

    return () => {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [isRunning]);

  // 🔔 2. When time hits 0 (IMPORTANT FIX)
  useEffect(() => {
    if (time === 0 && isRunning) {
      clearInterval(intervalRef.current);

      // 🔔 play alarm
      alarmRef.current.currentTime = 0;
      alarmRef.current.play();

      // stop timer
      setIsRunning(false);

      // switch mode + set next time
      if (mode === "work") {
        setMode("break");
        setTime(10 * 60); // break = 10 min
      } else {
        setMode("work");
        setTime(initialTime);
      }
    }
  }, [time]);

  // ⏱ Format time
  const formatTime = () => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${String(minutes).padStart(2, "0")}:${String(
      seconds
    ).padStart(2, "0")}`;
  };

  // ▶️ Start / Pause
  const handleStartPause = () => {
    setIsRunning((prev) => !prev);
  };

  // 🔄 Reset
  const handleReset = () => {
    clearInterval(intervalRef.current);
    setIsRunning(false);
    setMode("work");
    setTime(initialTime);

    alarmRef.current.pause();
    alarmRef.current.currentTime = 0;
  };

  return (
    <>
      {/* Timer Circle */}
      <div
        className={`w-[250px] h-[250px] rounded-full border-4 
        ${mode === "work" ? "border-blue-500" : "border-green-500"}
        flex items-center justify-center text-white text-5xl font-extrabold tracking-wider`}
      >
        {formatTime()}
      </div>

      {/* Title */}
      <h2 className="text-gray-400 mt-4 text-lg">
        {mode === "work" ? "Focus Timer" : "Break Time ☕"}
      </h2>

      {/* Buttons */}
      <div className="flex gap-6 mt-6 text-lg font-semibold">
        <button
          onClick={handleStartPause}
          className="bg-blue-600 px-6 py-2 rounded-full flex items-center gap-2 hover:scale-95 transition-transform"
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
    </>
  );
};