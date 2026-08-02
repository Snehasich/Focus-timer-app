import { useState } from "react";
import { TaskRoute } from "../components/TaskRoute";
import { TaskRouteTask } from "../components/TaskRoute_Task";

export const TasksPage = () => {
  const [filter, setFilter] = useState("All Tasks");
  const [sortBy, setSortBy] = useState("Default");
  const [bulkAction, setBulkAction] = useState(null);

  return (
    <div className="min-h-screen lg:h-screen w-full box-border flex flex-col overflow-y-auto lg:overflow-hidden p-3 sm:p-5 md:p-6 pb-24 lg:pb-6">
      <div style={{ flexShrink: 0 }}>
        <TaskRoute 
          currentFilter={filter} 
          onFilterChange={setFilter} 
          currentSort={sortBy} 
          onSortChange={setSortBy} 
          onBulkAction={setBulkAction}
        />
      </div>
      <div className="flex-1 flex min-h-0 mt-4 sm:mt-6">
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
