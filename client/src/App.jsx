import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { Side } from "./components/Side";
import { TaskRoute } from "./components/TaskRoute";
import { TaskRouteTask } from "./components/TaskRoute_Task";
import { StopWatch } from "./components/Timer/StopWatch";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./components/Dashboard";
import FocusBreak from "./components/Timer/FocusBreak";


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

// 📦 Layout (NO padding)
const Layout = () => {
  return (
    <div className="bg-[#252525] min-h-screen w-full flex">
      <Side />

      {/* NO GAP HERE */}
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public */}
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

        {/* Protected */}
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
              <div className="p-4 h-[98%]">
                <div className="mb-7">
                  <TaskRoute />
                </div>
                <TaskRouteTask />
              </div>
            }
          />

          {/* ✅ FIXED */}
          <Route
            path="/focusbreak"
            element={
              <div className="p-4 h-[98%] flex items-center justify-center">
                <div className="w-full h-full bg-gray-900 rounded-4xl flex items-center justify-center">
                  <FocusBreak />
                </div>
              </div>
            }
          />

          <Route path="stopwatch" element={
            <div className="p-4 h-[98%]">
              <StopWatch />
            </div>
          } />

          {/* Dashboard */}
          <Route path="dashboard" element={
            <div className="p-4 h-[98%]">
              <Dashboard />
            </div>
          } />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;