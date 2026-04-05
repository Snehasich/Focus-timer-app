import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Side } from "./components/Side";
import { TaskRoute } from "./components/TaskRoute";
import { TaskRouteTask } from "./components/TaskRoute_Task";
import { Timer } from "./components/Timer/Timer";
import { StopWatch } from "./components/Timer/StopWatch";

function App() {
  return (
    <BrowserRouter>
      <div className="bg-[#252525] min-h-screen w-full flex">

        {/* Sidebar */}
        <Side />

        {/* Main Content */}
        <div className="flex-1 flex flex-col p-4 gap-4">

          <Routes>
            <Route
              path="/"
              element={
                <>
                  <TaskRoute />
                  <TaskRouteTask />
                </>
              }
            />

            <Route
              path="/timer"
              element={
                <div className="flex flex-col justify-center items-center bg-gray-900 h-full rounded-2xl">
                  <Timer />
                </div>
              }
            />

            <Route
              path="/stopwatch"
              element={
                <div className="flex flex-col justify-center items-center bg-gray-800 h-full rounded-2xl">
                  <StopWatch />
                </div>
              }
            />

            <Route
              path="/dashboard"
              element={
                <div className="bg-gray-900 h-full rounded-2xl text-white flex items-center justify-center">
                  Dashboard coming soon 📊
                </div>
              }
            />
          </Routes>

        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;