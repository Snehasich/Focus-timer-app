import { memo, useState, useEffect } from 'react';
import { Timer } from "./Timer/Timer";
import { Plus, ArrowUp } from "lucide-react";
import { InsideTask } from './InsideTask';

export const TaskRouteTask = memo(() => {

  const [isFocused, setIsFocused] = useState(false);
  const [input, setInput] = useState("");
  const [tasks, setTasks] = useState([]);

  // ✅ FETCH tasks from backend
  useEffect(() => {
    fetch("https://your-backend-url.up.railway.app/tasks")
      .then(res => res.json())
      .then(data => setTasks(data));
  }, []);

  // ✅ ADD TASK (POST)
  const handleAddTask = () => {
    if (input.trim() === "") return;

    fetch("https://your-backend-url.up.railway.app/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        text: input,
        completed: false
      })
    })
      .then(res => res.json())
      .then(newTask => {
        setTasks(prev => [...prev, newTask]);
        setInput("");
      });
  };

  // ✅ TOGGLE TASK (PUT)
  const toggleTask = (task) => {
    fetch(`https://your-backend-url.up.railway.app/tasks/${task.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ...task,
        completed: !task.completed
      })
    })
      .then(res => res.json())
      .then(updated => {
        setTasks(tasks.map(t => t.id === updated.id ? updated : t));
      });
  };

  // ✅ DELETE TASK (DELETE)
  const deleteTask = (id) => {
    fetch(`https://your-backend-url.up.railway.app/tasks/${id}`, {
      method: "DELETE"
    }).then(() => {
      setTasks(tasks.filter(task => task.id !== id));
    });
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
        
        {/* ✅ REMOVED task="DSA" */}
        <Timer initialTime={50 * 60} />

      </div>

    </div>
  );
});