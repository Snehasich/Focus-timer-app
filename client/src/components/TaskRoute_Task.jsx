import { memo, useState, useEffect } from "react";
import instance from "../api/axiosInstance";
import { Timer } from "./Timer/Timer";
import { Plus, ArrowUp } from "lucide-react";
import { InsideTask } from "./InsideTask";

export const TaskRouteTask = memo(() => {
  const [isFocused, setIsFocused] = useState(false);
  const [input, setInput] = useState("");
  const [tasks, setTasks] = useState([]);

  // ✅ GET
  const fetchTasks = () => {
    instance.get("/tasks")
      .then(res => setTasks(res.data))
      .catch(console.error);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // ✅ ADD
  const handleAddTask = () => {
    if (!input.trim()) return;

    instance.post("/tasks", {
      text: input,
      completed: false
    }).then(() => {
      fetchTasks();
      setInput("");
    });
  };

  // ✅ UPDATE
  const toggleTask = (task) => {
    instance.put(`/tasks/${task.id}`, {
      ...task,
      completed: !task.completed
    }).then(fetchTasks);
  };

  // ✅ DELETE
  const deleteTask = (id) => {
    instance.delete(`/tasks/${id}`)
      .then(fetchTasks);
  };

  return (
    <div className="flex gap-6 w-[96%] mt-3">

      <div className="bg-[#161616] w-[370px] h-[470px] p-4 rounded-2xl">
        <header className="text-white text-xl">Today</header>

        <InsideTask
          tasks={tasks}
          toggleTask={toggleTask}
          deleteTask={deleteTask}
        />

        <div className="flex mt-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 p-2 bg-gray-800 text-white"
          />
          <button onClick={handleAddTask}>Add</button>
        </div>
      </div>

      <div className="flex-1">
        <Timer initialTime={50 * 60} />
      </div>

    </div>
  );
});