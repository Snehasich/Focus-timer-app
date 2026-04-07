import { memo, useState, useEffect } from "react";
import instance from "../api/axiosInstance"; // ✅ FIXED
import { Timer } from "./Timer/Timer";
import { Plus, ArrowUp } from "lucide-react";
import { InsideTask } from "./InsideTask";

export const TaskRouteTask = memo(() => {
  const [isFocused, setIsFocused] = useState(false);
  const [input, setInput] = useState("");
  const [tasks, setTasks] = useState([]);

  // ✅ FETCH TASKS
  const fetchTasks = () => {
    instance
      .get("/tasks")
      .then((res) => setTasks(res.data))
      .catch((err) => console.error("Fetch error:", err));
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // ✅ ADD TASK
  const handleAddTask = () => {
    if (input.trim() === "") return;

    instance
      .post("/tasks", {
        text: input,
        completed: false,
      })
      .then(() => {
        fetchTasks();
        setInput("");
      })
      .catch((err) => console.error("Add error:", err));
  };

  // ✅ TOGGLE TASK
  const toggleTask = (task) => {
    instance
      .put(`/tasks/${task.id}`, {
        ...task,
        completed: !task.completed,
      })
      .then(() => fetchTasks())
      .catch((err) => console.error("Toggle error:", err));
  };

  // ✅ DELETE TASK
  const deleteTask = (id) => {
    instance
      .delete(`/tasks/${id}`)
      .then(() => fetchTasks())
      .catch((err) => console.error("Delete error:", err));
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-[96%] mt-3">

      {/* LEFT CARD */}
      <div className="bg-[#161616] w-full lg:w-[370px] h-[470px] rounded-2xl p-4 border-2 border-gray-800 flex flex-col justify-between">

        <header className="text-white font-bold mb-2 text-xl">
          Today
        </header>

        {/* TASK LIST */}
        <div className="flex-1 overflow-y-auto">
          <InsideTask
            tasks={tasks}
            toggleTask={toggleTask}
            deleteTask={deleteTask}
          />
        </div>

        {/* INPUT */}
        <div className="text-gray-400 border-2 rounded-2xl bg-[#2b2a2a] flex items-center hover:border-blue-400 focus-within:border-blue-500 transition-all">

          {!isFocused && <Plus className="ml-3" />}

          <input
            type="text"
            placeholder="Add Task"
            className="flex-1 text-white p-3 bg-transparent outline-none"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddTask();
            }}
          />

          {isFocused && (
            <ArrowUp
              className="mr-3 cursor-pointer"
              onClick={handleAddTask}
            />
          )}

        </div>

      </div>

      {/* RIGHT CARD */}
      <div className="bg-[#161616] flex-1 h-[470px] rounded-2xl p-6 flex flex-col items-center justify-center border-2 border-gray-800">
        <Timer initialTime={50 * 60} />
      </div>

    </div>
  );
});