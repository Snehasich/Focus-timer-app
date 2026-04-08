import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Side } from "./components/Side";
import { TaskRoute } from "./components/TaskRoute";
import { TaskRouteTask } from "./components/TaskRoute_Task";
import { Timer } from "./components/Timer/Timer";
import { StopWatch } from "./components/Timer/StopWatch";

import Login from "./pages/Login";
import Register from "./pages/Register";

// 🔐 Private Route
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <div className="bg-[#252525] min-h-screen w-full flex">
                <Side />

                <div className="flex-1 flex flex-col p-4 gap-4">
                  <TaskRoute />
                  <TaskRouteTask />
                </div>
              </div>
            </PrivateRoute>
          }
        />

        <Route
          path="/timer"
          element={
            <PrivateRoute>
              <Timer />
            </PrivateRoute>
          }
        />

        <Route
          path="/stopwatch"
          element={
            <PrivateRoute>
              <StopWatch />
            </PrivateRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;