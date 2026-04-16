import { useState, useRef, useEffect } from "react";
import { RotateCcw, Play, Pause } from "lucide-react";

const BreakTimer = ({ initialTime = 10 * 60 }) => {
  const intervalRef = useRef(null);
  const alarmRef = useRef(null);

  useEffect(() => {
    alarmRef.current = new Audio("/alarm.mp3");
  }, []);

  const [time, setTime] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);
  const [startedAt, setStartedAt] = useState(null);
  const [breakLoop, setBreakLoop] = useState(0);

  useEffect(() => {
    if (isRunning && startedAt) {
      intervalRef.current = setInterval(() => {
        const now = new Date();
        const elapsed = Math.floor((now - new Date(startedAt)) / 1000);
        const newTime = initialTime - elapsed;

        if (newTime <= 0) {
          clearInterval(intervalRef.current);
          alarmRef.current?.play();

          setIsRunning(false);
          setBreakLoop((prev) => prev + 1);
          setTime(initialTime);
          setStartedAt(null);
        } else {
          setTime(newTime);
        }
      }, 1000);
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning, startedAt]);

  const handleStartPause = () => {
    if (isRunning) {
      setIsRunning(false);
    } else {
      const now = new Date();
      const adjustedStart = new Date(now - (initialTime - time) * 1000);
      setStartedAt(adjustedStart);
      setIsRunning(true);
    }
  };

  const handleReset = () => {
    clearInterval(intervalRef.current);
    setIsRunning(false);
    setTime(initialTime);
    setStartedAt(null);
  };

  const formatTime = () => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col items-center">
      <div className="w-[250px] h-[250px] rounded-full border-4 border-green-500 flex items-center justify-center text-white text-5xl font-extrabold">
        {formatTime()}
      </div>

      <div className="mt-4 text-green-300">
        Break Loop: {breakLoop}
      </div>

      <div className="flex gap-6 mt-6">
        <button onClick={handleStartPause} className="px-6 py-2 rounded-full flex items-center gap-2 font-medium
  bg-blue-600 hover:bg-blue-700">
          {isRunning ? <Pause /> : <Play />}
          {isRunning ? "Pause" : "Start"}
        </button>

        <button onClick={handleReset} className="bg-red-600 px-6 py-2 rounded-full flex items-center gap-2 font-medium">
          <RotateCcw />
          <span>Reset</span>
        </button>
      </div>
    </div>
  );
};

export default BreakTimer;