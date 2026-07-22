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
    <div className="relative" ref={dropdownRef}>

      {/* BUTTON (children now) */}
      <div onClick={() => setOpen(!open)}>
        {children}
      </div>

      {/* MENU */}
      {open && (
        <div 
          className="absolute top-8 left-0 rounded-xl p-1.5 w-[180px] text-sm transition-all duration-150 z-50"
          style={{
            background: isLight ? "#ffffff" : "#161616",
            border: isLight ? "1px solid #cbd5e1" : "1px solid #2a2a2a",
            boxShadow: isLight ? "0 10px 30px rgba(0,0,0,0.06)" : "0 10px 30px rgba(0,0,0,0.5)",
            color: isLight ? "#374151" : "#d1d5db",
          }}
        >
          {items.map((item, index) => (
            <div
              key={index}
              onClick={() => {
                onItemClick?.(item);
                setOpen(false);
              }}
              className="px-3 py-2 rounded-lg cursor-pointer transition-colors duration-150"
              style={{
                background: "transparent",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = isLight ? "#f1f5f9" : "#222222";
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