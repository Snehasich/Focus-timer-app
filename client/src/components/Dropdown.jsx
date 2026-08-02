import { useState, useRef, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";

export const Dropdown = ({ items, children, onItemClick }) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { theme } = useTheme();
  const isLight = theme === "light";

  // close on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block" ref={dropdownRef}>

      {/* BUTTON */}
      <div onClick={() => setOpen(!open)}>
        {children}
      </div>

      {/* MENU */}
      {open && (
        <div 
          className="absolute top-full mt-2 left-0 rounded-xl p-1.5 w-[190px] text-sm transition-all duration-150 shadow-2xl z-[9999]"
          style={{
            background: isLight ? "#ffffff" : "#1a1a1a",
            border: isLight ? "1px solid #cbd5e1" : "1px solid #2e2e2e",
            boxShadow: isLight ? "0 10px 30px rgba(0,0,0,0.12)" : "0 14px 40px rgba(0,0,0,0.8)",
            color: isLight ? "#374151" : "#d1d5db",
          }}
        >
          {items.map((item, index) => (
            <div
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                onItemClick?.(item);
                setOpen(false);
              }}
              className="px-3 py-2 rounded-lg cursor-pointer transition-colors duration-150 font-medium text-xs sm:text-sm"
              style={{
                background: "transparent",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = isLight ? "#f1f5f9" : "#262626";
                e.currentTarget.style.color = isLight ? "#111827" : "#ffffff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = isLight ? "#374151" : "#d1d5db";
              }}
            >
              {item}
            </div>
          ))}

        </div>
      )}

    </div>
  );
};