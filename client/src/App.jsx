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

import { ThemeProvider, useTheme } from "./context/ThemeContext";

// 📦 Layout
const Layout = () => {
  const { theme } = useTheme();
  return (
    <div 
      className="min-h-screen w-full flex transition-colors duration-200"
      style={{ background: theme === "light" ? "#e2e8f0" : "#09090c" }}
    >
      <Side />
      <div className="flex-1 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
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
              <div style={{ height: "100vh", padding: "24px", boxSizing: "border-box", display: "flex", flexDirection: "column" }}>
                <div style={{ marginBottom: "16px" }}>
                  <TaskRoute />
                </div>
                <div style={{ flex: 1, display: "flex" }}>
                  <TaskRouteTask />
                </div>
              </div>
            }
          />

          {/* Focus & Break */}
          <Route
            path="/focusbreak"
            element={
              <div style={{ height: "100vh", padding: "24px", boxSizing: "border-box", display: "flex", flexDirection: "column" }}>
                <div style={{
                  background: "#111",
                  border: "1px solid #222",
                  borderRadius: 24,
                  padding: "24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flex: 1,
                  boxShadow: "0 10px 40px rgba(0,0,0,0.4)",
                  width: "100%",
                }}>
                  <FocusBreak />
                </div>
              </div>
            }
          />

          {/* Stopwatch */}
          <Route path="stopwatch" element={
            <div style={{ height: "100vh", padding: "24px", boxSizing: "border-box", display: "flex", flexDirection: "column" }}>
              <StopWatch />
            </div>
          } />

          {/* Dashboard */}
          <Route path="dashboard" element={
            <div style={{ height: "100vh", padding: "24px", boxSizing: "border-box", display: "flex", flexDirection: "column" }}>
              <Dashboard />
            </div>
          } />
        </Route>

      </Routes>
    </BrowserRouter>
  </ThemeProvider>
  );
}

export default App;