"use client";

import { User, Task } from "./types";
import TasksList from "./TasksList";

interface AdminUserCardProps {
  user: User;
  isExpanded: boolean;
  assignedTasks: Task[];
  unassignedTasks: Task[];
  onToggleExpand: () => void;
  onMakeAdmin: () => void;
  onAssignTask: (taskId: number) => void;
  onUnassignTask: (taskId: number) => void;
}

export default function AdminUserCard({
  user,
  isExpanded,
  assignedTasks,
  unassignedTasks,
  onToggleExpand,
  onMakeAdmin,
  onAssignTask,
  onUnassignTask,
}: AdminUserCardProps) {
  return (
    <li className="bg-gray-100 rounded-lg overflow-hidden">
      <div className="flex justify-between items-center p-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleExpand}
            className="text-lg font-semibold hover:text-blue-600 transition-colors"
          >
            {isExpanded ? "▼" : "▶"} {user.email}
          </button>
          <span className="text-sm text-gray-500">({user.role})</span>
          {assignedTasks.length > 0 && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
              {assignedTasks.length} task{assignedTasks.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {user.role === "USER" && (
          <button
            onClick={onMakeAdmin}
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Make Admin
          </button>
        )}
      </div>

      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-200 pt-4">
          <TasksList
            tasks={assignedTasks}
            onAction={onUnassignTask}
            actionLabel="Unassign"
            actionColor="red"
            emptyMessage="No tasks assigned"
            title="Assigned Tasks"
          />

          <TasksList
            tasks={unassignedTasks}
            onAction={onAssignTask}
            actionLabel="Assign"
            actionColor="green"
            emptyMessage="No available tasks to assign"
            title="Assign New Task"
          />
        </div>
      )}
    </li>
  );
}

