import { useState } from "react";
import { TaskRoute } from "../components/TaskRoute";
import { TaskRouteTask } from "../components/TaskRoute_Task";

export const TasksPage = () => {
  const [filter, setFilter] = useState("All Tasks");
  const [sortBy, setSortBy] = useState("Default");
  const [bulkAction, setBulkAction] = useState(null);

  return (
    <div className="h-screen p-3 sm:p-6 box-border flex flex-col">
      <div style={{ marginBottom: "16px" }}>
        <TaskRoute 
          currentFilter={filter} 
          onFilterChange={setFilter} 
          currentSort={sortBy} 
          onSortChange={setSortBy} 
          onBulkAction={setBulkAction}
        />
      </div>
      <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
        <TaskRouteTask 
          filter={filter} 
          sortBy={sortBy} 
          bulkAction={bulkAction}
          onBulkActionProcessed={() => setBulkAction(null)}
        />
      </div>
    </div>
  );
};

export default TasksPage;
