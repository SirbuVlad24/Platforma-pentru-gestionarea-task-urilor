import { Task } from "./types";

interface AdminTaskItemProps {
  task: Task;
  onAction: () => void;
  actionLabel: string;
  actionColor?: "green" | "red";
}

export default function AdminTaskItem({
  task,
  onAction,
  actionLabel,
  actionColor = "green",
}: AdminTaskItemProps) {
  const buttonClass =
    actionColor === "red"
      ? "px-4 py-2 bg-red-700 text-yellow-400 text-sm font-bold rounded-lg border-2 border-red-900 shadow-md hover:bg-red-800 hover:shadow-lg hover:scale-105 transition-all"
      : "px-4 py-2 bg-green-700 text-white text-sm font-bold rounded-lg border-2 border-green-900 shadow-md hover:bg-green-800 hover:shadow-lg hover:scale-105 transition-all";

  const currentTime = new Date();
  const deadlineDate = task.deadline ? new Date(task.deadline) : null;
  const isOverdue = deadlineDate && deadlineDate < currentTime && task.status !== "DONE";
  const timeUntilDeadline = deadlineDate ? deadlineDate.getTime() - currentTime.getTime() : null;
  const isDueSoon = deadlineDate && timeUntilDeadline !== null && timeUntilDeadline > 0 && timeUntilDeadline < 24 * 60 * 60 * 1000;

  return (
    <li className="flex justify-between items-start p-2 bg-white rounded border-2 border-black shadow">
      <div className="flex-1">
        <div>
          <span className="font-bold text-red-900">{task.title}</span>
          <span className="text-xs text-red-800 ml-2 font-semibold">(⚓ Priority: {task.priority})</span>
          {task.status && (
            <span className="ml-2 text-xs bg-purple-300 text-purple-900 px-2 py-0.5 rounded font-semibold">
              {task.status === "TODO" ? "To Do" : task.status === "IN_PROGRESS" ? "In Progress" : "Done"}
            </span>
          )}
          {task.completed && (
            <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded font-semibold">
              Completed
            </span>
          )}
        </div>
        {task.description && (
          <p className="text-sm text-purple-800 mt-1">{task.description}</p>
        )}
        <div className="flex flex-wrap gap-2 mt-2 items-center">
          {task.project && (
            <span className="text-xs bg-blue-100 text-blue-900 px-2 py-1 rounded border border-blue-300 font-semibold">
              🚢 {task.project.name}
            </span>
          )}
          {task.deadline && deadlineDate && (
            <span className={`text-xs px-2 py-1 rounded border border-black font-semibold ${
              isOverdue
                ? "bg-red-300 text-red-900"
                : isDueSoon
                ? "bg-yellow-200 text-yellow-900"
                : "bg-blue-200 text-blue-900"
            }`}>
              ⏰ {deadlineDate.toLocaleString()}
              {isOverdue && " ⚠️ OVERDUE!"}
              {isDueSoon && !isOverdue && " ⚠️ Due Soon!"}
            </span>
          )}
        </div>
      </div>
      <button onClick={onAction} className={`${buttonClass} font-semibold shadow flex-shrink-0`}>
        {actionLabel}
      </button>
    </li>
  );
}

