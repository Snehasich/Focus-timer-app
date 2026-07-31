import { useState } from "react";
import { TaskRoute } from "../components/TaskRoute";
import { TaskRouteTask } from "../components/TaskRoute_Task";

export const TasksPage = () => {
  const [filter, setFilter] = useState("All Tasks");
  const [sortBy, setSortBy] = useState("Default");
  const [bulkAction, setBulkAction] = useState(null);

  return (
    <div className="h-screen box-border flex flex-col overflow-hidden" style={{ padding: "29px 24px 24px" }}>
      <div style={{ flexShrink: 0 }}>
        <TaskRoute 
          currentFilter={filter} 
          onFilterChange={setFilter} 
          currentSort={sortBy} 
          onSortChange={setSortBy} 
          onBulkAction={setBulkAction}
        />
      </div>
      <div style={{ flex: 1, display: "flex", minHeight: 0, marginTop: 30 }}>
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
