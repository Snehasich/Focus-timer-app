import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { Side } from "./components/Side";
import { TaskRoute } from "./components/TaskRoute";
import { TaskRouteTask } from "./components/TaskRoute_Task";
import { Timer } from "./components/Timer/Timer";
import { StopWatch } from "./components/Timer/StopWatch";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./components/Dashboard";


// 🔐 Private Route
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
};

// 🚫 Public Route
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? <Navigate to="/" replace /> : children;
};

// 📦 Layout (FIXED PROPERLY)
const Layout = () => {
  return (
    <div className="bg-[#252525] min-h-screen w-full flex">
      <Side />

      {/* FIXED */}
      <div className="flex-1 p-4">
        <Outlet />
      </div>
    </div>
  );
};

// 🎯 Reusable Center Wrapper
const CenterBox = ({ children }) => {
  return (
    <div className="w-full flex items-center justify-center bg-gray-900 rounded-3xl">
      {children}
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          {/* Home */}
          <Route
            index
            element={
              <div >
                <div className="mb-7">
                  <TaskRoute />
                </div>
                <TaskRouteTask />
              </div>
            }
          />

          {/* Timer */}
          <Route
            path="timer"
            element={
              <CenterBox>
                <Timer />
              </CenterBox>
            }
          />

          {/* Stopwatch */}
          <Route
            path="stopwatch"
            element={
              <CenterBox>
                <StopWatch />
              </CenterBox>
            }
          />

          {/* Dashboard */}
          <Route path="dashboard" element={<Dashboard />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;