import { Hourglass } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

function Dashboard() {
  const { theme } = useTheme();
  const isLight = theme === "light";

  return (
    <>
      <style>{`
        @keyframes pulseOpacity {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        .pulse-text {
          animation: pulseOpacity 2s ease-in-out infinite;
        }
      `}</style>
      <div 
        className="w-full h-full flex flex-col items-center justify-center"
        style={{
          background: isLight ? "#ffffff" : "#111",
          border: isLight ? "1px solid #e5e7eb" : "1px solid #222",
          borderRadius: 24,
          flex: 1,
          boxShadow: isLight ? "0 8px 24px rgba(15,23,42,0.03)" : "0 10px 40px rgba(0,0,0,0.4)",
          minHeight: "calc(100vh - 96px)",
        }}
      >
        <Hourglass className="pulse-text mb-4" size={40} color="#3b82f6" />
        <h2 className="pulse-text text-xl font-bold tracking-wide" style={{ color: isLight ? "#111827" : "#e5e7eb" }}>
          Still pending
        </h2>
      </div>
    </>
  );
}

export default Dashboard;