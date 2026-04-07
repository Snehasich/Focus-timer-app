import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Side } from "./components/Side";
import { TaskRoute } from "./components/TaskRoute";
import { TaskRouteTask } from "./components/TaskRoute_Task";
import { Timer } from "./components/Timer/Timer";
import { StopWatch } from "./components/Timer/StopWatch";

import Login from "./pages/Login";
import Register from "./pages/Register";

// 🔐 Check token
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
};

function App() {
  const token = localStorage.getItem("token");

  return (
    <BrowserRouter>
      <Routes>

        {/* 🔓 Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* 🔐 Protected App Layout */}
        <Route
          path="/*"
          element={
            <PrivateRoute>
              <div className="bg-[#252525] min-h-screen w-full flex">

                {/* Sidebar only if logged in */}
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
            </PrivateRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;