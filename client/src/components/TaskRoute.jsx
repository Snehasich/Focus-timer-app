import { memo } from 'react';
import { NotebookPen, ArrowDownUp, SlidersHorizontal, Ellipsis } from "lucide-react";
import { Dropdown } from "./Dropdown";
import geminiIcon from "../assets/gemini-icon.png";

export const TaskRoute = memo(() => {
  return (
    <div className="flex justify-between items-center w-[98%] mt-3">

      {/* LEFT HEADER BAR */}
      <div className="bg-[#161616] h-[42px] px-4 rounded-full flex items-center gap-4 text-gray-300 w-fit">

        {/* LEFT */}
        <div className="flex items-center gap-2 text-white">
          <NotebookPen className="w-4 h-4" />
          <span className="lg:text-lg whitespace-nowrap font-bold">
            All my tasks
          </span>
        </div>

        <div className="h-4 w-px bg-gray-600"></div>

        {/* VIEW */}
        <Dropdown items={["Sort by", "Task Details"]}>
            <div className="flex items-center gap-1 cursor-pointer hover:text-blue-600">
                <ArrowDownUp className="w-4 h-4" />
                <span>View</span>
            </div>
        </Dropdown>

        <div className="h-4 w-px bg-gray-600"></div>

        {/* FILTER */}
        <Dropdown items={["By Date", "By Priority", "Completed"]}>
          <div className="flex items-center gap-1 cursor-pointer hover:text-blue-600">
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filter</span>
          </div>
        </Dropdown>

        <div className="h-4 w-px bg-gray-600"></div>

        {/* DROPDOWN */}
        <Dropdown items={["Layout", "Multi-select", "Print"]}>
            <Ellipsis className="w-4 h-4 cursor-pointer hover:text-blue-600" />
        </Dropdown>

      </div>



      {/* RIGHT SMALL BAR */}
      <div className="bg-[#161616] h-[42px] px-4 rounded-full flex items-center text-white" 
      onClick={() => alert("Under Process")}>
        <img src={geminiIcon} alt="Gemini Logo" className="w-5 h-5 mr-2" />
        <span>Ask Me</span>
      </div>

    </div>
  );
});