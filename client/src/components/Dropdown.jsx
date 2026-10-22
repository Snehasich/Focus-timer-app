import { useState, useRef, useEffect } from "react";
import { Check } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export const Dropdown = ({ items = [], children, onItemClick, activeItem = null, align = "left" }) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { theme } = useTheme();
  const isLight = theme === "light";

  // Close on outside click or Escape key
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    function handleKeyDown(e) {
      if (e.key === "Escape") setOpen(false);
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* TRIGGER BUTTON */}
      <div 
        onClick={() => setOpen((prev) => !prev)} 
        className="cursor-pointer select-none"
      >
        {children}
      </div>

      {/* DROPDOWN MENU */}
      {open && (
        <div 
          className={`absolute top-full mt-2.5 ${
            align === "right" ? "right-0 left-auto" : "left-0 right-auto"
          } rounded-xl p-1.5 min-w-[200px] text-sm transition-all duration-150 z-[9999] border shadow-2xl animate-in fade-in zoom-in-95 ${
            isLight 
              ? "bg-white border-slate-200 text-gray-700 shadow-slate-300/60" 
              : "bg-[#18181b] border-[#27272a] text-zinc-300 shadow-black/90"
          }`}
        >
          {items.map((item, index) => {
            const isActive = activeItem && (
              item === activeItem || 
              (typeof item === "string" && typeof activeItem === "string" && item.toLowerCase() === activeItem.toLowerCase())
            );
            return (
              <div
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  onItemClick?.(item);
                  setOpen(false);
                }}
                className={`px-3 py-2 rounded-lg cursor-pointer transition-all duration-150 font-medium text-xs sm:text-[13px] flex items-center justify-between gap-2.5 ${
                  isActive
                    ? isLight
                      ? "bg-blue-50 text-blue-600 font-semibold"
                      : "bg-blue-500/15 text-blue-400 font-semibold"
                    : isLight
                      ? "hover:bg-slate-100 hover:text-gray-900 text-gray-700"
                      : "hover:bg-white/5 hover:text-white text-zinc-300"
                }`}
              >
                <span>{item}</span>
                {isActive && <Check size={14} className="shrink-0 text-blue-500" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
