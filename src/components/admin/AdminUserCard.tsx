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
    <li className="bg-red-100 rounded-lg overflow-hidden border-4 border-black shadow-lg">
      <div className="flex justify-between items-center p-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleExpand}
            className="text-lg font-bold hover:text-red-700 transition-colors text-red-900"
            style={{ fontFamily: "'Pirata One', cursive" }}
          >
            {isExpanded ? "▼" : "▶"} {user.email}
          </button>
          <span className="text-sm text-red-900 font-bold">
            {user.role === "ADMIN" ? "🏴‍☠️ Captain" : "⚓ Crew"}
          </span>
          {assignedTasks.length > 0 && (
            <span className="text-xs bg-yellow-400 text-red-900 px-2 py-1 rounded-full font-bold border border-black">
              📜 {assignedTasks.length} mission{assignedTasks.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {user.role === "USER" && (
          <button
            onClick={onMakeAdmin}
            className="px-3 py-1 bg-red-800 text-yellow-400 rounded hover:bg-red-900 transition font-bold shadow border-2 border-black flex items-center gap-2"
            style={{ fontFamily: "'Pirata One', cursive" }}
          >
            <span>🏴‍☠️</span>
            Promote to Captain
          </button>
        )}
      </div>

      {isExpanded && (
        <div className="px-4 pb-4 border-t-4 border-black pt-4 bg-red-50">
          <TasksList
            tasks={assignedTasks}
            onAction={onUnassignTask}
            actionLabel="Unassign"
            actionColor="red"
            emptyMessage="No missions assigned"
            title="📜 Assigned Missions"
          />

          <TasksList
            tasks={unassignedTasks}
            onAction={onAssignTask}
            actionLabel="Assign"
            actionColor="green"
            emptyMessage="No available missions to assign"
            title="📜 Assign New Mission"
          />
        </div>
      )}
    </li>
  );
}

