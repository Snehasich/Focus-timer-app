import { createContext, useContext, useState, useEffect, useRef } from "react";
import { logFocusSession } from "../services/activityService";

const TimerContext = createContext();

export const TimerProvider = ({ children }) => {
  // ── Focus Timer State ──
  const [focusInitialTime, setFocusInitialTimeState] = useState(() => {
    const saved = localStorage.getItem("app_focus_initial_time");
    return saved ? parseInt(saved, 10) : 50 * 60;
  });
  const [focusTime, setFocusTime] = useState(() => {
    const saved = localStorage.getItem("app_focus_current_time");
    return saved ? parseInt(saved, 10) : focusInitialTime;
  });
  const [isFocusRunning, setIsFocusRunning] = useState(() => {
    const saved = localStorage.getItem("app_is_focus_running");
    return saved === "true";
  });
  const [focusStartedAt, setFocusStartedAt] = useState(() => {
    const saved = localStorage.getItem("app_focus_started_at");
    return saved ? parseInt(saved, 10) : null;
  });
  const [focusLoop, setFocusLoop] = useState(0);

  // ── Break Timer State ──
  const [breakInitialTime, setBreakInitialTimeState] = useState(() => {
    const saved = localStorage.getItem("app_break_initial_time");
    return saved ? parseInt(saved, 10) : 10 * 60;
  });
  const [breakTime, setBreakTime] = useState(() => {
    const saved = localStorage.getItem("app_break_current_time");
    return saved ? parseInt(saved, 10) : breakInitialTime;
  });
  const [isBreakRunning, setIsBreakRunning] = useState(() => {
    const saved = localStorage.getItem("app_is_break_running");
    return saved === "true";
  });
  const [breakStartedAt, setBreakStartedAt] = useState(() => {
    const saved = localStorage.getItem("app_break_started_at");
    return saved ? parseInt(saved, 10) : null;
  });
  const [breakLoop, setBreakLoop] = useState(0);

  // ── StopWatch State ──
  const [isStopWatchRunning, setIsStopWatchRunning] = useState(false);
  const [stopWatchStartTime, setStopWatchStartTime] = useState(null);
  const [stopWatchPausedTime, setStopWatchPausedTime] = useState(0);
  const [stopWatchLaps, setStopWatchLaps] = useState([]);
  const [stopWatchTime, setStopWatchTime] = useState(0);

  const alarmRef = useRef(null);

  useEffect(() => {
    alarmRef.current = new Audio("/alarm.mp3");
  }, []);

  // ── Sync Focus Timer State to LocalStorage ──
  useEffect(() => {
    localStorage.setItem("app_is_focus_running", isFocusRunning);
    if (focusStartedAt) localStorage.setItem("app_focus_started_at", focusStartedAt);
    else localStorage.removeItem("app_focus_started_at");
    localStorage.setItem("app_focus_current_time", focusTime);
  }, [isFocusRunning, focusStartedAt, focusTime]);

  // ── Sync Break Timer State to LocalStorage ──
  useEffect(() => {
    localStorage.setItem("app_is_break_running", isBreakRunning);
    if (breakStartedAt) localStorage.setItem("app_break_started_at", breakStartedAt);
    else localStorage.removeItem("app_break_started_at");
    localStorage.setItem("app_break_current_time", breakTime);
  }, [isBreakRunning, breakStartedAt, breakTime]);

  const setFocusInitialTime = (seconds) => {
    const validSecs = Math.max(60, Math.min(180 * 60, seconds));
    localStorage.setItem("app_focus_initial_time", validSecs);
    setFocusInitialTimeState(validSecs);
    setFocusTime(validSecs);
    setIsFocusRunning(false);
    setFocusStartedAt(null);
  };

  const setBreakInitialTime = (seconds) => {
    const validSecs = Math.max(60, Math.min(120 * 60, seconds));
    localStorage.setItem("app_break_initial_time", validSecs);
    setBreakInitialTimeState(validSecs);
    setBreakTime(validSecs);
    setIsBreakRunning(false);
    setBreakStartedAt(null);
  };

  // ── Focus Timer Ticker ──
  useEffect(() => {
    let interval = null;
    if (isFocusRunning && focusStartedAt) {
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - focusStartedAt) / 1000);
        const newTime = focusInitialTime - elapsed;
        if (newTime <= 0) {
          clearInterval(interval);
          alarmRef.current?.play();
          setIsFocusRunning(false);
          setFocusLoop((p) => p + 1);
          setFocusTime(focusInitialTime);
          setFocusStartedAt(null);
          // Log session to backend
          logFocusSession(focusInitialTime, 1).catch(() => {});
        } else {
          setFocusTime(newTime);
        }
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isFocusRunning, focusStartedAt, focusInitialTime]);

  // ── Break Timer Ticker ──
  useEffect(() => {
    let interval = null;
    if (isBreakRunning && breakStartedAt) {
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - breakStartedAt) / 1000);
        const newTime = breakInitialTime - elapsed;
        if (newTime <= 0) {
          clearInterval(interval);
          alarmRef.current?.play();
          setIsBreakRunning(false);
          setBreakLoop((p) => p + 1);
          setBreakTime(breakInitialTime);
          setBreakStartedAt(null);
        } else {
          setBreakTime(newTime);
        }
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isBreakRunning, breakStartedAt, breakInitialTime]);

  // ── Stopwatch Ticker ──
  useEffect(() => {
    let interval = null;
    if (isStopWatchRunning && stopWatchStartTime !== null) {
      interval = setInterval(() => {
        const elapsed = Date.now() - stopWatchStartTime + stopWatchPausedTime;
        setStopWatchTime(elapsed);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isStopWatchRunning, stopWatchStartTime, stopWatchPausedTime]);

  return (
    <TimerContext.Provider
      value={{
        focusInitialTime,
        setFocusInitialTime,
        focusTime,
        setFocusTime,
        isFocusRunning,
        setIsFocusRunning,
        focusStartedAt,
        setFocusStartedAt,
        focusLoop,
        setFocusLoop,

        breakInitialTime,
        setBreakInitialTime,
        breakTime,
        setBreakTime,
        isBreakRunning,
        setIsBreakRunning,
        breakStartedAt,
        setBreakStartedAt,
        breakLoop,
        setBreakLoop,

        isStopWatchRunning,
        setIsStopWatchRunning,
        stopWatchStartTime,
        setStopWatchStartTime,
        stopWatchPausedTime,
        setStopWatchPausedTime,
        stopWatchLaps,
        setStopWatchLaps,
        stopWatchTime,
        setStopWatchTime,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
};

export const useTimer = () => useContext(TimerContext);
