import { useState, useRef, useEffect } from "react";

export const Dropdown = ({ items, children }) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

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
        <div className="absolute top-8 right-0 bg-[#242323] rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.6)] p-2 w-[180px] text-sm text-gray-300">

          {items.map((item, index) => (
            <div
              key={index}
              className="px-3 py-2 hover:bg-[#2a2a2a] rounded-md cursor-pointer"
            >
              {item}
            </div>
          ))}

        </div>
      )}

    </div>
  );
};