import { useTheme } from "../context/ThemeContext";

export const FocusAiView = () => {
  const { theme } = useTheme();
  const isLight = theme === "light";

  return (
    <div className="min-h-screen lg:h-screen w-full box-border flex flex-col p-2 sm:p-5 md:p-6 gap-3 pb-24 lg:pb-6">
      <div
        className={`w-full flex-1 flex flex-col rounded-3xl p-4 sm:p-6 overflow-y-auto min-h-0 border shadow-2xl transition-all duration-200 ${
          isLight 
            ? "bg-white border-slate-200 shadow-slate-200/50" 
            : "bg-[#111111] border-[#222222] shadow-black/60"
        }
        flex items-center justify-center
      `}
      >
        <h1 className={`text-4xl font-bold ${isLight ? "text-gray-900" : "text-white"}`}>
          Coming soon...
        </h1>
      </div>
    </div>
  );
};

export default FocusAiView;
