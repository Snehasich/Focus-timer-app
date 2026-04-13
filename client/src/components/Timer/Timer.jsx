import { useState, useRef, useEffect } from "react";
import { RotateCcw, Play, Pause } from "lucide-react";

export const Timer = ({ initialTime = 50 * 60 }) => {
  const intervalRef = useRef(null);
  const alarmRef = useRef(null);

  // 🔊 Load alarm
  useEffect(() => {
    alarmRef.current = new Audio("/alarm.mp3");
  }, []);

  // ✅ Load from sessionStorage
  const savedState = JSON.parse(sessionStorage.getItem("timerState"));

  const [mode, setMode] = useState(savedState?.mode ?? "focus");

  const getDuration = (mode) =>
    mode === "focus" ? 50 * 60 : 10 * 60;

  const [time, setTime] = useState(
    savedState?.time ?? getDuration("focus")
  );

  const [isRunning, setIsRunning] = useState(
    savedState?.isRunning ?? false
  );

  const [startedAt, setStartedAt] = useState(
    savedState?.startedAt ?? null
  );

  // 🔁 Loop counters
  const [focusLoop, setFocusLoop] = useState(
    savedState?.focusLoop ?? 0
  );

  const [breakLoop, setBreakLoop] = useState(
    savedState?.breakLoop ?? 0
  );

  // ✅ Save state
  useEffect(() => {
    sessionStorage.setItem(
      "timerState",
      JSON.stringify({
        time,
        isRunning,
        startedAt,
        mode,
        focusLoop,
        breakLoop,
      })
    );
  }, [time, isRunning, startedAt, mode, focusLoop, breakLoop]);

  // ✅ Clear on refresh
  useEffect(() => {
    const handleUnload = () => {
      sessionStorage.removeItem("timerState");
    };

    window.addEventListener("beforeunload", handleUnload);
    return () =>
      window.removeEventListener("beforeunload", handleUnload);
  }, []);

  // ✅ Timer logic
  useEffect(() => {
    if (isRunning && startedAt) {
      intervalRef.current = setInterval(() => {
        const now = new Date();

        const elapsed = Math.floor(
          (now - new Date(startedAt)) / 1000
        );

        const duration = getDuration(mode);
        const newTime = duration - elapsed;

        if (newTime <= 0) {
          clearInterval(intervalRef.current);

          // 🔊 Play alarm
          alarmRef.current?.play();

          setIsRunning(false);

          // 🔁 Increase loop count
          if (mode === "focus") {
            setFocusLoop((prev) => prev + 1);
          } else {
            setBreakLoop((prev) => prev + 1);
          }

          // 🔁 Switch mode
          const nextMode =
            mode === "focus" ? "break" : "focus";

          setMode(nextMode);
          setTime(getDuration(nextMode));
          setStartedAt(null);
        } else {
          setTime(newTime);
        }
      }, 1000);
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning, startedAt, mode]);

  // 🧠 Save focus data
  const saveSession = () => {
    if (!startedAt || mode !== "focus") return;

    const sessionSeconds = Math.floor(
      (new Date() - new Date(startedAt)) / 1000
    );

    if (sessionSeconds <= 0) return;

    const today = new Date().toISOString().split("T")[0];
    const data =
      JSON.parse(localStorage.getItem("focusData")) || {};

    data[today] = (data[today] || 0) + sessionSeconds;

    localStorage.setItem("focusData", JSON.stringify(data));
  };

  // ▶ Start / Pause
  const handleStartPause = () => {
    if (isRunning) {
      // ⏸ Pause
      saveSession();
      setIsRunning(false);
    } else {
      // ▶ Resume WITHOUT resetting timer
      const now = new Date();

      const adjustedStart = new Date(
        now - (getDuration(mode) - time) * 1000
      );

      setStartedAt(adjustedStart);
      setIsRunning(true);
    }
  };

  // 🔄 Reset
  const handleReset = () => {
    saveSession();

    clearInterval(intervalRef.current);
    setIsRunning(false);

    setMode("focus");
    setTime(getDuration("focus"));
    setStartedAt(null);

    setFocusLoop(0);
    setBreakLoop(0);

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
    <div className="w-full h-[99%] flex flex-col items-center justify-center rounded-4xl">
      {/* Timer Circle */}
      <div
        className={`w-[250px] h-[250px] rounded-full border-4 ${
          mode === "focus"
            ? "border-blue-500"
            : "border-green-500"
        } flex items-center justify-center text-white text-5xl font-extrabold flex-col`}
      >
        {formatTime()}
      </div>

      {/* Mode
      <h2 className="text-gray-400 mt-4 text-lg">
        {mode === "focus" ? "Focus Timer" : "Break Time"}
      </h2> */}

      {/* 🔁 Loop Counter */}
      <div className={`mt-4 text-lg tracking-wide ${mode === "focus" ? "text-blue-300" : "text-green-300"}`}>
        {mode === "focus"
          ? `Focus Loop: ${focusLoop}`
          : `Break Loop: ${breakLoop}`}
      </div>

      {/* Buttons */}
      <div className="flex gap-6 mt-6">
        <button
          onClick={handleStartPause}
          className={`px-6 py-2 rounded-full flex items-center gap-2 shadow-md font-medium ${
            mode === "focus"
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {isRunning ? <Pause /> : <Play />}
          {isRunning ? "Pause" : "Start"}
        </button>

        <button
          onClick={handleReset}
          className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-full flex items-center gap-2 shadow-md font-medium"
        >
          <RotateCcw />
          Reset
        </button>
      </div>
    </div>
  );
};