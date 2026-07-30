import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { Side } from "./components/Side";
import { StopWatch } from "./components/Timer/StopWatch";
import TasksPage from "./pages/TasksPage";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./components/Dashboard";
import FocusBreak from "./components/Timer/FocusBreak";
import CalendarView from "./components/CalendarView";
import NotesView from "./components/NotesView";
import { logLogin } from "./services/activityService";

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
import { TimerProvider } from "./context/TimerContext";
import { useEffect } from "react";

// 📦 Layout
const Layout = () => {
  const { theme, sidebarOpen, toggleSidebar } = useTheme();

  // Record today's login visit in DB when app is opened (only if token exists)
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      logLogin();
    }
  }, []);

  return (
    <div 
      className="h-screen w-full flex overflow-hidden transition-all duration-200"
      style={{ background: theme === "light" ? "#eef2f6" : "#09090c", position: "relative" }}
    >
      {/* Mobile Backdrop Overlay when sidebar is open on small screens */}
      {sidebarOpen && (
        <div 
          onClick={toggleSidebar}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
        />
      )}

      <Side />

      {/* Floating Toggle button when sidebar is closed */}
      {!sidebarOpen && (
        <button
          onClick={toggleSidebar}
          className="fixed top-[26px] left-[26px] z-50 w-9 h-9 rounded-full shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center hover:scale-105"
          style={{
            background: theme === "light" ? "#ffffff" : "#161616",
            border: theme === "light" ? "1px solid #cbd5e1" : "1px solid #2a2a2a",
            color: theme === "light" ? "#4b5563" : "#f3f4f6",
            cursor: "pointer",
            outline: "none",
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/></svg>
        </button>
      )}

      <div 
        className="flex-1 h-screen overflow-y-auto transition-all duration-300" 
        style={{ 
          paddingLeft: !sidebarOpen ? 46 : 0,
        }}
      >
        <Outlet />
      </div>
    </div>
  );
};

// 📦 Focus & Break Wrapper
const FocusBreakWrapper = () => {
  const { theme } = useTheme();
  const isLight = theme === "light";
  return (
    <div className="h-screen p-3 sm:p-6 box-border flex flex-col">
      <div 
        className="rounded-3xl p-4 sm:p-6 flex items-center justify-center flex-1 w-full"
        style={{
          background: isLight ? "#ffffff" : "#111",
          border: isLight ? "1px solid #e5e7eb" : "1px solid #222",
        borderRadius: 24,
        padding: "24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flex: 1,
        boxShadow: isLight ? "0 8px 24px rgba(15,23,42,0.03)" : "0 10px 40px rgba(0,0,0,0.4)",
        width: "100%",
        transition: "background 0.2s, border-color 0.2s, box-shadow 0.2s",
      }}>
        <FocusBreak />
      </div>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <TimerProvider>
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
              element={<TasksPage />}
            />

            {/* Focus & Break */}
            <Route
              path="/focusbreak"
              element={<FocusBreakWrapper />}
            />

            {/* Stopwatch */}
            <Route path="stopwatch" element={
              <div style={{ height: "100vh", padding: "24px", boxSizing: "border-box", display: "flex", flexDirection: "column" }}>
                <StopWatch />
              </div>
            } />

            {/* Dashboard */}
            <Route path="dashboard" element={
              <div style={{ minHeight: "100vh", padding: "clamp(12px, 3vw, 24px)", boxSizing: "border-box", display: "flex", flexDirection: "column" }}>
                <Dashboard />
              </div>
            } />

            {/* Calendar */}
            <Route path="calendar" element={<CalendarView />} />

            {/* Notes */}
            <Route path="notes" element={<NotesView />} />
          </Route>

        </Routes>
      </BrowserRouter>
    </TimerProvider>
  </ThemeProvider>
  );
}

export default App;