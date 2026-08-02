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
      {/* TRIGGER BUTTON */}
      <div onClick={() => setOpen(!open)} className="cursor-pointer">
        {children}
      </div>

      {/* DROPDOWN MENU */}
      {open && (
        <div 
          className={`absolute top-full mt-2 left-0 rounded-xl p-1.5 w-[190px] text-sm transition-all duration-150 z-[9999] border shadow-2xl ${
            isLight 
              ? "bg-white border-slate-300 text-gray-700 shadow-slate-300/40" 
              : "bg-[#1a1a1a] border-[#2e2e2e] text-gray-300 shadow-black/80"
          }`}
        >
          {items.map((item, index) => (
            <div
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                onItemClick?.(item);
                setOpen(false);
              }}
              className={`px-3 py-2 rounded-lg cursor-pointer transition-colors duration-150 font-medium text-xs sm:text-sm bg-transparent ${
                isLight
                  ? "hover:bg-slate-100 hover:text-gray-900 text-gray-700"
                  : "hover:bg-[#262626] hover:text-white text-gray-300"
              }`}
            >
              {item}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};