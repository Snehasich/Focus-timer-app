import { createContext, useContext, useState, useEffect, useRef } from "react";

const TimerContext = createContext();

export const TimerProvider = ({ children }) => {
  // ── Focus Timer State ──
  const focusInitialTime = 50 * 60;
  const [focusTime, setFocusTime] = useState(focusInitialTime);
  const [isFocusRunning, setIsFocusRunning] = useState(false);
  const [focusStartedAt, setFocusStartedAt] = useState(null);
  const [focusLoop, setFocusLoop] = useState(0);

  // ── Break Timer State ──
  const breakInitialTime = 10 * 60;
  const [breakTime, setBreakTime] = useState(breakInitialTime);
  const [isBreakRunning, setIsBreakRunning] = useState(false);
  const [breakStartedAt, setBreakStartedAt] = useState(null);
  const [breakLoop, setBreakLoop] = useState(0);

  // ── StopWatch State ──
  const [isStopWatchRunning, setIsStopWatchRunning] = useState(false);
  const [stopWatchStartTime, setStopWatchStartTime] = useState(null);
  const [stopWatchPausedTime, setStopWatchPausedTime] = useState(0);
  const [stopWatchLaps, setStopWatchLaps] = useState([]);
  const [stopWatchTime, setStopWatchTime] = useState(0); // Current displayed time

  const alarmRef = useRef(null);

  useEffect(() => {
    alarmRef.current = new Audio("/alarm.mp3");
  }, []);

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
        } else {
          setFocusTime(newTime);
        }
      }, 100); // Check more frequently than 1s to prevent delays
    }
    return () => clearInterval(interval);
  }, [isFocusRunning, focusStartedAt]);

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
  }, [isBreakRunning, breakStartedAt]);

  // ── Stopwatch Ticker ──
  useEffect(() => {
    let interval = null;
    if (isStopWatchRunning && stopWatchStartTime !== null) {
      interval = setInterval(() => {
        const elapsed = Date.now() - stopWatchStartTime + stopWatchPausedTime;
        setStopWatchTime(elapsed);
      }, 100); // Tick every 100ms for background updates, StopWatch component will run requestAnimationFrame for high frequency
    }
    return () => clearInterval(interval);
  }, [isStopWatchRunning, stopWatchStartTime, stopWatchPausedTime]);

  return (
    <TimerContext.Provider
      value={{
        focusInitialTime,
        focusTime,
        setFocusTime,
        isFocusRunning,
        setIsFocusRunning,
        focusStartedAt,
        setFocusStartedAt,
        focusLoop,
        setFocusLoop,

        breakInitialTime,
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

export const useTimer = () => {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error("useTimer must be used within a TimerProvider");
  }
  return context;
};
