import { useState, useRef, useEffect } from "react";
import { RotateCcw, Play, Pause } from "lucide-react";

export const Timer = ({ initialTime = 50 * 60 }) => {
  const intervalRef = useRef(null);

  // ✅ Load from sessionStorage (persists across routes)
  const [time, setTime] = useState(() => {
    const saved = JSON.parse(sessionStorage.getItem("timerState"));
    return saved?.time ?? initialTime;
  });

  const [isRunning, setIsRunning] = useState(() => {
    const saved = JSON.parse(sessionStorage.getItem("timerState"));
    return saved?.isRunning ?? false;
  });

  const [startedAt, setStartedAt] = useState(() => {
    const saved = JSON.parse(sessionStorage.getItem("timerState"));
    return saved?.startedAt ?? null;
  });

  // ✅ Save state (for route switching)
  useEffect(() => {
    sessionStorage.setItem(
      "timerState",
      JSON.stringify({ time, isRunning, startedAt })
    );
  }, [time, isRunning, startedAt]);

  // ✅ Clear ONLY on refresh / tab close
  useEffect(() => {
    const handleUnload = () => {
      sessionStorage.removeItem("timerState");
    };

    window.addEventListener("beforeunload", handleUnload);

    return () => {
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, []);

  // ✅ Accurate timer (no drift)
  useEffect(() => {
    if (isRunning && startedAt) {
      intervalRef.current = setInterval(() => {
        const now = new Date();

        const elapsed = Math.floor(
          (now - new Date(startedAt)) / 1000
        );

        const newTime = initialTime - elapsed;

        if (newTime <= 0) {
          clearInterval(intervalRef.current);
          setTime(0);
          setIsRunning(false);
        } else {
          setTime(newTime);
        }
      }, 1000);
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning, startedAt, initialTime]);

  // 🧠 Save focus data (keep in localStorage)
  const saveSession = () => {
    if (!startedAt) return;

    const sessionSeconds = Math.floor(
      (new Date() - new Date(startedAt)) / 1000
    );

    if (sessionSeconds <= 0) return;

    const today = new Date().toISOString().split("T")[0];
    const data = JSON.parse(localStorage.getItem("focusData")) || {};

    data[today] = (data[today] || 0) + sessionSeconds;

    localStorage.setItem("focusData", JSON.stringify(data));
  };

  // ▶ Start / Pause
  const handleStartPause = () => {
    if (isRunning) {
      saveSession();
      setIsRunning(false);
    } else {
      const now = new Date();
      setStartedAt(now);
      setIsRunning(true);
    }
  };

  // 🔄 Reset
  const handleReset = () => {
    saveSession();

    clearInterval(intervalRef.current);
    setIsRunning(false);
    setTime(initialTime);
    setStartedAt(null);

    sessionStorage.removeItem("timerState");
  };

  // ⏱ Format time
  const formatTime = () => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
      seconds
    ).padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col items-center justify-center gap-2 text-center">
      <div className="w-[250px] h-[250px] rounded-full border-4 border-blue-500 flex items-center justify-center text-white text-5xl font-extrabold">
        {formatTime()}
      </div>

      <h2 className="text-gray-400 mt-4 text-lg">Focus Timer</h2>

      <div className="flex gap-6 mt-6">
        <button
          onClick={handleStartPause}
          className="bg-blue-600 px-6 py-2 rounded-full flex items-center gap-2"
        >
          {isRunning ? <Pause /> : <Play />}
          {isRunning ? "Pause" : "Start"}
        </button>

        <button
          onClick={handleReset}
          className="bg-red-600 px-6 py-2 rounded-full flex items-center gap-2"
        >
          <RotateCcw />
          Reset
        </button>
      </div>
    </div>
  );
};